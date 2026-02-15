import express from "express";
import Pincode from "../models/Pincode.js";

const router = express.Router();
 router.post("/seed", async (req, res) => {
  await Pincode.insertMany([
    { pincode: "602105", active: true, deliveryCharge: 20 },
    { pincode: "600116", active: true, deliveryCharge: 30 },
    { pincode: "600095", active: false, deliveryCharge: 0 }
  ]);

  res.send("Seeded");
});

router.get("/:pincode", async (req, res) => {
  const { pincode } = req.params;

  const area = await Pincode.findOne({ pincode });

  if (!area || !area.active) {
    return res.json({ available: false });
  }

  res.json({
    available: true,
    deliveryCharge: area.deliveryCharge
  });
});

export default router;
