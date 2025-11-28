import { connectDB } from "@/lib/db";
import PublicConfig from "@/models/PublicConfig";

export default async function handler(req, res) {
  await connectDB();

  const cfg =
    (await PublicConfig.findOne().lean()) ||
    (await PublicConfig.create({}));

  res.json({
    ok: true,
    config: {
      publicEnabled: cfg.publicEnabled,
      offMessage: cfg.offMessage
    }
  });
}
