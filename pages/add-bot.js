import { useState } from "react";
import axios from "axios";
import Router from "next/router";

export default function AddBot() {
  const [data, setData] = useState({
    botToken: "",
    botUsername: "",
    botName: "",
    ownerName: "",
    ownerUsername: "",
    gender: "female",
    personality: "normal",
    supportGroup: "",
  });

  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setData({ ...data, [field]: value });
  }

  async function handleSave() {
    const token = localStorage.getItem("token");
    if (!token) return Router.push("/");

    if (!data.botToken || !data.botUsername || !data.botName) {
      return alert("Bot token, username & name required!");
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/add-bot", data, {
        headers: { Authorization: "Bearer " + token },
      });

      if (res.data.ok) {
        alert("Bot added!");
        Router.push("/dashboard");
      } else {
        alert(res.data.error);
      }
    } catch (e) {
      alert("Server error");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Add New Bot</h1>

      <div className="max-w-xl bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-xl">

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Bot Token"
          onChange={(e) => update("botToken", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Bot Username (without @)"
          onChange={(e) => update("botUsername", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Bot Name"
          onChange={(e) => update("botName", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Owner Name"
          onChange={(e) => update("ownerName", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Owner Username"
          onChange={(e) => update("ownerUsername", e.target.value)}
        />

        <select
          className="w-full p-3 mb-4 bg-white/20 rounded"
          onChange={(e) => update("gender", e.target.value)}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        <select
          className="w-full p-3 mb-4 bg-white/20 rounded"
          onChange={(e) => update("personality", e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="flirty">Flirty</option>
          <option value="professional">Professional</option>
        </select>

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          placeholder="Support Group Link"
          onChange={(e) => update("supportGroup", e.target.value)}
        />

        <button
          onClick={handleSave}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition"
        >
          {loading ? "Saving..." : "Save Bot"}
        </button>
      </div>
    </div>
  );
}
