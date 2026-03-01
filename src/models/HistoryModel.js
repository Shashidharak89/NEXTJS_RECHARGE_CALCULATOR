import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE"],
      required: true
    },
    recordType: {
      type: String,
      default: "Recharge"
    },
    recordId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    userName: {
      type: String,
      default: "Unknown User"
    },
    logMessage: {
      type: String,
      required: true
    },
    changedFields: {
      type: [String],
      default: []
    },
    oldValues: {
      type: Object,
      default: {}
    },
    newValues: {
      type: Object,
      default: {}
    },
    recordSnapshot: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

// ✅ Fix schema caching in Next.js
delete mongoose.models.History;
const History = mongoose.model("History", HistorySchema);

export default History;
