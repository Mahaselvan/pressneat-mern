import express from "express";
import Pincode from "../models/Pincode.js";
import servicePincodes from "../config/servicePincodes.js";

const router = express.Router();

const DEFAULT_CHARGE = 20;

const ensureBasePincodes = async () => {
  const operations = servicePincodes.map((pincode) => ({
    updateOne: {
      filter: { pincode },
      update: {
        $setOnInsert: {
          pincode,
          active: true,
          deliveryCharge: DEFAULT_CHARGE,
        },
      },
      upsert: true,
    },
  }));

  if (operations.length > 0) {
    await Pincode.bulkWrite(operations);
  }
};

router.post("/seed", async (req, res) => {
  await ensureBasePincodes();
  res.json({ message: "Pincodes seeded" });
});

router.get("/", async (req, res) => {
  await ensureBasePincodes();
  const pincodes = await Pincode.find({ active: true }).sort({ pincode: 1 });
  res.json(pincodes);
});

router.get("/:pincode", async (req, res) => {
  const { pincode } = req.params;
  if (!/^\d{6}$/.test(String(pincode || ""))) {
    return res.status(400).json({ available: false, message: "Invalid pincode format" });
  }

  await ensureBasePincodes();
  let area = await Pincode.findOne({ pincode });

  // If pincode is not yet configured, default to available to support new coverage quickly.
  if (!area) {
    area = await Pincode.create({ pincode, active: true, deliveryCharge: DEFAULT_CHARGE });
  }

  if (!area.active) {
    return res.json({ available: false, deliveryCharge: 0 });
  }

  res.json({
    available: true,
    deliveryCharge: area.deliveryCharge ?? DEFAULT_CHARGE,
  });
});

export default router;
