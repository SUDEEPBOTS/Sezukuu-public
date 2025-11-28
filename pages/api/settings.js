import { useEffect, useState } from "react";
import axios from "axios";

export default function Settings() {
  const [bot, setBot] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get bot ID from URL
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const botId = params.get("id");

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) return (window.location = "/login");

      const res = await axios.get("/api/my-bots", {
        headers: { Authorization: "Bearer " + token }
      });

      const data = res.data.data || [];
      const found = data.find((b) => b._id === botId);

      if (!found) return (window.location = "/dashboard");

      setBot(found);
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      "/api/update-bot",
      { botId, ...bot },
      { headers: { Authorization: "Bearer " + token } }
    );

    alert(res.data.msg);
  }

  async function connect() {
    const token = localStorage.getItem("token");

    await axios.post(
      process.env.NEXT_PUBLIC_MAIN_URL + "/api/public-admin/control?action=connect",
      { botId },
      { headers: { "Content-Type": "application/json" } }
    );

    alert("Webhook connected ✔");
  }

  async function disconnect() {
    const token = localStorage.getItem("token");

    await axios.post(
      process.env.NEXT_PUBLIC_MAIN_URL + "/api/public-admin/control?action=disconnect",
      { botId },
      { headers: { "Content-Type": "application/json" } }
    );

    alert("Webhook disconnected ❌");
  }

  async function del() {
    const token = localStorage.getItem("token");

    await axios.post(
      "/api/delete-bot",
      { botId },
      { headers: { Authorization: "Bearer " + token } }
    );

    window.location = "/dashboard";
  }

  if (loading) return <div className="p-6 text-xl">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white p-6 w-full max-w-lg rounded shadow">

        <h1 className="text-2xl font-bold mb-4">
          Bot Settings – @{bot.botUsername}
        </h1>

        {/* Bot Name */}
        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Bot Name"
          value={bot.botName}
          onChange={(e) => setBot({ ...bot, botName: e.target.value })}
        />

        {/* Gender */}
        <select
          className="w-full p-2 border rounded mb-3"
          value={bot.gender}
          onChange={(e) => setBot({ ...bot, gender: e.target.value })}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        {/* Personality */}
        <select
          className="w-full p-2 border rounded mb-3"
          value={bot.personality}
          onChange={(e) => setBot({ ...bot, personality: e.target.value })}
        >
          <option value="normal">Normal</option>
          <option value="flirty">Flirty</option>
          <option value="professional">Professional</option>
        </select>

        {/* Owner Name */}
        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Owner Name"
          value={bot.ownerName}
          onChange={(e) => setBot({ ...bot, ownerName: e.target.value })}
        />

        {/* Owner Username */}
        <input
          className="w-full p-2 border rounded mb-3"
          placeholder="Owner Username"
          value={bot.ownerUsername}
          onChange={(e) => setBot({ ...bot, ownerUsername: e.target.value })}
        />

        {/* Buttons */}
        <div className="flex gap-3 mt-4">

          <button
            className="flex-1 bg-blue-600 text-white p-2 rounded"
            onClick={save}
          >
            Save
          </button>

          <button
            className="flex-1 bg-green-600 text-white p-2 rounded"
            onClick={connect}
          >
            Connect
          </button>

          <button
            className="flex-1 bg-yellow-600 text-white p-2 rounded"
            onClick={disconnect}
          >
            Disconnect
          </button>
        </div>

        {/* Delete Btn */}
        <button
          onClick={del}
          className="w-full p-2 mt-5 bg-red-600 text-white rounded"
        >
          Delete Bot
        </button>

      </div>
    </div>
  );
            }
