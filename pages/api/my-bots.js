import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import PublicBot from "@/models/PublicBot";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  const user = verifyToken(req);
  if (!user) return res.json({ ok: false, error: "Unauthorized" });

  const dbUser = await PublicUser.findOne({ _id: user.id });

  if (!dbUser) return res.json({ ok: false, error: "User not found" });

  const bots = await PublicBot.find({ userId: dbUser._id }).lean();

  res.json({
    ok: true,
    bots,
  });
}
