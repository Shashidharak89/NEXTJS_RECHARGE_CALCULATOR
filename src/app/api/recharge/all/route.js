import dbConnect from "lib/dbConnect.js";
import Recharge from "models/RechargeModel.js";
import { verifyToken } from "lib/verifyToken.js";

export async function GET(req) {
  await dbConnect();

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
    const search = searchParams.get("search") || "";

    const query = {};

    if (search.trim()) {
      const re = new RegExp(search.trim(), "i");
      query.$or = [
        { name:   re },
        { phone:  re },
        { reason: re },
        { amount: re },
      ];
    }

    const skip  = (page - 1) * limit;
    const total = await Recharge.countDocuments(query);

    // Sort: open first, then by createdAt desc
    const recharges = await Recharge.find(query)
      .sort({ closed: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return Response.json({ recharges, total, page, limit, totalPages: Math.ceil(total / limit) }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
