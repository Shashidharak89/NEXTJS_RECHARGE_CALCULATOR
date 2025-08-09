import jwt from "jsonwebtoken";

/**
 * Verifies JWT token and optionally matches it with requested user ID
 * 
 * @param {Request} request - The incoming Next.js request object
 * @param {string|null} userIdFromParams - Optional user ID to match with token
 * @returns {Object} - { valid: true, decoded } OR { valid: false, error, status }
 */
export function verifyTokenAndUser(request, userIdFromParams = null) {
  const { searchParams } = new URL(request.url);
  const tokenFromQS = searchParams.get("token");
  const authHeader = request.headers.get("authorization");

  const token =
    tokenFromQS ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);

  if (!token) {
    return {
      valid: false,
      status: 401,
      error: "JWT token missing",
    };
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    return {
      valid: false,
      status: 401,
      error: "Invalid or expired token",
    };
  }

  // Optional user ID match check
  if (userIdFromParams !== null &&
      decoded._id !== userIdFromParams &&
      decoded.userId !== userIdFromParams) {
    return {
      valid: false,
      status: 403,
      error: "Token does not match requested user",
    };
  }

  return {
    valid: true,
    decoded,
  };
}
