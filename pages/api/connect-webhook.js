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

  // webhook URL
  const webhookUrl = `${process.env.NEXT_PUBLIC_MAIN_URL}/api/public-bot-webhook?botId=${bot._id}`;

  // Telegram webhook register
  const tgUrl = `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(
    webhookUrl
  )}`;

  try {
    const r = await fetch(tgUrl);
    const data = await r.json();

    if (!data.ok) {
      return res.json({ ok: false, error: "Failed to set webhook" });
    }

    bot.webhookConnected = true;
    await bot.save();

    return res.json({ ok: true });
  } catch (e) {
    return res.json({ ok: false, error: "Telegram error" });
  }
}
