import { Router } from "express";
import Course from "../controllers/course.js";
import Auth from "../middleware/auth.js";
import multer from "../middleware/multer.js";
const courseRouter = Router();

courseRouter.route("/courses").get(Course.getAllCourses);
courseRouter
  .route("/create")
  .post(Auth.isLoggedIn, Auth.isAdmin, multer, Course.createCourse);
courseRouter
  .route("/course/:courseId")
  .get(Auth.isLoggedIn, Auth.isSubscribed, Course.getCourseLecture)
  .post(Auth.isLoggedIn, Auth.isAdmin, multer, Course.createCourseLecture)
  .delete(Auth.isLoggedIn, Auth.isAdmin, Course.deleteCourse);
courseRouter
  .route("/lecture")
  .delete(Auth.isLoggedIn, Auth.isAdmin, Course.deleteLecture);
export default courseRouter;
