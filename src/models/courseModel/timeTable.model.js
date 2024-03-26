import mongoose, { Schema } from "mongoose";
const timeTableSchema = new Schema({
  date: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
});

export const TimeTable = mongoose.model("TimeTable", timeTableSchema);
