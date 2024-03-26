import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const studentSchema = Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      validate: [validator.isEmail],
      required: [true, "Student email required "],
      unique: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, "Student phone number required"],
      trim: true,
      index: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },

    standard: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    profilePhoto: {
      type: String,
      default: "",
    },
    profilePhotoPublicId: {
      type: String,
      default: "",
    },

    fatherName: {
      type: String,
      trim: true,
    },
    spouse: {
      type: String,
      trim: true,
    },

    completeAddress: {
      type: String,
      trim: true,
    },
    isPurchased: {
      type: Boolean,
      default: false,
    },
    purchasedCourses: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

studentSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      mobile: this.mobile,
      fullName: this.fullName,
      isPurchased: this.isPurchased,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const Student = mongoose.model("Student", studentSchema);
