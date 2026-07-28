const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    cvText: {
      type: String,
    },
    jobCriteria: {
      type: String,
      trim: true,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weaknesses: {
      type: [String],
      default: [],
    },
    matchScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    imageData: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

analysisSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Analysis", analysisSchema);
