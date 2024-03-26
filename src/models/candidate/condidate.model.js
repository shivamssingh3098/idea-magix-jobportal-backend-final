import mongoose, { Schema } from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const candidateSchema = Schema(
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
    mobile: {
      type: String,
      required: [true, "Instructor phone number required"],
      trim: true,
      index: true,
      unique: true,
    },
    gender: {
      type: String,

      enum: ["male", "female", "other"],
    },
    appliedJobsStatus: [
      {
        type: Schema.Types.ObjectId,
        ref: "HiringStatus",
      },
    ],

    // job: [
    //   {
    //     type: Schema.Types.ObjectId,
    //     ref: "Job",
    //   },
    // ],

    password: {
      type: String,
      required: [true, "password required"],
    },
  },
  { timestamps: true }
);

candidateSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

candidateSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

candidateSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      fullName: this.fullName,
      email: this.email,
      mobile: this.mobile,
      loginType: this.loginType,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

candidateSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

export const Candidate = mongoose.model("Candidate", candidateSchema);
