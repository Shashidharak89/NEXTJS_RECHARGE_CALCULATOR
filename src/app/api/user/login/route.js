import dbConnect from "../../../../lib/dbConnect.js";
import User from "../../../../models/UserModel.js";
import bcrypt from "bcryptjs";
import createToken from "../../../../utils/createToken.js";

export async function POST(req) {
  await dbConnect();
  const { email, password } = await req.json();

  if (!email || !password) {
    return Response.json({ error: "All fields are required." }, { status: 400 });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return Response.json({ error: "Incorrect email or password." }, { status: 400 });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return Response.json({ error: "Incorrect email or password." }, { status: 400 });
  }

  const token = createToken(user._id);

  return Response.json({
    token,
    id: user._id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  });
}
