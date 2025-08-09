import dbConnect from "../../../lib/dbConnect.js";
import User from "../../../models/UserModel.js";
import bcrypt from "bcryptjs";
import createToken from "../../../utils/createToken.js";

export async function POST(req) {
  await dbConnect();
  const { email, password, name } = await req.json();

  if (!email || !password || !name) {
    return Response.json(
      { error: "All fields are required." },
      { status: 400 }
    );
  }

  // Check if user already exists
  const exist = await User.findOne({ email });
  if (exist) {
    return Response.json(
      { error: "Email is already taken." },
      { status: 400 }
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());

  try {
    const user = await User.create({
      email,
      password: hashedPassword,
      name
    });

    // Create token
    const token = createToken(user._id);

    return Response.json({
      token,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      id: user._id,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
