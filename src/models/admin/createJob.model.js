import mongoose, { Schema } from "mongoose";

const createJobSchema = Schema({
  jobTitle: {
    type: String,
    required: true,
  },
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  jobCategory: {
    type: String,
    enum: ["IT", "Non-IT"], // Predefined values for the enum
    default: "IT",
  },
  jobType: {
    type: String,
    enum: ["full-time", "part-time", "work-from-home"], // Predefined values for the enum
    default: "full-time",
  },
  skills: {
    type: String,
    required: true,
  },
  minExperience: {
    type: Number,
    required: true,
  },
  salary: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  appliedCandidates: [
    {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
    },
  ],
});
export const Job = mongoose.model("Job", createJobSchema);
