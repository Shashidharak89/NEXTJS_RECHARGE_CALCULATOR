import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
import { verifyToken } from "lib/verifyToken.js";

export async function POST(req) {
  await dbConnect();

  // Verify JWT token
  let decoded;
  try {
    decoded = verifyToken(req);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  const body = await req.json();

  // Name is required
  if (!body.name) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  try {
    // Last recharge date
    const lastRechargeDate = body.lastrecharge
      ? new Date(body.lastrecharge)
      : new Date();

    // Validity (string) - use default if not provided
    const validityDays = body.validity?.toString() || undefined;

    // Amount (string) - use default if not provided
    const amountValue = body.amount?.toString() || undefined;

    // Calculate deadline: lastRecharge + validityDays
    const deadlineDate = new Date(lastRechargeDate);
    deadlineDate.setDate(
      deadlineDate.getDate() + parseInt(validityDays || "28", 10)
    );

    const recharge = await Recharge.create({
      name: body.name,
      phone: body.phone || undefined,
      reason: body.reason || "Recharge",
      lastrecharge: lastRechargeDate,
      amount: amountValue,
      validity: validityDays,
      deadline: deadlineDate,
      closed: false,
      paid:false
    });

    return Response.json(
      { message: "Recharge record created successfully", recharge },
      { status: 201 }
    );
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
