import express from "express";
import multer from "multer";
import Order from "../models/Order.js";

const router = express.Router();
const upload = multer({ dest: "videos/" });

router.post("/:id", upload.single("video"), async (req, res) => {
  const order = await Order.findById(req.params.id);

  order.videoProof = `/videos/${req.file.filename}`;
  await order.save();

  res.json(order);
});

export default router;
