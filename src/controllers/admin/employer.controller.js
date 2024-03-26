import { Employer } from "../../models/admin/admin.models.js";
import { Company } from "../../models/admin/companyDetails.js";
import { Job } from "../../models/admin/createJob.model.js";
import { HiringStatus } from "../../models/admin/hiringStatus.model.js";
import { AppError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import nodemailer from "nodemailer";
const registerEmployer = asyncHandler(async (req, res, next) => {
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

    const exitedAdmin = await Employer.findOne({
      $or: [{ mobile }, { email }],
    });

    if (exitedAdmin) {
      return next(new AppError("This Employer already exists", 400));
    }

    const admin = await Employer.create({
      fullName,
      email,
      mobile,
      gender,

      password,
    });

    const createdAdmin = await Employer.findById(admin._id).select(
      "-password -refreshToken"
    );

    if (!createdAdmin) {
      return next(
        new AppError("Something went wrong while registering admin", 500)
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdAdmin, "Admin created successfully"));
  } catch (error) {
    console.log("Error while registering admin and staff", error);
    return next(new AppError("Error while registering admin or staff", 400));
  }
});

const generateAccessTokenAndRefreshToken = async (id) => {
  const admin = await Employer.findById(id);
  const accessToken = await admin.generateAccessToken();
  const refreshToken = await admin.generateRefreshToken();
  admin.refreshToken = refreshToken;
  admin.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};
const loginEmployer = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      return next(new AppError("Email and password is required", 404));
    }
    console.log("Admin login data", email, password);
    const admin = await Employer.findOne({ email: email });
    if (!admin) {
      return next(new AppError("Admin not found", 404));
    }

    const isPasswordValid = await admin.isPasswordCorrect(password);
    console.log("Admin", admin);
    if (!isPasswordValid) {
      return next(new AppError("Invalid admin credentials", 401));
    }
    console.log("isPasswordValid", isPasswordValid);
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(admin._id);

    const loggedInAdmin = await Employer.findById(admin._id).select(
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
          { data: loggedInAdmin, accessToken, refreshToken },
          "Logged in successfully"
        )
      );
  } catch (error) {
    console.log("Error while login admin or staff", error);
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const admin = await Employer.findById(req.admin?._id);
    const isPasswordCorrect = await admin.isPasswordCorrect(oldPassword);
    console.log("isPasswordCorrect", isPasswordCorrect);
    if (!isPasswordCorrect) {
      return next(new AppError("Invalid old password", 401));
    }
    admin.password = newPassword;
    await admin.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    console.log(error);
  }
});

const currentEmployer = asyncHandler(async (req, res) => {
  try {
    const currentAdmin = req.admin;
    console.log("currentAdmin", currentAdmin);
    res.status(200).json({
      status: "success",
      message: "Admin logged in successfully",
      admin: currentAdmin,
    });
  } catch (error) {
    console.log("Current user is not available", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});

const logoutEmployer = asyncHandler(async (req, res, next) => {
  try {
    const admin = await Employer.findByIdAndUpdate(
      req.admin._id,
      { $set: { refreshToken: null } },
      { new: true }
    );
    console.log("Logged out admin", admin);
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "Admin logged out successfully"));
  } catch (error) {
    console.log("Error while logout admin or staff", error);
  }
});

const createCompany = asyncHandler(async (req, res, next) => {
  try {
    const { name, address, city } = req.body;

    if ([name, address, city].some((field) => field?.trim() === "")) {
      return next(new AppError("All Fields are required", 400));
    }

    const employer = await Employer.findById(req.admin._id);

    const company = await Company.create({
      name,
      address,
      city,
    });

    employer.company = employer.company.push(company._id);

    await employer.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, company, "company  created successfully"));
  } catch (error) {
    console.log("error while creating company", error);
  }
});

