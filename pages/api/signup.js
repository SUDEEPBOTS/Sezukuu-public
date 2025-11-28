import { connectDB } from "@/lib/db";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST")
    return res.status(405).json({ ok: false, error: "Method not allowed" });

  const { username } = req.body;

  if (!username)
    return res.json({ ok: false, error: "Missing username" });

  const exists = await PublicUser.findOne({ username });

  if (exists)
    return res.json({ ok: false, error: "Username already exists" });

  await PublicUser.create({ username });

  return res.json({ ok: true });
}
