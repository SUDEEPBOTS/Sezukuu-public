import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST") {
    return res.json({ ok: false, error: "Method not allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({ ok: false, error: "Missing fields" });
  }

  // HARD-CODED TEMP MASTER PASSWORD
  const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "yuki742123";

  if (password !== MASTER_PASSWORD) {
    return res.json({ ok: false, error: "Invalid password" });
  }

  let user = await PublicUser.findOne({ username });

  if (!user) {
    user = await PublicUser.create({ username });
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    ok: true,
    token,
    user: {
      id: user._id,
      username: user.username,
    }
  });
}
