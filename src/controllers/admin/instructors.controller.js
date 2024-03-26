import mongoose from "mongoose";
import { Course } from "../../models/courseModel/course.model.js";
import { Instructor } from "../../models/instructorModel/instructor.model.js";
import { AppError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { deleteFromCloudinary } from "../../utils/cloudinary.js";
import moment from "moment";

const getAllInstructor = asyncHandler(async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    const instructors = await Instructor.find()
      .select("-password")
      .populate({
        path: "assignedCourse",
        select: "name level",
      })
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);

    let count = await Instructor.countDocuments();

    console.log(count);
    console.log("all instructors found", instructors);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { instructors, count }, "List of instructors")
      );
  } catch (error) {
    console.log("Error while getting all instructors", error);
  }
});

//

const listOfCoursesAndInstructor = asyncHandler(async (req, res, next) => {
  try {
    const courseList = await Course.aggregate([
      {
        $match: {
          isInstructorAssigned: false,
        },
      },
      {
        $project: {
          name: 1,
        },
      },
    ]);

    const instructorList = await Instructor.aggregate([
      {
        $match: {
          isApproved: true,
        },
      },
      {
        $project: {
          fullName: 1,
        },
      },
    ]);
    console.log("instructors list: ", instructorList);

    console.log("Course list: ", courseList);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { instructorList, courseList },
          "List of courses and instructor"
        )
      );
  } catch (error) {
    console.log("Error while trying to allocate Course toInstructor", error);
  }
});

const allocateCourseToInstructor = asyncHandler(async (req, res, next) => {
  try {
    const { courseId, instructorId } = req.body;
    console.log("Allocating Course toInstructor", courseId, instructorId);

    if (!courseId || !instructorId) {
      return next(new AppError("Course id and instructor id required", 404));
    }

    const course = await Course.findById({ _id: courseId }).populate({
      path: "batch",
      populate: "time_table",
    });

    let instructor = await Instructor.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(instructorId),
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
                pipeline: [
                  {
                    $lookup: {
                      from: "timetables",
                      localField: "time_table",
                      foreignField: "_id",
                      as: "time_table",
                    },
                  },
                  {
                    $addFields: {
                      time_table: {
                        $first: "$time_table",
                      },
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                batch: {
                  $first: "$batch",
                },
              },
            },
          ],
        },
      },
    ]);
    instructor = instructor[0];

    for (let index = 0; index < instructor.assignedCourse.length; index++) {
      // extract required fields

      let startTime =
        instructor.assignedCourse[index].batch.time_table.startTime;
      let endTime = instructor.assignedCourse[index].batch.time_table.endTime;
      let date = instructor.assignedCourse[index].batch.time_table.date;
      let courseStartTime = course.batch.time_table.startTime;
      let courseEndTime = course.batch.time_table.endTime;

      let courseDateToAss = course.batch.time_table.date;
      // console course date and start time and end time of the course and already assigned course to the instructor for match the time to assign new course to the instructor
      console.log(
        `Course that need to assign date : ${courseDateToAss} & startTime:${courseStartTime} & EndTime: ${courseEndTime}`
      );
      console.log(
        `Course that already assigned date : ${date} & startTime:${startTime} & EndTime: ${endTime}`
      );
      console.log("assignedCourse end timing: ", endTime);

      // convert date and time into required format for comparing time and date
      // let combinedStartTime1 = moment(
      //   `${date}T${startTime}`,
      //   "YYYY-MM-DDTHH:mm"
      // );
      let combinedStartTime1 = moment(`${date}T${startTime}`, "YYYY-MM-DD");

      // let combinedEndTime1 = moment(`${date}T${endTime}`, "YYYY-MM-DDTHH:mm");
      let combinedEndTime1 = moment(`${date}T${endTime}`, "YYYY-MM-DD");
      // variable for comparing time and date
      // let cStartTime1 = moment(
      //   `${courseDateToAss}T${courseStartTime}`,
      //   "YYYY-MM-DDTHH:mm"
      // );
      let cStartTime1 = moment(
        `${courseDateToAss}T${courseStartTime}`,
        "YYYY-MM-DD"
      );
      // let cEndTime1 = moment(
      //   `${courseDateToAss}T${courseEndTime}`,
      //   "YYYY-MM-DDTHH:mm"
      // );
      let cEndTime1 = moment(
        `${courseDateToAss}T${courseEndTime}`,
        "YYYY-MM-DD"
      );

      console.log(
        "checking time here--------------------------------before",
        cEndTime1.isBefore(combinedStartTime1)
      );
      console.log(
        `assign date ${cStartTime1} after instructor have already assigned course to this ${combinedEndTime1} `
      );
      console.log(
        "Checking time here--------------------------------after time is now",
        cStartTime1.isAfter(combinedEndTime1)
      );

      // integrate logical conditions to compare date and time so that course assign successfully
      // if need to assign course endDate is less than the already course assigned to the instructor startDate -- cEndTime1.isBefore(combinedStartTime1)
      // if need to assign course startDate is greater than the already course assigned to the instructor endDate -- cStartTime1.isAfter(combinedEndTime1)
      // if one of the condition is true then course can assigned to instructor

      if (cEndTime1.isBefore(combinedStartTime1)) {
        console.log("now this course can assigned successfully");
      } else if (cStartTime1.isAfter(combinedEndTime1)) {
        console.log("now this course can assigned successfully");
      } else {
        console.log(
          "now this course can not be assigned because instructor already assigned"
        );

        return next(
          new AppError(
            "This instructor already assigned batch please change timing of the course"
          )
        );
      }
    }

    console.log("list of course assigned", course.batch.time_table.date);

    const instructor1 = await Instructor.findById({
      _id: instructorId,
    }).populate({
      path: "assignedCourse",
    });

    course.assignedInstructor = instructor1._id;
    course.isInstructorAssigned = true;

    instructor1.assignedCourse = instructor1.assignedCourse.push(course._id);

    await course.save({ validateBeforeSave: false });
    await instructor1.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { instructor1, course },
          "Course assigned successfully"
        )
      );
  } catch (error) {
    console.log("Error while trying to allocate Course toInstructor", error);
  }
});

export {
  getAllInstructor,
  listOfCoursesAndInstructor,
  allocateCourseToInstructor,
};
