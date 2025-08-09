// app/api/recharge/route.js
import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
import { verifyToken } from "lib/verifyToken.js";

export async function POST(req) {
  await dbConnect();

  // Verify JWT Bearer token
  let decoded;
  try {
    decoded = verifyToken(req);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const body = await req.json();

  // Name is mandatory
  if (!body.name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    // Determine lastrecharge date
    const lastRechargeDate = body.lastrecharge
      ? new Date(body.lastrecharge)
      : new Date();

    // Determine validity days
    const validityDays = body.validity || 28;

    // Calculate deadline from lastrecharge + validity
    const deadlineDate = new Date(lastRechargeDate);
    deadlineDate.setDate(deadlineDate.getDate() + validityDays);

    const recharge = await Recharge.create({
      name: body.name,
      phone: body.phone || undefined,     // default: "9999999999"
      reason: body.reason || "Recharge",     // default: ""
      lastrecharge: lastRechargeDate,
      amount: body.amount || undefined,   // default: 199
      validity: validityDays,
      deadline: deadlineDate,             // calculated automatically
      closed: false,                       // always false
      createdBy: decoded._id               // optional
    });

    return Response.json(
      {
        message: "Recharge record created successfully",
        createdBy: decoded._id,
        recharge
      },
      { status: 201 }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
