import AsyncError from "../middleware/AsyncError.js";
import ErrorHandler from "../middleware/ErrorHandler.js";
import UserModel from "../models/user.js";
import { instance } from "../server.js";
import crypto from "crypto";
import PaymentModel from "../models/payment.js";
class Payment {
  static createSubscription = AsyncError(async (req, res, next) => {
    let user = await UserModel.findById(req.user._id);
  
    if (user.role === "admin") {
      return next(
        new ErrorHandler(
          "There is not need to buy subscription for Admin.",
          400
        )
      );
    }
    const plan_id = process.env.PAY_PLAN_ID;
    const subscription = await instance.subscriptions.create({
      plan_id,
      customer_notify: 1,
      total_count: 12,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();

    res.status(201).json({
      success: true,
      subscription_id: subscription.id,
    });
  });

  static verification = AsyncError(async (req, res, next) => {
    const {
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    } = req.body;
    let user = await UserModel.findById(req.user._id);
    const generated_signature = crypto
      .createHmac("sha256", process.env.PAY_API_SECRET)
      .update(razorpay_payment_id + "|" + razorpay_subscription_id, "utf-8")
      .digest("hex");
    const isVerified = generated_signature === razorpay_signature;

    if (!isVerified) {
      return res.redirect(`${process.env.CLIENT_URL}/ paymentfail`);
    }

    await PaymentModel.create({
      razorpay_signature,
      razorpay_payment_id,
      razorpay_subscription_id,
    });
    user.subscription.status = "active";
    await user.save();
    res.redirect(`${process.env.CLIENT_URL}/paymentsuccess`);
  });

  static getKeyId = AsyncError(async (req, res, next) => {
    res.status(200).json({
      success: true,
      key: process.env.PAY_API_KEY_ID,
    });
  });

  static cancelSubscription = AsyncError(async (req, res, next) => {
    let user = await UserModel.findById(req.user._id);
    let refund = false;
    const subscriptionId = user.subscription.id;
    // cancel subscription
    await instance.subscriptions.cancel(subscriptionId);

    // Find Payment by razorpay subscription id
    let payment = await PaymentModel.findOne({
      razorpay_subscription_id: subscriptionId,
    });

    const diff = Date.now() - payment.createdAt;
    const refundTime = process.env.REFUND_DAY * 24 * 60 * 60 * 1000;
    if (refundTime > diff) {
      await instance.payments.refund(payment.razorpay_payment_id);
      refund = true;
    }
    await payment.deleteOne({ razorpay_subscription_id: subscriptionId });
    user.subscription.id = undefined;
    user.subscription.status = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: refund
        ? "Subscription cancelled,you will get refund within 7 working days."
        : "Subscription cancelled,No refund because subscription is cancelled after 7 days.",
    });
  });
}
export default Payment;
