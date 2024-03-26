import { Employer } from "../../models/admin/admin.models.js";
import { Candidate } from "../../models/candidate/condidate.model.js";
import { AppError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

import nodemailer from "nodemailer";
import { generateUniqueId } from "../../utils/generateUniqueId.js";
import { Company } from "../../models/admin/companyDetails.js";
import { HiringStatus } from "../../models/admin/hiringStatus.model.js";
import { Job } from "../../models/admin/createJob.model.js";

const registerCandidate = asyncHandler(async (req, res, next) => {
  try {
    const { fullName, email, mobile, gender, password } = req.body;

    console.log(
      "admin or staff",
      fullName,
      email,
      mobile,
      gender,

      password
    );

    if (
      [fullName, email, mobile, gender, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      return next(new AppError("All Fields are required", 400));
    }

    const exitedCandidate = await Candidate.findOne({
      $or: [{ mobile }, { email }],
    });

    if (exitedCandidate) {
      return next(new AppError("This Employer already exists", 400));
    }

    const candidate = await Candidate.create({
      fullName,
      email,
      mobile,
      gender,

      password,
    });

    const createdCandidate = await Candidate.findById(candidate._id).select(
      "-password -refreshToken"
    );

    if (!createdCandidate) {
      return next(
        new AppError("Something went wrong while registering admin", 500)
      );
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createdCandidate,
          "createdCandidate created successfully"
        )
      );
  } catch (error) {
    console.log("Error while registering createdCandidate", error);
    return next(new AppError("Error while registering createdCandidate", 400));
  }
});

const generateAccessTokenAndRefreshToken = async (id) => {
  const candidate = await Candidate.findById(id);
  const accessToken = await candidate.generateAccessToken();
  const refreshToken = await candidate.generateRefreshToken();
  candidate.refreshToken = refreshToken;
  candidate.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};
const loginCandidate = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      return next(new AppError("Email and password is required", 404));
    }
    console.log("Admin login data", email, password);
    const candidate = await Candidate.findOne({ email: email });
    if (!candidate) {
      return next(new AppError("candidate not found", 404));
    }

    const isPasswordValid = await candidate.isPasswordCorrect(password);
    console.log("Candidate", candidate);
    if (!isPasswordValid) {
      return next(new AppError("Invalid Candidate credentials", 401));
    }
    console.log("isPasswordValid", isPasswordValid);
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(candidate._id);

    const loggedInCandidate = await Candidate.findById(candidate._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: true,
    };
    console.log("accessToken, refreshToken", accessToken, refreshToken);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { data: loggedInCandidate, accessToken, refreshToken },
          "Logged in successfully"
        )
      );
  } catch (error) {
    console.log("Error while login Candidate", error);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const candidate = await Candidate.findById(req.candidate?._id);
    const isPasswordCorrect = await candidate.isPasswordCorrect(oldPassword);
    console.log("isPasswordCorrect", isPasswordCorrect);
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid old password", 401));
    }
    candidate.password = newPassword;
    await candidate.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    console.log(error);
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    const candidate = await Candidate.findOne({ email: email });

    if (!candidate) {
      return next(new AppError("This email not registered", 401));
    }
    console.log("password is ", candidate);

    console.log("candidate email is ", email);

    let password = generateUniqueId();

    candidate.password = password;

    // send mail with defined transport object
    await candidate.save({ validateBeforeSave: false });
    const transporter = await nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "isaias55@ethereal.email",
        pass: "qPWX3n2Mfe6jXTHfVp",
      },
    });

    const info = await transporter.sendMail({
      from: '"Shivam Singh 👻" <shivamssingh3098@gmail.com>', // sender address
      to: email, // list of receivers
      subject: "your new password ✔", // Subject line
      text: "mai to bdiya hu yar tum btao", // plain text body
      html: password, // html body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // res.send("done");
    console.log("Message sent: %s", info);

    // candidate.password = newPassword;
    // await candidate.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    console.log(error);
  }
});

const currentCandidate = asyncHandler(async (req, res) => {
  try {
    const currentCandidate = req.candidate;
    console.log("currentCandidate", currentCandidate);
    res.status(200).json({
      status: "success",
      message: "Candidate logged in successfully",
      admin: currentCandidate,
    });
  } catch (error) {
    console.log("Current user is not available", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

const logoutCandidate = asyncHandler(async (req, res, next) => {
  try {
    const candidate = await Candidate.findByIdAndUpdate(
      req.candidate._id,
      { $set: { refreshToken: null } },
      { new: true }
    );
    console.log("Logged out admin", candidate);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "candidate logged out successfully"));
  } catch (error) {
    console.log("Error while logout admin or staff", error);
  }
});

const getAllJobs = asyncHandler(async (req, res, next) => {
  try {
    const allJobs = await Company.find().populate({ path: "job" });
    res.status(200).json({
      status: "success",
      message: "Candidate logged in successfully",
      jobs: allJobs,
    });
  } catch (error) {
    console.log("Error while getting jobs", error);
  }
});

const applyForJobs = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidateId = req.candidate._id;
    const candidate = await Candidate.findById(candidateId);
    console.log("jobId", id);
    const job = await Job.findById(id);
    console.log("isApplied", job);

    const isApplied = job.appliedCandidates.includes(candidateId);

    if (isApplied) {
      return next(new AppError("Candidate already applied", 404));
    }

    job.appliedCandidates = job.appliedCandidates.push(candidateId);

    await job.save({ validateBeforeSave: false });

    const hiringStatus = await HiringStatus.create({
      candidate: candidateId,
      jobId: id,
      resume: "Not available",
    });

    console.log("Job saved successfully", hiringStatus._id);

    candidate.appliedJobsStatus = candidate.appliedJobsStatus.push(
      hiringStatus._id
    );

    await candidate.save({ validateBeforeSave: false });

    const transporter = await nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      auth: {
        user: "isaias55@ethereal.email",
        pass: "qPWX3n2Mfe6jXTHfVp",
      },
    });

    const info = await transporter.sendMail({
      from: '"Shivam Singh 👻" <shivamssingh3098@gmail.com>', // sender address
      to: req.candidate.email, // list of receivers
      subject: "Application successfully submitted", // Subject line
      text: "mai to bdiya hu yar tum btao", // plain text body
      html: "Application successfully submitted", // html body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return res
      .status(200)
      .json(
        new ApiResponse(200, hiringStatus, "Password updated successfully")
      );
  } catch (error) {
    console.log("error while applying jobs", error);
  }
});

const currentCandidateProfile = asyncHandler(async (req, res, next) => {
  try {
    const allJobs = await Candidate.findById(req.candidate._id).populate({
      path: "appliedJobsStatus",
    });
    res.status(200).json({
      status: "success",
      message: "Candidate logged in successfully",
      jobs: allJobs,
    });
  } catch (error) {
    console.log("Error while getting jobs", error);
  }
});

const candidateJobStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const jobStatus = await HiringStatus.findOne({
      jobId: id,
      candidate: req.candidate._id,
    });

    return res.status(200).json(new ApiResponse(200, jobStatus, "job status "));
  } catch (error) {
    console.log("Error while getting jobs status", error);
  }
});

export {
  registerCandidate,
  loginCandidate,
  changeCurrentPassword,
  currentCandidate,
  logoutCandidate,
  forgotPassword,
  getAllJobs,
  applyForJobs,
  currentCandidateProfile,
  candidateJobStatus,
};
