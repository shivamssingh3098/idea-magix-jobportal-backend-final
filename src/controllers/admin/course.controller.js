import { Course } from "../../models/courseModel/course.model.js";
import { Batch } from "../../models/courseModel/courseBatch.model.js";
import { TimeTable } from "../../models/courseModel/timeTable.model.js";
import { Lecture } from "../../models/videoModels/video.model.js";
import { AppError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../../utils/cloudinary.js";
import { generateUniqueId } from "../../utils/generateUniqueId.js";

import moment from "moment/moment.js";

const createCourse = asyncHandler(async (req, res, next) => {
  try {
    const {
      name,
      level,
      description,

      batchName,
      max_student,
      date,
      startTime,
      endTime,
    } = req.body;
    console.log("req.body", req.body);

    if (
      [name, level, description, batchName].some(
        (field) => field?.trim() === ""
      )
    ) {
      return next(new AppError("All fields are required", 400));
    }

    const batchId = generateUniqueId();

    const timeTable = await TimeTable.create({
      date: date || moment(new Date()).format("DD/MM/YYYY"),
      startTime: startTime || moment(new Date()).format("HH:mm"),
      endTime: endTime || moment(new Date()).format("HH:mm"),
    });

    const batch = await Batch.create({
      batchName,
      max_student,
      batchId: batchId,
      time_table: timeTable._id,
    });

    const course = await Course.create({
      name,
      level,
      description,

      batch: batch._id,
    });

    if (!timeTable || !batch || !course) {
      return next(new AppError("Error while creating course", 400));
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { course, batch, timeTable },
          "Course created successfully"
        )
      );
  } catch (error) {
    console.log("Error while creating course", error);
  }
});
const uploadCourseImage = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log("req.body", id);
    const image = req.file.path;

    console.log("file syllabus", image);

    console.log("image_file_path", image);
    if (!image) {
      return next(new AppError("image file is required", 400));
    }

    const image_file_path = await uploadOnCloudinary(image);
    console.log("image_file_path", image_file_path);

    if (!image_file_path) {
      return next(new AppError("image file is unable to upload on cloud", 400));
    }

    const course = await Course.findById(id);

    course.image = image_file_path?.url;
    course.imagePublicId = image_file_path.public_id;
    await course.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new ApiResponse(200, { course }, "Course created successfully"));
  } catch (error) {
    console.log("Error while creating course", error);
  }
});

const createLecture = asyncHandler(async (req, res, next) => {
  try {
    const { title, description, courseId } = req.body;
    const thumbnail = req.file;

    console.log("thumbnail", thumbnail);
    console.log("title, description, course", title, description, courseId);

    if ([title, description, courseId].some((field) => field?.trim() === "")) {
      return next(new AppError("All fields are required", 404));
    }

    const course = await Course.findById(courseId).select(
      "isInstructorAssigned assignedInstructor courseVideos"
    );
    console.log("course", course);

    const classLecture = await Lecture.create({
      title,
      description,

      course: courseId,
    });

    console.log("id is---", course.courseVideos);
    course.courseVideos.push(classLecture._id);

    await course.save({ validateBeforeSave: false });
    return res
      .status(200)
      .json(new ApiResponse(200, classLecture, "Class uploaded successfully"));
  } catch (error) {
    console.log("Error while creating video", error);
  }
});

const getAllCourses = asyncHandler(async (req, res, next) => {
  try {
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 100;
    const skip = (page - 1) * limit;

    let count = await Course.countDocuments();

    console.log(count);
    const allCourses = await Course.find()
      .populate({
        path: "batch",
        populate: "time_table",
      })
      .sort({ _id: -1 })
      .limit(limit)
      .skip(skip);
    console.log("allCourses", allCourses);
    return res
      .status(200)
      .json(new ApiResponse(200, { allCourses, count }, "All courses"));
  } catch (error) {
    console.log("Error while getting all courses", error);
  }
});

export { createCourse, getAllCourses, createLecture, uploadCourseImage };
