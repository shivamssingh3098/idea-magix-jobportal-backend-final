import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";

import { AppError } from "../utils/ApiError.js";
import { Candidate } from "../models/candidate/condidate.model.js";

const candidateVerifyJWT = asyncHandler(async (req, _, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("decoded token: ", decodedToken);
    const candidate = await Candidate.findById(decodedToken._id);
    if (!candidate) {
      return next(new AppError("Invalid access token", 401));
    }
    req.candidate = candidate;
    next();
  } catch (error) {
    console.log("Error while verifying JWT of instructor", error);
    return next(new AppError("Unauthorized access token", 401));
  }
});
export { candidateVerifyJWT };
