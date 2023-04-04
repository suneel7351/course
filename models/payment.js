import { Schema, model } from "mongoose";

const paymentSchema = new Schema({
  razorpay_signature: {
    type: String,
    required: true,
  },
  razorpay_payment_id: {
    type: String,
    required: true,
  },
  razorpay_subscription_id: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PaymentModel = model("payment", paymentSchema);

export default PaymentModel;
