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

    // Determine validity days (string now)
    const validityDays = body.validity || "28";

    // Determine amount (string now)
    const amountValue = body.amount || "199";

    // Calculate deadline: lastRecharge + validityDays
    const deadlineDate = new Date(lastRechargeDate);
    deadlineDate.setDate(deadlineDate.getDate() + parseInt(validityDays, 10));

    const recharge = await Recharge.create({
      name: body.name,
      phone: body.phone || undefined,       // default: "9999999999"
      reason: body.reason || "Recharge",    // default: "Recharge"
      lastrecharge: lastRechargeDate,
      amount: amountValue,                  // store as string
      validity: validityDays,               // store as string
      deadline: deadlineDate,
      closed: false,
      createdBy: decoded._id || null
    });

    return Response.json(
      {
        message: "Recharge record created successfully",
        recharge
      },
      { status: 201 }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
