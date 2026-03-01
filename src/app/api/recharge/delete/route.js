// app/api/recharge/delete/route.js
import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
import History from "models/HistoryModel.js";
import { verifyToken } from "lib/verifyToken.js";

export async function DELETE(req) {
  await dbConnect();

  // Verify JWT Bearer token
  let decoded;
  try {
    decoded = verifyToken(req);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  try {
    const body = await req.json();

    const id = body.id;
    if (!id) {
      return Response.json({ error: "Record ID is required" }, { status: 400 });
    }

    const deletedRecord = await Recharge.findByIdAndDelete(id);

    if (!deletedRecord) {
      return Response.json({ error: "Record not found" }, { status: 404 });
    }

    // Log history
    try {
      await History.create({
        action: "DELETE",
        recordType: "Recharge",
        recordId: deletedRecord._id,
        userId: decoded.userId || decoded.id || "unknown",
        userName: decoded.name || decoded.email || "Unknown User",
        logMessage: `Deleted recharge record for ${deletedRecord.name}`,
        recordSnapshot: deletedRecord.toObject(),
        oldValues: {
          name: deletedRecord.name,
          phone: deletedRecord.phone,
          reason: deletedRecord.reason,
          lastrecharge: deletedRecord.lastrecharge,
          amount: deletedRecord.amount,
          validity: deletedRecord.validity,
          deadline: deletedRecord.deadline,
          closed: deletedRecord.closed,
          paid: deletedRecord.paid
        }
      });
    } catch (historyErr) {
      console.error("Failed to log history:", historyErr);
    }

    return Response.json({
      message: "Recharge record deleted successfully",
      deletedRecord,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
