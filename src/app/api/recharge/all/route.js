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
    const recharges = await Recharge.find()
      .sort({ createdAt: -1 }); // newest first

    return Response.json({ recharges }, { status: 200 });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
