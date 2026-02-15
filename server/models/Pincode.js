import mongoose from "mongoose";

const pincodeSchema = mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true
    },
    active: {
      type: Boolean,
      default: true
    },
    deliveryCharge: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model("Pincode", pincodeSchema);
