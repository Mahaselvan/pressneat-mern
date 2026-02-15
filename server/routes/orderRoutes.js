import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import Pincode from "../models/Pincode.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const statusOrder = ["Pending", "Assigned", "Picked Up", "Ironing", "Out for Delivery", "Delivered"];

const getServiceForPincode = async (pincode) => {
  if (!/^\d{6}$/.test(String(pincode || ""))) {
    return { available: false, deliveryCharge: 0 };
  }

  let area = await Pincode.findOne({ pincode: String(pincode) });
  if (!area) {
    area = await Pincode.create({ pincode: String(pincode), active: true, deliveryCharge: 20 });
  }

  if (!area.active) {
    return { available: false, deliveryCharge: 0 };
  }

  return { available: true, deliveryCharge: area.deliveryCharge ?? 0 };
};

router.get("/", protect, async (req, res) => {
  const query = req.user.role === "admin" ? {} : { user: req.user._id };
  const orders = await Order.find(query).sort({ createdAt: -1 });
  res.json(orders);
});

router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.post("/", protect, async (req, res) => {
  const { customerName, phone, address, pincode, items, ecoSteam } = req.body;

  const normalizedItems = Array.isArray(items)
    ? items.map((item) => String(item).trim()).filter(Boolean)
    : [];
  const pieceCount = normalizedItems.length;

  if (!customerName || !phone || !address || !pincode || pieceCount === 0) {
    return res.status(400).json({ message: "Missing required booking details" });
  }

  const service = await getServiceForPincode(pincode);
  if (!service.available) {
    return res.status(400).json({ message: "Selected pincode is currently not serviceable" });
  }

  const priceMap = {
    shirt: 15,
    pant: 20,
    saree: 50,
    uniform: 15,
  };

  const itemsTotal = normalizedItems.reduce((sum, item) => {
    const key = item.toLowerCase();
    const base = priceMap[key] ?? 12;
    return sum + base + (ecoSteam ? 2 : 0);
  }, 0);

  const totalPrice = itemsTotal + service.deliveryCharge;

  const order = await Order.create({
    user: req.user._id,
    customerName,
    phone,
    address,
    pincode: String(pincode),
    items: normalizedItems,
    ecoSteam: Boolean(ecoSteam),
    pieceCount,
    deliveryCharge: service.deliveryCharge,
    totalPrice,
  });

  res.status(201).json(order);
});

router.put("/:id", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const requestedStatus = req.body.status;
  if (requestedStatus && statusOrder.includes(requestedStatus)) {
    order.status = requestedStatus;
  }
  await order.save();
  res.json(order);
});

router.put("/:id/location", protect, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const { lat, lng } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.riderLocation = { lat, lng };
  await order.save();
  res.json(order);
});

router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ success: false });
  }

  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: "Paid",
    status: "Assigned",
  });

  res.json({ success: true });
});

export default router;
