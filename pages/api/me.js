import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ ok: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await PublicUser.findById(decoded.id).lean();

    if (!user) return res.json({ ok: false });

    return res.json({ ok: true, user });
  } catch {
    return res.json({ ok: false });
  }
}
