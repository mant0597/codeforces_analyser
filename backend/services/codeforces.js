const axios = require("axios");
const Submission = require("../models/SubmissionModel");

async function fetchAndSaveSubmissions(handle) {
  try {
    const res = await axios.get("https://codeforces.com/api/user.status", {
      params: { handle, from: 1, count: 1000 }
    });

    if (res.data.status !== "OK") {
      throw new Error("Codeforces API error");
    }

    const submissions = res.data.result;

    for (let sub of submissions) {
      const problem = sub.problem || {};
      await Submission.updateOne(
  { handle, contestId: sub.contestId, index: problem.index, creationTime: sub.creationTimeSeconds },
  { $setOnInsert: { 
      name: problem.name,
      rating: problem.rating,
      tags: problem.tags,
      verdict: sub.verdict,
      programmingLanguage: sub.programmingLanguage,
      creationTime: sub.creationTimeSeconds,
  }},
  { upsert: true }
);
    }

    return { success: true, message: `${submissions.length} submissions processed.` };

  } catch (err) {
    console.error("Error fetching submissions:", err);
    return { success: false, message: "Failed to fetch submissions" };
  }
}

module.exports = { fetchAndSaveSubmissions };
