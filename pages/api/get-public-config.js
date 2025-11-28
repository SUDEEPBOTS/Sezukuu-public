import { connectDB } from "@/lib/db";
import PublicConfig from "@/models/PublicConfig";

export default async function handler(req, res) {
  // ALWAYS return same JSON structure
  const safeResponse = (config) =>
    res.json({
      ok: true,
      config: {
        publicEnabled: config.publicEnabled ?? false,
        offMessage: config.offMessage ?? "Server error",
      },
    });

  try {
    await connectDB();
  } catch (err) {
    console.error("DB CONNECT ERROR:", err);

    return safeResponse({
      publicEnabled: false,
      offMessage: "Server offline (DB failed) ❌",
    });
  }

  try {
    let cfg = await PublicConfig.findOne().lean();

    // If no config → create default
    if (!cfg) {
      cfg = await PublicConfig.create({
        publicEnabled: true,
        offMessage: "Public panel is offline.",
      });
      cfg = cfg.toObject();
    }

    return safeResponse(cfg);
  } catch (err) {
    console.error("CONFIG ERROR:", err);

    return safeResponse({
      publicEnabled: false,
      offMessage: "Server error while loading config ❌",
    });
  }
}
