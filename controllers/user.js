import AsyncError from "../middleware/AsyncError.js";
import ErrorHandler from "../middleware/ErrorHandler.js";
import UserModel from "../models/user.js";
import sendToken from "../utils/sendToken.js";
import sendMail from "../utils/sendMail.js";
import crypto from "crypto";
import CourseModel from "../models/course.js";
import { v2 } from "cloudinary";
import dataUri from "../utils/datauri.js";
import StatsModel from "../models/stats.js";
class User {
  // -------------------------------------->User Register Start---------------------------------------->
  static register = AsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return next(new ErrorHandler("All fields are required.", 400));
    let user = await UserModel.findOne({ email });
    if (user)
      return next(
        new ErrorHandler("User with this email is already exist.", 409)
      );
    const file = dataUri(req);

    const upload = await v2.uploader.upload(file.content);

    user = await UserModel.create({
      name,
      email,
      password,
      avatar: {
        public_id: upload.public_id,
        url: upload.secure_url,
      },
    });

    await user.save();

    const token = await user.getAuthToken();
    sendToken(res, 201, "User registered successfully", token);
  });
  // -------------------------------------->User Register End------------------------------------------>

  // -------------------------------------->User Login Start------------------------------------------>

  static login = AsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
      return next(new ErrorHandler("Email and Password are required."));

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Incorrect Email or Password"));

    const isMatch = await user.comparePassword(password);

    if (!isMatch) return next(new ErrorHandler("Incorrect Email or Password"));
    const token = await user.getAuthToken();
    sendToken(res, 200, "Logged in successfully.", token);
  });

  // -------------------------------------->User Login End-------------------------------------------->

  // -------------------------------------->User Logout Start----------------------------------------->

  static logout = AsyncError(async (req, res, next) => {
    res
      .status(200)
      .cookie("token", null, {
        httpOnly: true,
        expires: new Date(0),
        secure: true,
        sameSite: "none",
      })
      .json({ success: true, message: "Logged out successfully." });
  });

  // -------------------------------------->User Logout End==----------------------------------------->

  // -------------------------------------->Get My Profile<------------------------------------------->

  static getMyProfile = AsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.user._id);
    res.status(200).json({ success: true, user });
  });

  // -------------------------------------->Change Password Start----------------=--------------------->

  static changePassword = AsyncError(async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return next(new ErrorHandler("All fields are required.", 400));
    let user = await UserModel.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) return next(new ErrorHandler("Incorrect Password", 400));
    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password change successfully." });
  });

  // -------------------------------------->Change Password End---------------------------------------->

  // -------------------------------------->Update Profile Start----------------=--------------------->

  static updateProfile = AsyncError(async (req, res, next) => {
    const { name, email } = req.body;

    let user = await UserModel.findById(req.user._id);
    if (name) user.name = name;
    if (email) user.email = email;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile update successfully." });
  });

  // -------------------------------------->Update Profile End---------------------------------------->

  // -------------------------------------->Update Profile Start----------------=--------------------->

  static updateProfilePic = AsyncError(async (req, res, next) => {
    let user = await UserModel.findById(req.user._id);
    const file = dataUri(req);
    const upload = await v2.uploader.upload(file.content);

    await v2.uploader.destroy(user.avatar.public_id);
    user.avatar = {
      public_id: upload.public_id,
      url: upload.secure_url,
    };
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Profile Picture update successfully." });
  });

  // -------------------------------------->Update Profile End---------------------------------------->

  // -------------------------------------->Forget Password Start----------------=--------------------->

  static forgetPassword = AsyncError(async (req, res, next) => {
    const { email } = req.body;

    if (!email) return next(new ErrorHandler("Email is required.", 400));
    let user = await UserModel.findOne({ email });
    if (!user)
      return next(new ErrorHandler("User did not found with this email.", 404));
    const token = await user.getResetToken();
    await user.save();
    const url = `${process.env.CLIENT_URL}/reset-password/${token}`;
    try {
      await sendMail(
        user.email,
        "From EduCodeTech to Reset Password",
        `Click on the link to reset your password \n\n\n ${url}`
      );
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
    }

    res.status(200).json({
      success: true,
      message: `Reset Password link sent on ${user.email}`,
    });
  });

  // -------------------------------------->Forget Password End---------------------------------------->

  // -------------------------------------->Reset Password Start----------------=--------------------->

  static resetPassword = AsyncError(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) return next(new ErrorHandler("Password is required.", 400));
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    let user = await UserModel.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user)
      return next(new ErrorHandler("Invalid token or has been expired.", 400));

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(200).json({
      success: true,
      message: `Password reset successfully.`,
    });
  });

  // -------------------------------------->Reset Password End---------------------------------------->

  // -------------------------------------->Add To Playlist start----------------=--------------------->

  static addToPlaylist = AsyncError(async (req, res, next) => {
    const { courseId } = req.body;

    let user = await UserModel.findById(req.user._id);
    let course = await CourseModel.findById(courseId);
    if (!course) return next(new ErrorHandler("Course not found.", 404));
    const isExist = user.playlist.find((item) => {
      if (item.course.toString() === course._id.toString()) return true;
    });
    if (isExist)
      return next(new ErrorHandler("Course Already exist in playlist", 409));
    user.playlist.push({
      course: course._id,
      poster: course.poster.url,
    });
    await user.save();
    res.status(200).json({
      success: true,
      message: `Course added to playlist`,
    });
  });

  // -------------------------------------->Add To Playlist end---------------------------------------->

  // ------------------------------------->Remove From Playlist start----------------=----------------->

  static removeFromPlaylist = AsyncError(async (req, res, next) => {
    const { courseId } = req.body;

    let user = await UserModel.findById(req.user._id);
    let course = await CourseModel.findById(courseId);

    if (!course) return next(new ErrorHandler("Course not found.", 404));
    const newItem = user.playlist.filter((item) => {
      if (item.course.toString() !== course._id.toString()) return item;
    });

    user.playlist = newItem;

    await user.save();
    res.status(200).json({
      success: true,
      message: `Course remove from playlist`,
    });
  });

  // ------------------------------------->Remove From Playlist end----------------=----------------->

  // --------------------------------------->Get All Users<-------------------------------------------

  static getAllUsers = AsyncError(async (req, res, next) => {
    const users = await UserModel.find({});

    res.status(200).json({ success: true, users });
  });

  // --------------------------------------->Change User Role<-----------------------------------------

  static changeUserRole = AsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found.", 404));
    user.role = user.role === "admin" ? "user" : "admin";
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Role update successfullyl." });
  });

  // --------------------------------------->Delete User<-----------------------------------------

  static deleteUser = AsyncError(async (req, res, next) => {
    const user = await UserModel.findById(req.params.id);
    if (!user) return next(new ErrorHandler("User not found.", 404));
    if (user.avatar.public_id) {
      await v2.uploader.destroy(user.avatar.public_id);
    }
    await user.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .json({ success: true, message: "User deleted successfullyl." });
  });
}

export default User;

UserModel.watch().on("change", async () => {
  const stats = await StatsModel.find({}).sort({ createdAt: "desc" }).limit(1);

  if (stats.length < 1) {
    // handle case where no stats document exists
    return;
  }

  const subscription = await UserModel.find({
    "subscription.status": "active",
  });

  stats[0].subscriptions = subscription.length;
  stats[0].users = await UserModel.countDocuments();
  stats[0].createdAt = new Date(Date.now());

  await stats[0].save();
});
