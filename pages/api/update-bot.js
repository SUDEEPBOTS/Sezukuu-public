import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import PublicBot from "@/models/PublicBot";

export default async function handler(req, res) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return res.json({ ok: false, error: "Unauthorized" });

  const bot = await PublicBot.findById(req.body._id);

  if (!bot) return res.json({ ok: false, error: "Bot not found" });

  // prevent editing someone else’s bot
  if (bot.userId.toString() !== user.id)
    return res.json({ ok: false, error: "Not allowed" });

  // apply updates
  Object.assign(bot, req.body);
  await bot.save();

  res.json({ ok: true });
}
