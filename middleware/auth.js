import AsyncError from "./AsyncError.js";
import jsonwebtoken from "jsonwebtoken";
import ErrorHandler from "./ErrorHandler.js";
import UserModel from "../models/user.js";
const Auth = {
  isLoggedIn: AsyncError(async (req, res, next) => {
    const { token } = req.cookies;
   
    if (!token) return next(new ErrorHandler("Login to continue", 400));

    const data = jsonwebtoken.verify(token, process.env.JWT_SECRET);
    req.user = await UserModel.findById(data._id);

    next();
  }),
  isAdmin: AsyncError(async (req, res, next) => {
    if (req.user.role !== "admin")
      return next(new ErrorHandler("Resource not found.", 403));
    next();
  }),
  isSubscribed: AsyncError(async (req, res, next) => {
    if (
      req.user.subscription.status !== "active" &&
      req.user.role !== "admin"
    ) {
      return next(new ErrorHandler("Resource not found.", 403));
    }
    next();
  }),
};

export default Auth;
