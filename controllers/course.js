import AsyncError from "../middleware/AsyncError.js";
import ErrorHandler from "../middleware/ErrorHandler.js";
import CourseModel from "../models/course.js";
import dataUri from "../utils/datauri.js";
import { v2 } from "cloudinary";
import StatsModel from "../models/stats.js";
class Course {
  // Get All Courses
  static getAllCourses = AsyncError(async (req, res, next) => {
    const keyword = req.query.keyword || "";
    const category = req.query.category || "";
    const query = {
      title: { $regex: keyword, $options: "i" },
      category: { $regex: category, $options: "i" },
    };
    const courses = await CourseModel.find(query).select("-lectures");
    // lecture not select because its for only subscribed users

    res.status(200).json({ success: true, courses });
  });

  // Create Course(------------->Admin<-----------------------)

  static createCourse = AsyncError(async (req, res, next) => {
    const { title, description, createdBy, category } = req.body;
    if (!title || !description || !createdBy || !category)
      return next(new ErrorHandler("All fields are required.", 400));
    const file = dataUri(req);
    const upload = await v2.uploader.upload(file.content);
    await CourseModel.create({
      title,
      description,
      createdBy,
      category,
      poster: {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    });

    res
      .status(201)
      .json({ suceess: true, message: "Course created successfully." });
  });

  //<-------------------------------Get Course Lecture-------------------------------------->

  static getCourseLecture = AsyncError(async (req, res, next) => {
    const { courseId } = req.params;
    let course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course Not found.", 404));
    course.views += 1;
    await course.save();
    res.status(200).json({ success: true, lectures: course.lectures });
  });

  //<-------------------------------Crate Course Lecture-------------------------------------->
  // 100mb maxsize allow for free
  static createCourseLecture = AsyncError(async (req, res, next) => {
    const { courseId } = req.params;
    const { title, description, video } = req.body;
    if (!title || !description)
      return next(new ErrorHandler("All fields are required.", 400));
    let course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course Not found.", 404));
    const file = dataUri(req);
    let upload = await v2.uploader.upload(file.content, {
      resource_type: "video",
    });
    course.lectures.push({
      title,
      description,
      video: {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    });

    course.noOfVideos = course.lectures.length;
    await course.save();
    res.status(200).json({ success: true, message: "Lecture added " });
  });

  // -------------------->Delete Course<--------------------------

  static deleteCourse = AsyncError(async (req, res, next) => {
    const { courseId } = req.params;
    let course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course Not found.", 404));

    await v2.uploader.destroy(course.poster.public_id);

    for (let index = 0; index < course.lectures.length; index++) {
      await v2.uploader.destroy(course.lectures[index].video.public_id, {
        resource_type: "video",
      });
    }

    await course.deleteOne({ _id: courseId });

    res
      .status(204)
      .json({ success: true, message: "Course deleted successfully." });
  });

  // -------------------->Delete Lecture<--------------------------

  static deleteLecture = AsyncError(async (req, res, next) => {
    const { courseId, lectureId } = req.query;
    let course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course Not found.", 404));

    for (let index = 0; index < course.lectures.length; index++) {
      const element = course.lectures[index];
      if (element._id.toString() === lectureId.toString()) {
        await v2.uploader.destroy(element.video.public_id, {
          resource_type: "video",
        });
        break;
      }
    }
    course.lectures = course.lectures.filter((item) => {
      if (item._id.toString() !== lectureId.toString()) return item;
    });

    await course.save();

    res
      .status(200)
      .json({ success: true, message: "Lecture deleted successfully." });
  });
}

export default Course;

CourseModel.watch().on("change", async () => {
  const stats = await StatsModel.find({}).sort({ createdAt: "desc" }).limit(1);
  const courses = await CourseModel.find({});

  let totalViews = 0;
  for (let index = 0; index < courses.length; index++) {
    totalViews += courses[index].views;
  }

  stats[0].views = totalViews;

  stats[0].createdAt = new Date(Date.now());

  stats[0].save();
});
