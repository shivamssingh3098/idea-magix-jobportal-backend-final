import mongoose, { Schema } from "mongoose";

const companyDetailSchema = Schema({
  name: { type: String, required: true },
  candidate: [
    {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
    },
  ],

  job: [
    {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
  ],

  address: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
});
export const Company = mongoose.model("Company", companyDetailSchema);
