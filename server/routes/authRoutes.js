import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { name, phone, password } = req.body;

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ message: "Phone already registered" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    phone,
    password: hashedPassword,
  });

  res.json({
    _id: user._id,
    name: user.name,
    phone: user.phone,
    role: user.role,
  });
});

router.post("/login", async (req, res) => {
  const { phone, password } = req.body;
  const user = await User.findOne({ phone });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    token,
    user: {
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      subscription: user.subscription,
      subscriptionExpiry: user.subscriptionExpiry,
    },
  });
});

router.post("/admin/login", async (req, res) => {
  const { phone, password } = req.body;
  let admin = await User.findOne({ phone, role: "admin" });

  if (!admin && process.env.ADMIN_PHONE && process.env.ADMIN_PASSWORD) {
    const canBootstrap =
      phone === process.env.ADMIN_PHONE && password === process.env.ADMIN_PASSWORD;

    if (canBootstrap) {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = await User.create({
        name: "Admin",
        phone,
        password: hashedPassword,
        role: "admin",
      });
    }
  }

  if (!admin) {
    return res.status(400).json({ message: "Admin user not found" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  res.json({
    token,
    user: {
      _id: admin._id,
      name: admin.name,
      phone: admin.phone,
      role: admin.role,
    },
  });
});

export default router;
