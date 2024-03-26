// import { verifyFirebaseToken } from "../../config/firebase.js";
import { Instructor } from "../../models/instructorModel/instructor.model.js";
import { AppError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";

const instructorRegistration = asyncHandler(async (req, res, next) => {
  try {
    const { fullName, email, mobile, gender, qualification, city, password } =
      req.body;
    if (
      [fullName, email, mobile, gender, qualification, city, password].some(
        (field) => field?.trim() === ""
      )
    ) {
      return next(new AppError("All Fields are required", 404));
    }

    const existedInstructor = await Instructor.findOne({
      $or: [{ mobile }, { email }],
    });

    console.log(fullName, email, mobile, gender, qualification, city);
    if (existedInstructor) {
      return next(new AppError("Instructor already existed", 404));
    }

    const instructor = await Instructor.create({
      fullName,
      email,
      mobile,
      gender,
      qualification,
      city,
      password,
    });

    console.log("Instructor registered successfully", instructor);
    res
      .status(200)
      .json(
        new ApiResponse(200, instructor, "Instructor registered successfully")
      );
  } catch (error) {
    console.log("An error occurred while registering instructor", error);
  }
});
const generateAccessTokenAndRefreshToken = async (id) => {
  try {
    const instructor = await Instructor.findById(id);
    const accessToken = await instructor.generateAccessToken();
    const refreshToken = await instructor.generateRefreshToken();
    instructor.refreshToken = refreshToken;
    instructor.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error);
  }
};
const instructorLogin = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if ([email, password].some((field) => field?.trim() === "")) {
      return next(new AppError("Email and password is required", 404));
    }
    console.log("instructor login data", email, password);
    const instructor = await Instructor.findOne({ email: email });
    console.log("instructor1", instructor);
    if (!instructor) {
      return next(new AppError("Instructor not found", 404));
    }

    const isPasswordValid = await instructor.isPasswordCorrect(password);
    console.log("instructor", instructor);
    if (!isPasswordValid) {
      return next(new AppError("Invalid instructor credentials", 401));
    }
    console.log("isPasswordValid", isPasswordValid);
    const { accessToken, refreshToken } =
      await generateAccessTokenAndRefreshToken(instructor._id);

    const loggedInInstructor = await Instructor.findById(instructor._id).select(
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
          { data: loggedInInstructor, accessToken, refreshToken },
          "Logged in successfully"
        )
      );
  } catch (error) {
    console.log("Error while login instructor", error);
  }
});
const currentInstructor = asyncHandler(async (req, res) => {
  try {
    const currentInstructor = req.instructor;
    console.log("currentInstructor", currentInstructor);
    res.status(200).json({
      status: "success",
      message: "Logged in Instructor successfully",
      instructor: currentInstructor,
    });
  } catch (error) {
    console.log("Current user is not available", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
});
const instructorLogout = asyncHandler(async (req, res, next) => {
  try {
    const options = {
      httpOnly: true,
      secure: true,
    };
    console.log("logout instructor");
    return res
      .status(200)
      .clearCookie("accessToken", options)
      .json(new ApiResponse(200, {}, "Instructor logged out successfully"));
  } catch (error) {
    console.log("An error occurred while logging out instructor", error);
  }
});

export {
  instructorRegistration,
  instructorLogin,
  instructorLogout,
  currentInstructor,
};
