import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import PublicUser from "@/models/PublicUser";
import PublicBot from "@/models/PublicBot";
import axios from "axios";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST")
    return res.status(405).json({ ok: false, msg: "Method not allowed" });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.json({ ok: false, msg: "Unauthorized" });

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.json({ ok: false, msg: "Invalid token" });
  }

  const { botToken } = req.body;

  if (!botToken) return res.json({ ok: false, msg: "Missing bot token" });

  // CHECK BOT TOKEN VALIDITY
  try {
    const me = await fetch(
      `https://api.telegram.org/bot${botToken}/getMe`
    ).then((r) => r.json());

    if (!me.ok) return res.json({ ok: false, msg: "Invalid bot token ❌" });

    const username = me.result.username;

    // Create bot entry
    const bot = await PublicBot.create({
      userId: decoded.id,
      botToken,
      botId: me.result.id,
      botUsername: username,
      botName: username,
      gender: "female",
      personality: "normal",
      ownerName: decoded.username,
      ownerUsername: decoded.username,
      webhookConnected: false
    });

    // REQUEST MAIN PANEL TO CONNECT WEBHOOK
    await axios.post(
      process.env.MAIN_URL + "/api/public-admin/control?action=connect",
      { botId: bot._id, botToken },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.json({ ok: true, msg: "Bot added", bot });
  } catch (e) {
    return res.json({ ok: false, msg: "Token error or invalid bot token" });
  }
}
