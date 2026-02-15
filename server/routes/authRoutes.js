import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  const { name, phone, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    phone,
    password: hashedPassword
  });

  res.json(user);
});

// Login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  const user = await User.findOne({ phone });

  if (!user) return res.status(400).json({ message: "User not found" });

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });

  res.json({ token, user });
});
// Update rider location
router.put("/:id/location", async (req, res) => {
  const { lat, lng } = req.body;

  const order = await Order.findById(req.params.id);
  order.riderLocation = { lat, lng };

  await order.save();
  res.json(order);
});

export default router;
