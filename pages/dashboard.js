import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [cfg, setCfg] = useState(null);
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState(null);
  const [loading, setLoading] = useState(true);

  // LOAD PUBLIC CONFIG FIRST
  useEffect(() => {
    async function loadConfig() {
      try {
        const r = await fetch("/api/get-public-config");
        const d = await r.json();
        setCfg(d.config);
      } catch {
        setCfg({ publicEnabled: false, offMessage: "Config error" });
      }
    }
    loadConfig();
  }, []);

  if (!cfg) return <div>Loading...</div>;

  if (!cfg.publicEnabled) {
    return <div>Panel Offline: {cfg.offMessage}</div>;
  }

  // LOAD USER + BOTS
  useEffect(() => {
    async function loadUser() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return (window.location = "/login");

        const me = await axios.get("/api/me", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!me.data.ok) {
          localStorage.removeItem("token");
          return (window.location = "/login");
        }

        setUser(me.data.user);

        const botsRes = await axios.get("/api/my-bots", {
          headers: { Authorization: "Bearer " + token },
        });

        setBots(botsRes.data.data || []);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  if (!user) return <div>Loading user...</div>;

  if (!bots) return <div>Loading bots...</div>;

  // -----------------------
  // REAL DASHBOARD UI
  // -----------------------
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.username}</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location = "/login";
          }}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={() => (window.location = "/add-bot")}
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
              <b>Status:</b>{" "}
              {bot.webhookConnected ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-red-600">Disconnected</span>
              )}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}
