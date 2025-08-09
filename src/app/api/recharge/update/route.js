// app/api/recharge/update/route.js
import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
import { verifyToken } from "lib/verifyToken.js";

export async function PUT(req) {
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

    // Get ID from body (since not always in params)
    const { id } = body;
    if (!id) {
      return Response.json({ error: "Recharge record ID is required" }, { status: 400 });
    }

    // Find existing record
    const existing = await Recharge.findById(id);
    if (!existing) {
      return Response.json({ error: "Record not found" }, { status: 404 });
    }

    // Update fields only if provided, else keep existing
    existing.name = body.name ?? existing.name;
    existing.phone = body.phone ?? existing.phone;
    existing.reason = body.reason ?? existing.reason;
    existing.amount = body.amount ?? existing.amount;
    existing.validity = body.validity ?? existing.validity;
    existing.lastrecharge = body.lastrecharge ? new Date(body.lastrecharge) : existing.lastrecharge;
    existing.deadline = body.deadline
      ? new Date(body.deadline)
      : (() => {
          // If validity or lastrecharge changed, recalc deadline
          const d = new Date(existing.lastrecharge);
          d.setDate(d.getDate() + parseInt(existing.validity, 10));
          return d;
        })();

    // Handle closed tickbox
    if (typeof body.closed === "boolean") {
      existing.closed = body.closed;
    }

    await existing.save();

    return Response.json(
      { message: "Recharge record updated successfully", recharge: existing },
      { status: 200 }
    );

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
