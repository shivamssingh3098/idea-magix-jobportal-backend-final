import mongoose, { Schema } from "mongoose";

const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
    index: true,
  },
  level: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },

  isInstructorAssigned: {
    type: Boolean,
    default: false,
  },
  batches: [
    {
      date: { type: String },
      time: { type: String },
    },
  ],
  assignedInstructor: {
    type: Schema.Types.ObjectId,
    ref: "Instructor",
  },

  lecture: {
    type: Schema.Types.ObjectId,
    ref: "Lecture",
  },
});
