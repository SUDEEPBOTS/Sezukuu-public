import mongoose from "mongoose";

const PublicConfigSchema = new mongoose.Schema(
  {
    publicEnabled: { type: Boolean, default: true },
    offMessage: { type: String, default: "Public bot panel is currently offline." }
  },
  { versionKey: false }
);

export default mongoose.models.PublicConfig ||
  mongoose.model("PublicConfig", PublicConfigSchema);
