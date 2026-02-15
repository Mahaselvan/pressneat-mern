import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
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

  const statusBreakdown = await Order.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const recentOrders = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(8)
    .select("customerName status pieceCount totalPrice pincode createdAt");

  res.json({
    totalOrders,
    totalRevenue,
    todaysOrders,
    activeOrders,
    premiumUsers,
    statusBreakdown,
    recentOrders,
  });
});

router.get("/orders", async (req, res) => {
  const status = req.query.status;
  const query = status && status !== "All Orders" ? { status } : {};
  const orders = await Order.find(query).sort({ createdAt: -1 });
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

router.post("/admins", async (req, res) => {
  const { name, phone, password } = req.body;
  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Name, phone and password are required" });
  }

  const existing = await User.findOne({ phone });
  if (existing) {
    return res.status(400).json({ message: "Phone already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name,
    phone,
    password: hashedPassword,
    role: "admin",
  });

  res.status(201).json({
    _id: admin._id,
    name: admin.name,
    phone: admin.phone,
    role: admin.role,
  });
});

export default router;
