import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    role: { type: String, default: "public" }, // for future admin users
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

export default mongoose.models.User ||
  mongoose.model("User", UserSchema);
