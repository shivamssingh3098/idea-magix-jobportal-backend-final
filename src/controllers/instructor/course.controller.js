import mongoose from "mongoose";
import { Instructor } from "../../models/instructorModel/instructor.model.js";
import { AppError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { Topic } from "../../models/courseModel/topics.model.js";

const listOfAllCoursesAssignedToInstructor = asyncHandler(
  async (req, res, next) => {
    try {
      const instructor = await Instructor.aggregate([
        {
          $match: {
            _id: new mongoose.Types.ObjectId(req.instructor?._id),
          },
        },
        {
          $lookup: {
            from: "courses",
            localField: "assignedCourse",
            foreignField: "_id",
            as: "assignedCourse",
            pipeline: [
              {
                $lookup: {
                  from: "batches",
                  localField: "batch",
                  foreignField: "_id",
                  as: "batch",
                },
              },
            ],
          },
        },
      ]);

      console.log("instructor and courses", instructor);
      //   console.log("intructor1 and courses", intructor1);
      return res
        .status(200)
        .json(new ApiResponse(200, instructor, "Instructor fetched"));
    } catch (error) {
      console.log("Error while fetching instructor", error);
      return next(new AppError("Error while fetching instructor", 500));
    }
  }
);

export { listOfAllCoursesAssignedToInstructor };
