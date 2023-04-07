import { Router } from "express";
import Payment from "../controllers/payment.js";
import Auth from "../middleware/auth.js";
const paymentRouter = Router();

paymentRouter
  .route("/subscribe")
  .get(Auth.isLoggedIn, Payment.createSubscription);
paymentRouter.route("/verify").post(Auth.isLoggedIn, Payment.verification);
paymentRouter.route("/getkeyid").get(Payment.getKeyId);
paymentRouter
  .route("/subsribe/cancel")
  .delete(Auth.isLoggedIn, Payment.cancelSubscription);
export default paymentRouter;
