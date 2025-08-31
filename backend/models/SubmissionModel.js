const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  handle: { type: String, required: true },
  contestId: Number,
  index: String,
  name: String,
  rating: Number,
  tags: [String],
  verdict: String,
  programmingLanguage: String,
  creationTime: Number,
}, { timestamps: true });

submissionSchema.index({ handle: 1, contestId: 1, index: 1, creationTime: 1 }, { unique: true });

module.exports = mongoose.model("Submission", submissionSchema);
