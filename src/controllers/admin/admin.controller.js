import { Admin } from "../../models/adminModel/admin.model.js";
import { AppError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const registerAdminAndStaff = asyncHandler(async (req, res, next) => {
  try {
    const { fullName, email, mobile, gender, loginType, password } = req.body;

    console.log(
      "admin or staff",
      fullName,
      email,
      mobile,
      gender,
      loginType,
      password
    );

    if (
      [fullName, email, mobile, gender, loginType, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      return next(new AppError("All Fields are required", 400));
    }

    const exitedAdmin = await Admin.findOne({ $or: [{ mobile }, { email }] });

    if (exitedAdmin) {
      return next(new AppError("This admin already exists", 400));
    }

    const admin = await Admin.create({
      fullName,
      email,
      mobile,
      gender,
      loginType,
      password,
    });

    const createdAdmin = await Admin.findById(admin._id).select(
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
  const admin = await Admin.findById(id);
  const accessToken = await admin.generateAccessToken();
  const refreshToken = await admin.generateRefreshToken();
  admin.refreshToken = refreshToken;
  admin.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};
const loginAdminOrStaff = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      return next(new AppError("Email and password is required", 404));
    }
    console.log("Admin login data", email, password);
    const admin = await Admin.findOne({ email: email });
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

    const loggedInAdmin = await Admin.findById(admin._id).select(
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

const currentAdmin = asyncHandler(async (req, res) => {
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

const logoutAdminOrStaff = asyncHandler(async (req, res, next) => {
  try {
    const admin = await Admin.findByIdAndUpdate(
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

export {
  registerAdminAndStaff,
  loginAdminOrStaff,
  currentAdmin,
  logoutAdminOrStaff,
};
