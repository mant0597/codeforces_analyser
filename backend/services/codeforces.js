const axios = require("axios");
const User = require("../models/UserModel");

async function fetchAndSaveSubmissions(handle) {
  try {
    const res = await axios.get("https://codeforces.com/api/user.status", {
      params: { handle, from: 1, count: 1000 }
    });

    if (res.data.status !== "OK") {
      throw new Error("Codeforces API error");
    }

    const submissions = res.data.result.map(sub => ({
      contestId: sub.contestId,
      index: sub.problem?.index,
      name: sub.problem?.name,
      rating: sub.problem?.rating,
      tags: sub.problem?.tags,
      verdict: sub.verdict,
      programmingLanguage: sub.programmingLanguage,
      creationTime: sub.creationTimeSeconds
    }));

    await User.updateMany(
      { codeforces_id: handle },
      { $set: { submissions } }
    );

    return { success: true, message: `${submissions.length} submissions saved to user.` };
  } catch (err) {
    console.error("Error fetching submissions:", err);
    return { success: false, message: "Failed to fetch submissions" };
  }
}

module.exports = { fetchAndSaveSubmissions };
