import app from "./app.js";
import { v2 } from "cloudinary";
const PORT = process.env.PORT || 4000;
import Razorpay from "razorpay";
import nodecron from "node-cron";
import StatsModel from "./models/stats.js";

// create stats document at every 1 date in every month
// second minute hours day month year
nodecron.schedule("0 0 0 1 * *", async () => {
  try {
    await StatsModel.create({});
  } catch (error) {
    console.log(error);
  }
});

// config cloudinary
v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Create instance of razorpay

export const instance = new Razorpay({
  key_id: process.env.PAY_API_KEY_ID,
  key_secret: process.env.PAY_API_SECRET,
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});
