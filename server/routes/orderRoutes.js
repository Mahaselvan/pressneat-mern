import express from "express";
import Order from "../models/Order.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create order (protected)
router.post("/", protect, async (req, res) => {
  const order = await Order.create({
    ...req.body,
    user: req.user._id
  });

  res.json(order);
});

// Get logged-in user's orders
router.get("/my", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});
router.post("/", async (req, res) => {
  const { customerName, phone, address, items, ecoSteam } = req.body;

  const pieceCount = items.length;

  const baseRate = 12;
  const ecoExtra = ecoSteam ? 2 : 0;

  const totalPrice = pieceCount * (baseRate + ecoExtra);

  const order = await Order.create({
    customerName,
    phone,
    address,
    items,
    ecoSteam,
    pieceCount,
    totalPrice
  });

  res.json(order);
});
router.put("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  order.status = req.body.status;
  await order.save();
  res.json(order);
});
router.post("/verify", async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderId
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {

    // 🔥 THIS IS WHERE YOU UPDATE MONGODB
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: "Paid",
      status: "Assigned" // optional: move order to next stage
    });

    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

export default router;
