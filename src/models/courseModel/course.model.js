import mongoose, { Schema } from "mongoose";
const courseSchema = new Schema(
  {
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
      // required: true,
    },
    imagePublicId: {
      type: String,
    },
    isInstructorAssigned: {
      type: Boolean,
      default: false,
    },
    assignedInstructor: {
      type: Schema.Types.ObjectId,
      ref: "Instructor",
    },

    courseVideos: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    // upcomingClasses: [{ type: Schema.Types.ObjectId, ref: "UpcomingClass" }],

    batch: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
  },
  { timestamps: true }
);

export const Course = mongoose.model("Course", courseSchema);
