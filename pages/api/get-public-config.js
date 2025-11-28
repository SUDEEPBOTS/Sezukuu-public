import { connectDB } from "@/lib/db";
import PublicConfig from "@/models/PublicConfig";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (err) {
    console.error("DB CONNECT ERROR:", err);
    return res.json({
      ok: false,
      config: {
        publicEnabled: false,
        offMessage: "Server offline: DB connection failed ❌"
      }
    });
  }

  try {
    let cfg = await PublicConfig.findOne().lean();

    // If no config exists → create default
    if (!cfg) {
      cfg = await PublicConfig.create({
        publicEnabled: true,
        offMessage: "Public panel is currently offline."
      });
      cfg = cfg.toObject();
    }

    return res.json({
      ok: true,
      config: {
        publicEnabled: cfg.publicEnabled ?? false,
        offMessage: cfg.offMessage ?? "Server error"
      }
    });

  } catch (err) {
    console.error("CONFIG ERROR:", err);

    return res.json({
      ok: false,
      config: {
        publicEnabled: false,
        offMessage: "Server error: config load failed ❌"
      }
    });
  }
}
