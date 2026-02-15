import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.post("/:userId", async (req, res) => {
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);

  const user = await User.findByIdAndUpdate(
    req.params.userId,
    {
      subscription: "Premium",
      subscriptionExpiry: expiry
    },
    { new: true }
  );

  res.json(user);
});

export default router;
