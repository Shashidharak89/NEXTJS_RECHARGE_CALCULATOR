// app/api/recharge/delete/route.js
import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
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

    return Response.json({
      message: "Recharge record deleted successfully",
      deletedRecord,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
