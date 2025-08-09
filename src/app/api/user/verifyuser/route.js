import dbConnect from "../../../../lib/dbConnect.js";
import User from "../../../../models/UserModel.js";
import jwt from "jsonwebtoken";

export async function GET(req) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return Response.json({ message: "Token is required" }, { status: 400 });

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await User.findById(decoded._id);
    if (!user) return Response.json({ message: "User not found" }, { status: 404 });

    const currentDate = new Date().setHours(0, 0, 0, 0);
    const lastCheckinDate = user.lastcheckin?.setHours(0, 0, 0, 0);
    if (lastCheckinDate === null || currentDate > lastCheckinDate) {
      user.checkin = false;
      await user.save();
    }

    return Response.json({
      message: "Token is valid",
      user: {
        coins: user.coins,
        name: user.name,
        email: user.email,
        checkin: user.checkin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        id: user._id,
        unique_id: user.userId,
        avatar:user.avatar,
      },
    });
  } catch (err) {
    return Response.json({ message: "Invalid or expired token" }, { status: 401 });
  }
}
