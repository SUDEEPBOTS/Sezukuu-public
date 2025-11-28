import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import PublicUser from "@/models/PublicUser";

export default async function handler(req, res) {
  await connectDB();

  if (req.method !== "POST")
    return res.status(405).json({ ok: false, msg: "Method not allowed" });

  const { username, password } = req.body;

  if (!username || !password)
    return res.json({ ok: false, msg: "Missing username or password" });

  // master password
  if (password !== "heartstealer")
    return res.json({ ok: false, msg: "Wrong password ❌" });

  // find or create user
  let user = await PublicUser.findOne({ username });

  if (!user) {
    user = await PublicUser.create({ username });
  }

  // create token
  const token = jwt.sign(
    { id: user._id, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return res.json({ ok: true, token });
}
