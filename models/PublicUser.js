import mongoose from "mongoose";

const PublicUserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now },

    // Extra future fields
    banned: { type: Boolean, default: false },
    bots: { type: Number, default: 0 },
  },
  { versionKey: false }
);

export default mongoose.models.PublicUser ||
  mongoose.model("PublicUser", PublicUserSchema);
