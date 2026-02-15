import mongoose from "mongoose";

const orderSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    customerName: String,
    phone: String,
    address: String,

    items: [
      {
        type: String
      }
    ],

    pieceCount: Number,

    ecoSteam: Boolean,

    totalPrice: Number,

    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Picked Up",
        "Ironing",
        "Out for Delivery",
        "Delivered"
      ],
      default: "Pending"
    },

    dhobiName: {
      type: String,
      default: "Not Assigned"
    },

    riderLocation: {
      lat: {
        type: Number,
        default: 12.9716
      },
      lng: {
        type: Number,
        default: 77.5946
      }
    },

    paymentStatus: {
      type: String,
      default: "Pending"
    },

    videoProof: String
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
