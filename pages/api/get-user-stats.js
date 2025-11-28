import { connectDB } from "@/lib/db";
import Group from "@/models/Group";
import Memory from "@/models/Memory";

export default async function handler(req, res) {
  await connectDB();

  try {
    const { botIds } = req.body;

    const groups = await Group.countDocuments({ botId: { $in: botIds } });
    const chats = await Memory.countDocuments({ botId: { $in: botIds } });

    return res.json({
      ok: true,
      stats: {
        totalGroups: groups,
        totalChats: chats,
      },
    });
  } catch (e) {
    return res.json({ ok: false, error: e.message });
  }
}
