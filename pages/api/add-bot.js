import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import PublicBot from "@/models/PublicBot";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return res.json({ ok: false, error: "Unauthorized" });

  const {
    botToken,
    botUsername,
    botName,
    ownerName,
    ownerUsername,
    gender,
    personality,
    supportGroup,
  } = req.body;

  if (!botToken || !botUsername || !botName)
    return res.json({ ok: false, error: "Missing required fields" });

  const dbUser = await PublicUser.findById(user.id);

  if (!dbUser) return res.json({ ok: false, error: "User not found" });

  // Username must be unique
  const exists = await PublicBot.findOne({ botUsername });
  if (exists)
    return res.json({ ok: false, error: "Bot username already exists" });

  const bot = await PublicBot.create({
    userId: dbUser._id,
    botId: Date.now().toString(),
    botToken,
    botUsername,
    botName,
    ownerName,
    ownerUsername,
    gender,
    personality,
    supportGroup,
    webhookConnected: false,
  });

  // increase user's bot count
  dbUser.bots += 1;
  await dbUser.save();

  res.json({ ok: true, bot });
}
