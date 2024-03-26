import { Employer } from "../models/admin/admin.models.js";

import { AppError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

const verifyAdminOrStaffJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    console.log("admin token: ", token);
    if (!token) {
      return next(new AppError("Unauthorized request", 401));
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("admin decoded token: ", decodedToken);
    const admin = await Employer.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    console.log("admin  ", admin);
    if (!admin) {
      return next(new AppError("Invalid access token", 401));
    }
    req.admin = admin;
    next();
  } catch (error) {
    console.log("Failed to verify admin jwt token", error);
  }
});
export { verifyAdminOrStaffJWT };
