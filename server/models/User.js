import mongoose from "mongoose";

const userSchema = mongoose.Schema(
  {
    name: String,
    phone: String,
    password: String,
    role: {
      type: String,
      default: "user"
    },
    subscription: {
  type: String,
  default: "Free"
},
subscriptionExpiry: Date,

  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
