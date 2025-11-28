import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import Group from "@/models/Group";
import Memory from "@/models/Memory";

export default async function handler(req, res) {
  await connectDB();

  try {
    const totalBots = await PublicBot.countDocuments();
    const activeBots = await PublicBot.countDocuments({ webhookConnected: true });
    const inactiveBots = totalBots - activeBots;

    const totalGroups = await Group.countDocuments();
    const topBots = await PublicBot.find({})
      .select("botName botUsername createdAt")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const totalMemory = await Memory.countDocuments();

    return res.status(200).json({
      ok: true,
      stats: {
        totalBots,
        activeBots,
        inactiveBots,
        totalGroups,
        totalMemory,
        topBots,
      },
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
}
