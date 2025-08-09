import mongoose from "mongoose";

const RechargeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Unknown"
    },
    phone: {
      type: String,
      default: "9999999999"
    },
    reason: {
      type: String,
      default: ""
    },
    lastrecharge: {
      type: Date,
      default: Date.now
    },
    deadline: {
      type: Date,
      default: Date.now
    },
    closed: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

const Recharge =
  mongoose.models.Recharge || mongoose.model("Recharge", RechargeSchema);

export default Recharge;
