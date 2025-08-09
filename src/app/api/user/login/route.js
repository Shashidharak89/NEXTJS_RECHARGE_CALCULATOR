import dbConnect from "../../../../lib/dbConnect.js";
import User from "../../../../models/UserModel.js";
import bcrypt from "bcryptjs";
import createToken from "../../../../utils/createToken.js";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  if (!email || !password)
    return Response.json({ error: "All fields are required." }, { status: 400 });

  const user = await User.findOne({ email });
  if (!user) return Response.json({ error: "Incorrect email." }, { status: 400 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return Response.json({ error: "Incorrect password." }, { status: 400 });

  const currentDate = new Date().setHours(0, 0, 0, 0);
  const lastCheckin = user.lastcheckin?.setHours(0, 0, 0, 0);

  if (lastCheckin === null || currentDate > lastCheckin) {
    user.checkin = false;
    await user.save();
  }

  const token = createToken(user._id);

  return Response.json({
    token,
    email: user.email,
    coins: user.coins,
    checkin: user.checkin,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    id: user._id,
    avatar:user.avatar,
  });
}
