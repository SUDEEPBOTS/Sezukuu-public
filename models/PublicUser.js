import mongoose from "mongoose";

const PublicUserSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.PublicUser ||
  mongoose.model("PublicUser", PublicUserSchema);
