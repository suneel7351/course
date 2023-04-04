import AsyncError from "../middleware/AsyncError.js";
import StatsModel from "../models/stats.js";
const stats = AsyncError(async (req, res, next) => {
  const stat = await StatsModel.find({}).sort({ createdAt: "desc" }).limit(12);
  const data = [];

  for (let index = 0; index < stat.length; index++) {
    data.unshift(stat[index]);
  }
  const totalLength = 12 - stat.length;
  for (let index = 0; index < totalLength; index++) {
    data.unshift({
      users: 0,
      subscriptions: 0,
      views: 0,
    });
  }

  const userCount = data[11].users;
  const viewsCount = data[11].views;
  const subscriptionsCount = data[11].subscriptions;

  let userProfit = true,
    viewsProfit = true,
    subscriptionProfit = true;
  let userPercentage = 0,
    viewsPercentage = 0,
    subscriptionPercentage = 0;

  if (data[0].users === 0) userPercentage = userCount * 100;
  if (data[0].subscriptions === 0) subscriptionPercentage = userCount * 100;
  if (data[0].views === 0) viewsPercentage = userCount * 100;
  else {
    // Percentage Change = ((New Value - Old Value) / Old Value) x 100
    let diff = {
      users: stat[11].users - stat[10].users,
      subscriptions: stat[11].subscriptions - stat[10].subscriptions,
      views: stat[11].views - stat[10].views,
    };
    userPercentage = (diff.users / stat[10].users) * 100;
    subscriptionPercentage =
      (diff.subscriptions / stat[10].subscriptions) * 100;
    viewsPercentage = (diff.views / stat[10].views) * 100;

    if (userPercentage < 0) userProfit = false;
    if (viewsPercentage < 0) viewsProfit = false;
    if (subscriptionPercentage < 0) subscriptionProfit = false;
  }
  res.status(200).json({
    success: true,
    stats: data,
    userCount,
    viewsCount,
    subscriptionsCount,
    subscriptionPercentage,
    viewsPercentage,
    userPercentage,
    userProfit,
    subscriptionProfit,
    viewsProfit,
  });
});

export default stats;
