import { useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";

export default function Dashboard() {
  const [cfg, setCfg] = useState(null);
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  // FIRST — LOAD CONFIG
  useEffect(() => {
    async function loadConfig() {
      try {
        const r = await fetch("/api/get-public-config");
        const d = await r.json();
        setCfg(d.config);
      } catch {
        setCfg({
          publicEnabled: false,
          offMessage: "Server Error",
        });
      }
    }

    loadConfig();
  }, []);

  // WAIT until cfg comes
  if (cfg === null) {
    return (
      <div className="p-6 text-white text-xl bg-gray-900 h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  // PANEL OFFLINE
  if (!cfg.publicEnabled) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="bg-white/10 p-8 rounded-2xl border border-white/20 backdrop-blur-xl max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4">🚫 Panel Offline</h1>
          <p className="text-gray-200">{cfg.offMessage}</p>
        </div>
      </div>
    );
  }

  // LOAD USER + BOTS
  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem("token");
      if (!token) return Router.push("/login");

      const me = await axios.get("/api/me", {
        headers: { Authorization: "Bearer " + token },
      });

      if (!me.data.ok) {
        localStorage.removeItem("token");
        return Router.push("/login");
      }

      setUser(me.data.user);

      const botsRes = await axios.get("/api/my-bots", {
        headers: { Authorization: "Bearer " + token },
      });

      setBots(botsRes.data.data || []);
      setLoading(false);
    }

    loadUser();
  }, []);

  // DASHBOARD LOADING SCREEN
  if (loading || !user) {
    return (
      <div className="p-6 text-xl bg-gray-900 text-white h-screen flex items-center justify-center">
        Loading Dashboard...
      </div>
    );
  }

  // REAL DASHBOARD
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.username}</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            Router.push("/login");
          }}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={() => Router.push("/add-bot")}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          + Add New Bot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map((bot) => (
          <div key={bot._id} className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold mb-2">
              {bot.botName} <span className="text-gray-500">@{bot.botUsername}</span>
            </h2>

            <p className="text-sm mb-2"><b>Gender:</b> {bot.gender}</p>
            <p className="text-sm mb-2"><b>Personality:</b> {bot.personality}</p>
            <p className="text-sm mb-3">
              <b>Status:</b> {" "}
              {bot.webhookConnected ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-red-600">Disconnected</span>
              )}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => Router.push(`/settings?id=${bot._id}`)}
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
