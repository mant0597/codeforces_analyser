const express=require("express");
const mongoose=require("mongoose");
const User=require("./models/UserModel");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken")
const axios = require("axios");
const { fetchAndSaveSubmissions } = require("./services/codeforces");
const authMiddleware = require("./middleware/auth");
const Submission = require("./models/UserModel");
const app=express();
const cors = require('cors');
app.use(cors());
app.use(express.json());
const JWT_SECRET="codeforcesvisualiserfordsa"
const connectDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/codeforces");
    console.log("Database connected successfully");
  } catch (err) {
    console.log("Error", err);
    process.exit(1); 
  }
};
connectDB();
app.post("/signup", async (req, res) => {
  try {
    const { email, username, password, codeforces_id } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }, { codeforces_id }] });
    if (existingUser) return res.status(409).json("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Fetch submissions from Codeforces
    const resSub = await axios.get("https://codeforces.com/api/user.status", {
      params: { handle: codeforces_id, from: 1, count: 1000 }
    });

    const submissions = (resSub.data.status === "OK"
      ? resSub.data.result.map(sub => ({
          contestId: sub.contestId,
          index: sub.problem?.index,
          name: sub.problem?.name,
          rating: sub.problem?.rating,
          tags: sub.problem?.tags,
          verdict: sub.verdict,
          programmingLanguage: sub.programmingLanguage,
          creationTime: sub.creationTimeSeconds
        }))
      : []
    );

    const user = new User({
      email,
      username,
      password: hashedPassword,
      codeforces_id,
      submissions
    });

    await user.save();

    res.status(200).json({ success: true, message: "Registered Successfully", submissionsCount: submissions.length });
  } catch (err) {
    console.log("Signup error", err);
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post("/signin",async (req,res)=>{
    try{
    const {email,password}=req.body;
    const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token=jwt.sign({id:user._id,email:user.email},JWT_SECRET,{expiresIn:'2h'})
        res.status(200).json({success:true,message:"Logged in Successfully",token:token, user: {
        email: user.email,
        codeforces_id: user.codeforces_id,
        streak: user.streak || 0,
      },})
    }catch(err){
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
})
app.get("/codeforces/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const handle = user.codeforces_id;

    const [info, rating] = await Promise.all([
      axios.get(`https://codeforces.com/api/user.info?handles=${handle}`),
      axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`)
    ]);

    res.json({
      handle: handle,
      info: info.data.result[0],
      ratingHistory: rating.data.result,
      submissions: user.submissions 
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Error fetching Codeforces data" });
  }
});

app.get("/fetch/:handle",authMiddleware, async (req, res) => {
  const { handle } = req.params;
  const result = await fetchAndSaveSubmissions(handle);
  res.json(result);
});
app.get("/analysis/:handle", authMiddleware, async (req, res) => {
  const user = await User.findOne({ codeforces_id: req.params.handle });
  if (!user) return res.status(404).json({ message: "User not found" });

  const topicsMap = {};
  user.submissions.forEach(sub => {
    if (!sub.tags) return;
    sub.tags.forEach(tag => {
      if (!topicsMap[tag]) topicsMap[tag] = { solved: 0, attempts: 0 };
      topicsMap[tag].attempts += 1;
      if (sub.verdict === "OK") topicsMap[tag].solved += 1;
    });
  });

  const topics = Object.keys(topicsMap).map(tag => ({
    topic: tag,
    attempts: topicsMap[tag].attempts,
    solved: topicsMap[tag].solved,
    successRate: topicsMap[tag].solved / topicsMap[tag].attempts
  }));

  res.json({ success: true, topics });
});

app.get("/rating/:handle", async (req, res) => {
  const { handle } = req.params;
  try {
    const response = await axios.get(`https://codeforces.com/api/user.rating?handle=${handle}`);
    if (response.data.status !== "OK") {
      return res.status(400).json({ success: false, message: "Could not fetch rating history" });
    }

    const ratingHistory = response.data.result.map(contest => ({
      contestId: contest.contestId,
      contestName: contest.contestName,
      rank: contest.rank,
      oldRating: contest.oldRating,
      newRating: contest.newRating,
      ratingChange: contest.newRating - contest.oldRating,
      ratingDate: new Date(contest.ratingUpdateTimeSeconds * 1000)
    }));

    res.json({ success: true, ratingHistory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.get("/difficulty/:handle", async (req, res) => {
  const { handle } = req.params;
  try {
    const result = await User.aggregate([
      { $match: { codeforces_id: handle } },
      { $unwind: "$submissions" },
      { $match: { "submissions.rating": { $exists: true } } },
      {
        $group: {
          _id: "$submissions.rating",
          total: { $sum: 1 },
          solved: { $sum: { $cond: [{ $eq: ["$submissions.verdict", "OK"] }, 1, 0] } }
        }
      },
      {
        $project: {
          rating: "$_id",
          attempts: "$total",
          solved: 1,
          successRate: { $divide: ["$solved", "$total"] }
        }
      },
      { $sort: { rating: 1 } }
    ]);

    res.json({ success: true, difficulties: result });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error in difficulty analysis" });
  }
});

app.get("/activity/:handle", async (req, res) => {
  const { handle } = req.params;
  try {
    const result = await User.aggregate([
      { $match: { codeforces_id: handle } },
      { $unwind: "$submissions" },
      { $match: { "submissions.verdict": "OK" } },
      {
        $addFields: {
          creationDate: { $toDate: { $multiply: ["$submissions.creationTime", 1000] } }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$creationDate" },
            month: { $month: "$creationDate" },
            day: { $dayOfMonth: "$creationDate" }
          },
          solved: { $sum: 1 }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          solved: 1,
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    res.json({ success: true, activity: result });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error in activity tracking" });
  }
});

app.get("/solved/:handle", async (req, res) => {
  const { handle } = req.params;

  try {
    const result = await User.aggregate([
      { $match: { codeforces_id: handle } },      
      { $unwind: "$submissions" },                  
      { $match: { "submissions.verdict": "OK" } }, 
      { $group: { 
          _id: { 
            contestId: "$submissions.contestId", 
            index: "$submissions.index" 
          } 
      }},
      { $count: "solvedCount" }                    
    ]);

    res.json({
      success: true,
      solvedCount: result[0]?.solvedCount || 0
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error fetching solved count" });
  }
});

app.get("/streak/:handle", async (req, res) => {
  const { handle } = req.params;

  try {
    const result = await User.aggregate([
      { $match: { codeforces_id: handle } },
      { $unwind: "$submissions" },
      { $match: { "submissions.verdict": "OK" } },
      {
        $addFields: {
          creationDate: { $toDate: { $multiply: ["$submissions.creationTime", 1000] } }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$creationDate" },
            month: { $month: "$creationDate" },
            day: { $dayOfMonth: "$creationDate" }
          }
        }
      },
      {
        $project: {
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          _id: 0
        }
      },
      { $sort: { date: 1 } }
    ]);

    const dates = result.map(r => new Date(r.date));
    let currentStreak = 0;
    let longestStreak = 0;
    let streak = 1;

    if (dates.length > 0) {
      let today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = dates.length - 1; i >= 0; i--) {
        const diff = (today - dates[i]) / (1000 * 60 * 60 * 24);
        if (diff === 0 || diff === 1) {
          currentStreak++;
          today = dates[i];
        } else if (diff > 1) break;
      }
      for (let i = 1; i < dates.length; i++) {
        const diff = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) streak++;
        else {
          longestStreak = Math.max(longestStreak, streak);
          streak = 1;
        }
      }
      longestStreak = Math.max(longestStreak, streak);
    }

    const currentYear = new Date().getFullYear();
    const activeDaysCurrentYear = dates.filter(d => d.getFullYear() === currentYear).length;

    res.json({
      success: true,
      currentStreak,
      longestStreak,
      activeDaysCurrentYear
    });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: "Error in streak calculation" });
  }
});


app.listen(3000,()=>{
    console.log("Port running on 3000")
})