import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
import { verifyToken } from "lib/verifyToken.js";

export async function POST(req) {
  await dbConnect();

  try {
    // ✅ Verify JWT token
    let decoded;
    try {
      decoded = verifyToken(req); // will throw if invalid
    } catch (err) {
      return Response.json({ error: err.message }, { status: 401 });
    }

    // ✅ Parse request body
    const { name, phone, reason, lastrecharge, deadline, closed } = await req.json();

    if (!phone) {
      return Response.json({ error: "Phone number is required" }, { status: 400 });
    }

    // ✅ Create recharge record
    const recharge = await Recharge.create({
      name,
      phone,
      reason,
      lastrecharge,
      deadline,
      closed
    });

    return Response.json({
      message: "Recharge record created successfully",
      createdBy: decoded._id, // optional, shows which user made it
      recharge
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
