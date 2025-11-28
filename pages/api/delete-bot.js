import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";

export default async function handler(req, res) {
  await connectDB();

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ ok: false });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.json({ ok: false });
  }

  const { botId } = req.body;

  await PublicBot.findOneAndDelete({ _id: botId, userId: decoded.id });

  return res.json({ ok: true, msg: "Bot deleted ✔" });
}
