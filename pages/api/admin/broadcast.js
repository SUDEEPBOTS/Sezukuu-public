import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import Group from "@/models/Group";
import Memory from "@/models/Memory";

export default async function handler(req, res) {
  if (req.method !== "POST")
    return res.status(400).json({ ok: false, error: "POST only" });

  await connectDB();

  const { message, mode, botId } = req.body;

  if (!message)
    return res.json({ ok: false, error: "Message missing" });

  try {
    // 1) Get bots to send broadcast
    let bots;

    if (botId === "all") {
      bots = await PublicBot.find({ webhookConnected: true }).lean();
    } else {
      bots = await PublicBot.find({ _id: botId }).lean();
    }

    if (!bots.length)
      return res.json({ ok: false, error: "No bots found" });

    let delivered = 0;

    // 2) LOOP through bots
    for (const bot of bots) {
      const BOT_TOKEN = bot.botToken;

      // Send to groups
      if (mode === "groups" || mode === "all") {
        const groups = await Group.find({ botId: bot._id }).lean();

        for (const g of groups) {
          try {
            await fetch(
              `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: g.chatId,
                  text: message,
                }),
              }
            );
            delivered++;
          } catch {}
        }
      }

      // Send to private chats
      if (mode === "users" || mode === "all") {
        const memories = await Memory.find({ botId: bot._id }).lean();

        for (const m of memories) {
          try {
            await fetch(
              `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  chat_id: m.userId,
                  text: message,
                }),
              }
            );
            delivered++;
          } catch {}
        }
      }
    }

    return res.json({
      ok: true,
      delivered,
    });
  } catch (err) {
    return res.json({
      ok: false,
      error: err.message,
    });
  }
}
