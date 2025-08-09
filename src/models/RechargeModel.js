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
      default: "Recharge"
    },
    lastrecharge: {
      type: Date,
      default: Date.now
    },
    amount:{
      type:Number,
      default:199
    },
    deadline: {
      type: Date,
      default: Date.now
    },
    closed: {
      type: Boolean,
      default: false
    },
    validity:{
      type:Number,
      default:28
    }
  },
  { timestamps: true }
);

const Recharge =
  mongoose.models.Recharge || mongoose.model("Recharge", RechargeSchema);

export default Recharge;
