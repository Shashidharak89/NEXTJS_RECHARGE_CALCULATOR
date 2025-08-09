import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET; // must be set in .env.local

export function verifyToken(req) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Unauthorized");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // contains _id and other payload
  } catch (error) {
    throw new Error("Invalid token");
  }
}
