import { Router } from "express";
import User from "../controllers/user.js";
import auth from "../middleware/auth.js";
import multer from "../middleware/multer.js";
const userRouter = Router();

userRouter.route("/register").post(multer, User.register);
userRouter.route("/login").post(User.login);
userRouter.route("/logout").post(User.logout);
userRouter.route("/me").get(auth.isLoggedIn, User.getMyProfile);
userRouter.route("/changepassword").put(auth.isLoggedIn, User.changePassword);
userRouter.route("/updateprofile").put(auth.isLoggedIn, User.updateProfile);

userRouter.route("/forgetpassword").post(User.forgetPassword);
userRouter.route("/reset-password/:token").put(User.resetPassword);
userRouter.route("/add-to-playlist").post(auth.isLoggedIn, User.addToPlaylist);
userRouter
  .route("/remove-from-playlist")
  .post(auth.isLoggedIn, User.removeFromPlaylist);
userRouter
  .route("/update-profile-pic")
  .put(auth.isLoggedIn, multer, User.updateProfilePic);
userRouter
  .route("/admin/users")
  .get(auth.isLoggedIn, auth.isAdmin, User.getAllUsers);
userRouter
  .route("/admin/user/:id")
  .put(auth.isLoggedIn, auth.isAdmin, User.changeUserRole)
  .delete(auth.isLoggedIn, auth.isAdmin, User.deleteUser);
export default userRouter;
