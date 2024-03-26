import mongoose, { Schema } from "mongoose";

const batchSchema = new Schema({
  batchName: {
    type: String,
    required: true,
    trim: true,
  },
  batchId: {
    type: String,  
    required: true,
    trim: true,
    unique: true,
  },
  max_student: {
    type: Number,
    default: 0,
    required: true,
  },
  time_table: {
    type: Schema.Types.ObjectId,
    ref: "TimeTable",
  },
});

export const Batch = mongoose.model("Batch", batchSchema);
