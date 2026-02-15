import express from "express";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const buildUserPayload = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email || "",
  address: user.address || "",
  pincode: user.pincode || "",
  language: user.language || "English",
  role: user.role,
  subscription: user.subscription,
  subscriptionExpiry: user.subscriptionExpiry,
});

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

router.post("/register", async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Name, phone and password are required" });
  }

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
    token: signToken(user._id),
    user: buildUserPayload(user),
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

  res.json({
    token: signToken(user._id),
    user: buildUserPayload(user),
  });
});

router.post("/admin/register", async (req, res) => {
  const { name, phone, password, adminSecret } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).json({ message: "Name, phone and password are required" });
  }

  const existingUser = await User.findOne({ phone });
  if (existingUser) {
    return res.status(400).json({ message: "Phone already registered" });
  }

  const adminCount = await User.countDocuments({ role: "admin" });

  let canCreateAdmin = adminCount === 0;
  if (!canCreateAdmin) {
    if (!process.env.ADMIN_REGISTER_SECRET) {
      // Allow registration when no secret is configured (development-friendly default).
      canCreateAdmin = true;
    } else if (adminSecret === process.env.ADMIN_REGISTER_SECRET) {
      canCreateAdmin = true;
    } else if (req.headers.authorization?.startsWith("Bearer ")) {
      try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const requester = await User.findById(decoded.id).select("role");
        canCreateAdmin = requester?.role === "admin";
      } catch {
        canCreateAdmin = false;
      }
    }
  }

  if (!canCreateAdmin) {
    return res.status(403).json({
      message:
        "Admin registration is restricted. Provide valid admin secret or use an authenticated admin account.",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await User.create({
    name,
    phone,
    password: hashedPassword,
    role: "admin",
  });

  res.status(201).json({
    token: signToken(admin._id),
    user: buildUserPayload(admin),
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

  res.json({
    token: signToken(admin._id),
    user: buildUserPayload(admin),
  });
});

router.get("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json(buildUserPayload(user));
});

router.put("/me", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const updates = ["name", "email", "address", "pincode", "language"];
  updates.forEach((key) => {
    if (typeof req.body[key] === "string") {
      user[key] = req.body[key].trim();
    }
  });

  if (req.body.password) {
    user.password = await bcrypt.hash(req.body.password, 10);
  }

  await user.save();
  res.json(buildUserPayload(user));
});

export default router;
