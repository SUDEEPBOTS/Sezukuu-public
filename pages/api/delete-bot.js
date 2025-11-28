import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import PublicBot from "@/models/PublicBot";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return res.json({ ok: false, error: "Unauthorized" });

  const { id } = req.body;

  const bot = await PublicBot.findById(id);
  if (!bot) return res.json({ ok: false, error: "Bot not found" });

  if (bot.userId.toString() !== user.id)
    return res.json({ ok: false, error: "Not allowed" });

  // delete bot
  await PublicBot.deleteOne({ _id: id });

  // reduce bot count
  await PublicUser.updateOne(
    { _id: user.id },
    { $inc: { bots: -1 } }
  );

  res.json({ ok: true });
}
