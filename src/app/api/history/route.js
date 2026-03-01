import dbConnect from "lib/dbConnect.js";
import History from "models/HistoryModel.js";
import { verifyToken } from "lib/verifyToken.js";

export async function GET(req) {
  await dbConnect();

  // Verify JWT token
  let decoded;
  try {
    decoded = verifyToken(req);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page  = Math.max(1, parseInt(searchParams.get("page")  || "1",  10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const search   = searchParams.get("search")   || "";
    const action   = searchParams.get("action")   || "";
    const recordId = searchParams.get("recordId") || "";

    const query = {};

    if (recordId) query.recordId = recordId;

    if (action && action !== "ALL") query.action = action;

    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      query.$or = [
        { logMessage: re },
        { userName:   re },
        { changedFields: re },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await History.countDocuments(query);

    const historyRecords = await History.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return Response.json({
      message: "History fetched successfully",
      history: historyRecords,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }, { status: 200 });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  await dbConnect();

  let decoded;
  try {
    decoded = verifyToken(req);
  } catch (err) {
    return Response.json({ error: err.message }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return Response.json({ error: "History entry ID is required" }, { status: 400 });
    }

    const deleted = await History.findByIdAndDelete(id);

    if (!deleted) {
      return Response.json({ error: "History entry not found" }, { status: 404 });
    }

    return Response.json({ message: "History entry deleted successfully" }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
