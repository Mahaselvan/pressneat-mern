import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Order from "../models/Order.js";
import generateInvoice from "../utils/generateInvoice.js";

const router = express.Router();

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
  const { amount } = req.body;

  const options = {
    amount: amount * 100, // convert to paise
    currency: "INR",
    receipt: "receipt_" + Date.now(),
  };

  const order = await razorpay.orders.create(options);

  res.json(order);
});

// Verify Payment
router.post("/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: "Paid",
        status: "Assigned"
      },
      { new: true }
    );

    // 🔥 Generate invoice here
    generateInvoice(updatedOrder);

    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

export default router;
