import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";

export default async function handler(req, res) {
  await connectDB();

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ ok: false, msg: "Unauthorized" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.json({ ok: false, msg: "Invalid token" });
  }

  const { botId, botName, gender, personality, ownerName, ownerUsername } =
    req.body;

  await PublicBot.findOneAndUpdate(
    { _id: botId, userId: decoded.id },
    {
      botName,
      gender,
      personality,
      ownerName,
      ownerUsername
    }
  );

  return res.json({ ok: true, msg: "Bot updated ✔" });
}
