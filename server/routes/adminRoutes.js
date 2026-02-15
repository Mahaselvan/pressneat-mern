import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/analytics", async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenueData = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } }
  ]);

  const totalRevenue = totalRevenueData[0]?.total || 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = await Order.countDocuments({
    createdAt: { $gte: today }
  });

  const activeOrders = await Order.countDocuments({
    status: { $ne: "Delivered" }
  });

  const premiumUsers = await User.countDocuments({
    subscription: "Premium"
  });

  res.json({
    totalOrders,
    totalRevenue,
    todaysOrders,
    activeOrders,
    premiumUsers
  });
});

export default router;
