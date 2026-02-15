import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect, adminOnly);

router.get("/analytics", async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalRevenueData = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);

  const totalRevenue = totalRevenueData[0]?.total || 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysOrders = await Order.countDocuments({
    createdAt: { $gte: today },
  });

  const activeOrders = await Order.countDocuments({
    status: { $ne: "Delivered" },
  });

  const premiumUsers = await User.countDocuments({
    subscription: "Premium",
  });

  res.json({
    totalOrders,
    totalRevenue,
    todaysOrders,
    activeOrders,
    premiumUsers,
  });
});

router.get("/orders", async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 });
  res.json(orders);
});

router.put("/orders/:id/status", async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status ?? order.status;
  await order.save();
  res.json(order);
});

export default router;
