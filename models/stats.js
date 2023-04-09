import { model, Schema } from "mongoose";

const statsSchema = new Schema({
  users: {
    type: Number,
    default: 0,
  },
  subscriptions: {
    type: Number,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const StatsModel = model("stat", statsSchema);

export default StatsModel;