const createJob = asyncHandler(async (req, res, next) => {
  try {
    const {
      jobTitle,
      jobCategory,
      jobType,
      skills,
      minExperience,
      company,
      salary,
      description,
    } = req.body;

    if (
      [jobTitle, jobCategory, jobType, skills].some(
        (field) => field?.trim() === ""
      )
    ) {
      return next(new AppError("All Fields are required", 400));
    }

    const job = await Job.create({
      jobTitle,
      jobCategory,
      jobType,
      skills,
      minExperience,
      company,
      salary,
      description,
    });

    const companyDetails = await Company.findById(company);
    companyDetails.job = companyDetails.job.push(job._id);

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
      to: req.admin.email, // list of receivers
      subject: "Job posted successfully ✔", // Subject line
      text: "mai to bdiya hu yar tum btao", // plain text body
      html: "Job posted successfully", // html body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // res.send("done");
    console.log("Message sent: %s", info);

    await companyDetails.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, job, "Job created successfully"));
  } catch (error) {
    console.log("error while creating company", error);
  }
});

const editJob = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      jobTitle,
      jobCategory,
      jobType,
      skills,
      minExperience,

      salary,
      description,
    } = req.body;
    const jobStatus = await Job.findByIdAndUpdate(
      id,
      {
        $set: {
          jobTitle,
          jobCategory,
          jobType,
          skills,
          minExperience,

          salary,
          description,
        },
      },
      { new: true }
    );

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
      to: req.admin.email, // list of receivers
      subject: "Job request accepted  ✔", // Subject line
      text: "mai to bdiya hu yar tum btao", // plain text body
      html: "Job Edited successfully", // html body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // res.send("done");
    console.log("Message sent: %s", info);

    return res
      .status(200)
      .json(new ApiResponse(200, jobStatus, "job request successfully"));
  } catch (error) {
    console.log("Error while changing the status", error);
  }
});

const getAllJobRequest = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    // const data = await Job.findById(id).populate({
    //   path: "appliedCandidates",
    //   populate: "appliedJobsStatus",
    // });

    const data = await Job.findById(id).populate({
      path: "appliedCandidates",
      // match: { _id: candidateId },
      populate: {
        path: "appliedJobsStatus",
        match: { jobId: id },
      },
    });

    console.log("job request data", data);
    return res
      .status(200)
      .json(new ApiResponse(200, data, "job request successfully"));
  } catch (error) {
    console.log("Error while changing the status", error);
  }
});
const changeJobsStatus = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;

    const jobStatus = await HiringStatus.findByIdAndUpdate(
      id,
      {
        $set: { status: "accepted" },
      },
      { new: true }
    );

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
      to: req.admin.email, // list of receivers
      subject: "Job request accepted  ✔", // Subject line
      text: "mai to bdiya hu yar tum btao", // plain text body
      html: "Job request accepted", // html body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // res.send("done");
    console.log("Message sent: %s", info);

    return res
      .status(200)
      .json(new ApiResponse(200, jobStatus, "job request successfully"));
  } catch (error) {
    console.log("Error while changing the status", error);
  }
});
const rejectJobsStatus = asyncHandler(async (req, res, next) => {
  try {
    // const { id } = req.params;
    const { reason, statusId } = req.body;

    if ([reason].some((field) => field?.trim() === "")) {
      return next(new AppError("Reason Fields are required", 400));
    }
    console.log("reason", reason);
    const jobStatus = await HiringStatus.findByIdAndUpdate(
      statusId,
      {
        $set: { status: "rejected", reason: reason },
      },
      { new: true }
    );

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
      to: req.admin.email, // list of receivers
      subject: "Job request rejected  ✔", // Subject line
      text: "mai to bdiya hu yar tum btao", // plain text body
      html: reason, // html body
    });
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // res.send("done");
    console.log("Message sent: %s", info);

    return res
      .status(200)
      .json(new ApiResponse(200, jobStatus, "job request successfully"));
  } catch (error) {
    console.log("Error while changing the status", error);
  }
});

const getCompany = asyncHandler(async (req, res, next) => {
  try {
    const allCompany = await Employer.findById(req.admin._id).populate({
      path: "company",
      populate: "job",
    });
    return res
      .status(200)
      .json(new ApiResponse(200, allCompany, "All Company"));
  } catch (error) {
    console.log("Error while getting company", error);
  }
});

export {
  registerEmployer,
  loginEmployer,
  changeCurrentPassword,
  currentEmployer,
  logoutEmployer,
  createCompany,
  createJob,
  getAllJobRequest,
  changeJobsStatus,
  rejectJobsStatus,
  editJob,
  getCompany,
};
