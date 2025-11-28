import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import PublicBot from "@/models/PublicBot";

export default async function handler(req, res) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return res.json({ ok: false, error: "Unauthorized" });

  const { id } = req.body;

  const bot = await PublicBot.findById(id);
  if (!bot) return res.json({ ok: false, error: "Bot not found" });

  if (bot.userId.toString() !== user.id)
    return res.json({ ok: false, error: "Access denied" });

  const BOT_TOKEN = bot.botToken;

  const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`;

  try {
    await fetch(tgUrl);

    bot.webhookConnected = false;
    await bot.save();

    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: false, error: "Failed to disconnect" });
  }
}
