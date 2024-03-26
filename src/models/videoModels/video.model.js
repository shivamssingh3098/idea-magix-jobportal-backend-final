import mongoose, { Schema, mongo } from "mongoose";

const lectureSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // thumbnail: {
    //   // coudinary url
    //   type: String,
    //   required: true,
    // },
    // thumbnailPublicId: {
    //   type: String,
    //   required: true,
    // },
    // videoUrl: {
    //   type: String,
    //   // required: true,
    // },
    // videoPublicId: {
    //   type: String,
    // },

    // duration: {
    //   type: String,
    //   // required: true,
    // },
    description: {
      type: String,
      required: true,
    },
    // isPublished: {
    //   type: Boolean,
    //   default: false,
    // },
    course: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    // createdBy: {
    //   type: Schema.Types.ObjectId,
    //   ref: "Instructor",
    // },
    // studyMaterial: {
    //   type: Schema.Types.ObjectId,
    //   ref: "StudyMaterial",
    // },
    // views: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Student",
    //   },
    // ],
  },
  { timestamps: true }
);

export const Lecture = mongoose.model("Lecture", lectureSchema); // befroe id was video schema
