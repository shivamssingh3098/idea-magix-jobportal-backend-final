import mongoose, { Schema, model } from "mongoose";
const upcomingClassSchema = Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String, // cloudinary Url
      required: true,
    },
    meetLink: { type: String, required: true },
    description: {
      type: String,
      required: true,
    },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
    },
  },
  { timestamps: true }
);
export const UpcomingClass = mongoose.model(
  "UpcomingClass",
  upcomingClassSchema
);
