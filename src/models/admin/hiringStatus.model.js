import mongoose, { Schema } from "mongoose";

const hiringStatusSchema = Schema({
  candidate: {
    type: Schema.Types.ObjectId,
    ref: "Candidate",
  },
  jobId: {
    type: Schema.Types.ObjectId,
    ref: "Job",
  },
  status: {
    type: String,
    enum: ["pending", "rejected", "accepted"],
    default: "pending",
  },
  reason: {
    type: String,
  },
  resume: {
    type: String,
  },
});
export const HiringStatus = mongoose.model("HiringStatus", hiringStatusSchema);
