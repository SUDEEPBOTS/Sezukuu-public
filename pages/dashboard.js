"use client";

import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [cfg, setCfg] = useState(null);
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===============================
  // LOAD PUBLIC CONFIG
  // ===============================
  useEffect(() => {
    async function loadConfig() {
      const r = await fetch("/api/get-public-config");
      const d = await r.json();
      setCfg(d.config);
    }
    loadConfig();
  }, []);

  if (!cfg)
    return <div className="p-6 text-white">Loading...</div>;

  // Public system OFF
  if (!cfg.publicEnabled) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-white/10 p-8 rounded-2xl backdrop-blur-xl border border-white/20 text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">🚫 Panel Offline</h1>
          <p className="text-gray-200">{cfg.offMessage}</p>
        </div>
      </div>
    );
  }

  // ===============================
  // LOAD USER + BOTS + USER STATS
  // ===============================
  useEffect(() => {
    async function loadDashboard() {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location = "/login";
        return;
      }

      // Load user info
      const me = await axios.get("/api/me", {
        headers: { Authorization: "Bearer " + token }
      });

      if (!me.data.ok) {
        localStorage.removeItem("token");
        window.location = "/login";
        return;
      }

      setUser(me.data.user);

      // Load bots
      const botsRes = await axios.get("/api/my-bots", {
        headers: { Authorization: "Bearer " + token }
      });

      const botList = botsRes.data.bots || [];
      setBots(botList);

      // Load stats
      const botIds = botList.map(b => b._id);
      const statsRes = await axios.post("/api/get-user-stats", { botIds });
      setStats(statsRes.data.stats);

      setLoading(false);
    }
    loadDashboard();
  }, []);

  // ===============================
  // LOGOUT
  // ===============================
  function logout() {
    localStorage.removeItem("token");
    window.location = "/login";
  }

  if (loading || !user || !stats)
    return <div className="p-6 text-xl">Loading dashboard...</div>;

  // ===============================
  // MAIN UI
  // ===============================
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          Welcome, {user.username}
        </h1>

        <button
          onClick={logout}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Logout
        </button>
      </div>

      {/* USER STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-white">

        <div className="p-4 rounded-xl bg-blue-600">
          <h2 className="text-xl font-bold">{stats.totalBots}</h2>
          <p>Total Bots</p>
        </div>

        <div className="p-4 rounded-xl bg-green-600">
          <h2 className="text-xl font-bold">{stats.activeBots}</h2>
          <p>Active Bots</p>
        </div>

        <div className="p-4 rounded-xl bg-orange-600">
          <h2 className="text-xl font-bold">{stats.inactiveBots}</h2>
          <p>Inactive Bots</p>
        </div>

        <div className="p-4 rounded-xl bg-purple-600">
          <h2 className="text-xl font-bold">{stats.totalGroups}</h2>
          <p>Groups Added</p>
        </div>

      </div>

      {/* ADD BOT BUTTON */}
      <div className="mb-6">
        <button
          onClick={() => (window.location = "/add-bot")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Add New Bot
        </button>
      </div>

      {/* BOT LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map((bot) => (
          <div key={bot._id} className="p-4 bg-white rounded shadow">

            <h2 className="text-xl font-semibold mb-2">
              {bot.botName} <span className="text-gray-500">@{bot.botUsername}</span>
            </h2>

            <p className="text-sm mb-2">
              <b>Gender:</b> {bot.gender}
            </p>

            <p className="text-sm mb-2">
              <b>Personality:</b> {bot.personality}
            </p>

            <p className="text-sm mb-3">
              <b>Status:</b>{" "}
              {bot.webhookConnected ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-red-600">Disconnected</span>
              )}
            </p>

            <div className="flex gap-2">

              <button
                onClick={() => (window.location = `/settings?id=${bot._id}`)}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Settings
              </button>

              <button
                onClick={async () => {
                  const token = localStorage.getItem("token");
                  await axios.post(
                    "/api/delete-bot",
                    { botId: bot._id },
                    { headers: { Authorization: "Bearer " + token } }
                  );
                  window.location.reload();
                }}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Delete
              </button>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
