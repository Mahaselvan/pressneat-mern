import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: 1 });
  res.json(orders);
});

router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

router.post("/", async (req, res) => {
  const { customerName, phone, address, items, ecoSteam } = req.body;
  const normalizedItems = Array.isArray(items)
    ? items.map((item) => item.trim()).filter(Boolean)
    : [];
  const pieceCount = normalizedItems.length;
  const baseRate = 12;
  const ecoExtra = ecoSteam ? 2 : 0;
  const totalPrice = pieceCount * (baseRate + ecoExtra);

  const order = await Order.create({
    customerName,
    phone,
    address,
    items: normalizedItems,
    ecoSteam: Boolean(ecoSteam),
    pieceCount,
    totalPrice,
  });

  res.json(order);
});

router.put("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = req.body.status ?? order.status;
  await order.save();
  res.json(order);
});

router.put("/:id/location", async (req, res) => {
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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
    req.body;

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
