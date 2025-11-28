import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";

export default async function handler(req, res) {
  await connectDB();

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ ok: false });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const bots = await PublicBot.find({ userId: decoded.id }).sort({
      createdAt: -1
    });

    return res.json({ ok: true, data: bots });
  } catch {
    return res.json({ ok: false });
  }
}
