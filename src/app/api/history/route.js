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
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const recordId = searchParams.get("recordId");

    let query = {};
    
    // If recordId is provided, filter by that specific record
    if (recordId) {
      query.recordId = recordId;
    }

    // Fetch history records, sorted by most recent first
    const historyRecords = await History.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return Response.json({
      message: "History fetched successfully",
      count: historyRecords.length,
      history: historyRecords
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
