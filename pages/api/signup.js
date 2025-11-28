import { connectDB } from "@/lib/db";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  const { username } = req.body;

  if (!username)
    return res.json({ ok: false, error: "Missing username" });

  const exists = await PublicUser.findOne({ username });

  if (exists)
    return res.json({ ok: false, error: "Username already exists" });

  await PublicUser.create({ username });
  res.json({ ok: true });
}
