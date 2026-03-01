// app/api/recharge/update/route.js
import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
import History from "models/HistoryModel.js";
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

    // Track changes for history
    const oldValues = {};
    const newValues = {};
    const changedFields = [];

    // Compare and update fields
    if (body.name !== undefined && body.name !== existing.name) {
      oldValues.name = existing.name;
      newValues.name = body.name;
      changedFields.push("name");
      existing.name = body.name;
    }

    if (body.phone !== undefined && body.phone !== existing.phone) {
      oldValues.phone = existing.phone;
      newValues.phone = body.phone;
      changedFields.push("phone");
      existing.phone = body.phone;
    }

    if (body.reason !== undefined && body.reason !== existing.reason) {
      oldValues.reason = existing.reason;
      newValues.reason = body.reason;
      changedFields.push("reason");
      existing.reason = body.reason;
    }

    if (body.amount !== undefined && body.amount !== existing.amount) {
      oldValues.amount = existing.amount;
      newValues.amount = body.amount;
      changedFields.push("amount");
      existing.amount = body.amount;
    }

    if (body.validity !== undefined && body.validity !== existing.validity) {
      oldValues.validity = existing.validity;
      newValues.validity = body.validity;
      changedFields.push("validity");
      existing.validity = body.validity;
    }

    if (body.lastrecharge) {
      const newLastRecharge = new Date(body.lastrecharge);
      if (newLastRecharge.getTime() !== existing.lastrecharge.getTime()) {
        oldValues.lastrecharge = existing.lastrecharge;
        newValues.lastrecharge = newLastRecharge;
        changedFields.push("lastrecharge");
        existing.lastrecharge = newLastRecharge;
      }
    }

    // Update deadline
    const oldDeadline = existing.deadline;
    if (body.deadline) {
      existing.deadline = new Date(body.deadline);
    } else {
      // Recalc deadline if validity or lastrecharge changed
      const d = new Date(existing.lastrecharge);
      d.setDate(d.getDate() + parseInt(existing.validity, 10));
      existing.deadline = d;
    }
    
    if (oldDeadline.getTime() !== existing.deadline.getTime()) {
      oldValues.deadline = oldDeadline;
      newValues.deadline = existing.deadline;
      changedFields.push("deadline");
    }

    // Handle closed tickbox
    if (typeof body.closed === "boolean" && body.closed !== existing.closed) {
      oldValues.closed = existing.closed;
      newValues.closed = body.closed;
      changedFields.push("closed");
      existing.closed = body.closed;
    }

    // Handle paid tickbox
    if (typeof body.paid === "boolean" && body.paid !== existing.paid) {
      oldValues.paid = existing.paid;
      newValues.paid = body.paid;
      changedFields.push("paid");
      existing.paid = body.paid;
    }

    await existing.save();

    // Log history only if there were changes
    if (changedFields.length > 0) {
      try {
        // Create log message
        const changes = changedFields.map(field => {
          const oldVal = oldValues[field];
          const newVal = newValues[field];
          
          // Format dates nicely
          if (oldVal instanceof Date && newVal instanceof Date) {
            return `${field}: ${oldVal.toISOString().split('T')[0]} → ${newVal.toISOString().split('T')[0]}`;
          }
          
          return `${field}: ${oldVal} → ${newVal}`;
        });
        
        const logMessage = `Updated ${existing.name}'s record: ${changes.join(', ')}`;

        await History.create({
          action: "UPDATE",
          recordType: "Recharge",
          recordId: existing._id,
          userId: decoded.userId || decoded.id || "unknown",
          userName: decoded.name || decoded.email || "Unknown User",
          logMessage,
          changedFields,
          oldValues,
          newValues,
          recordSnapshot: existing.toObject()
        });
      } catch (historyErr) {
        console.error("Failed to log history:", historyErr);
      }
    }

    return Response.json(
      { message: "Recharge record updated successfully", recharge: existing },
      { status: 200 }
    );

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
