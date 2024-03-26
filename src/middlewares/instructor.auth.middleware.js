import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Instructor } from "../models/instructorModel/instructor.model.js";
import { AppError } from "../utils/ApiError.js";

const instructorVerifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded token: ", decodedToken);
    const instructor = await Instructor.findById(decodedToken._id);
    if (!instructor) {
      return next(new AppError("Invalid access token", 401));
    }
    req.instructor = instructor;
    next();
  } catch (error) {
    console.log("Error while verifying JWT of instructor", error);
    return next(new AppError("Unauthorized access token", 401));
  }
});
export { instructorVerifyJWT };
