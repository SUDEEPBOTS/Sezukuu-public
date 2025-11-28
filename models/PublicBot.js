import mongoose from "mongoose";

const PublicBotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "PublicUser" },

    botId: String,
    botToken: String,

    botUsername: String,
    botName: String,

    // Persona Settings
    gender: { type: String, default: "female" },
    personality: { type: String, default: "normal" },

    // Owner info
    ownerName: String,
    ownerUsername: String,

    // Optional
    supportGroup: String,

    // Start/Welcome
    startMessage: String,
    welcomeMessage: String,
    welcomeImage: String,

    // Status
    webhookConnected: { type: Boolean, default: false },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

export default mongoose.models.PublicBot ||
  mongoose.model("PublicBot", PublicBotSchema);
