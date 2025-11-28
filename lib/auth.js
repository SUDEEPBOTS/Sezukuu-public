import jwt from "jsonwebtoken";

export function verifyToken(req) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return null;

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}
