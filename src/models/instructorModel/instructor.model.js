import mongoose, { Schema } from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const instructorSchema = Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      validate: [validator.isEmail],
      required: [true, "Instructor email required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "password required"],
    },
    mobile: {
      type: String,
      required: [true, "Instructor phone number required"],
      trim: true,
      index: true,
      unique: true,
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    // isBlocked: {
    //   type: Boolean,
    //   default: false,
    // },
    // isApproved: {
    //   type: Boolean,
    //   default: false,
    // },
    profilePhoto: {
      type: String,
      default: "",
    },
    profilePhotoPublicId: {
      type: String,
      default: "",
    },
    qualification: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },
    completeAddress: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
    },
    assignedCourse: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    createdVideos: [{ type: Schema.Types.ObjectId, ref: "Video" }],

    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

instructorSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

instructorSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

instructorSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      mobile: this.mobile,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

instructorSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const Instructor = mongoose.model("Instructor", instructorSchema);
