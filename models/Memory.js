import mongoose from "mongoose";

const MemorySchema = new mongoose.Schema(
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

    userId: {
      type: String,
      required: true,
    },

    history: {
      type: Array,
      default: [],
    },

    mode: {
      type: String,
      default: "normal",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Memory || mongoose.model("Memory", MemorySchema);
