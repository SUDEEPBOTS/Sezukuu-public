import mongoose from "mongoose";

const GroupSchema = new mongoose.Schema(
  {
    botId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "PublicBot",
    },

    chatId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      default: "",
    },

    username: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      default: "group",
    },

    firstSeenAt: {
      type: Date,
      default: Date.now,
    },

    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Group || mongoose.model("Group", GroupSchema);
