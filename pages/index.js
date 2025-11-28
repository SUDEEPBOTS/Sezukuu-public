import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await axios.get("/api/admin/stats");
      setStats(res.data.stats);
    }
    load();
  }, []);

  if (!stats) return <div className="p-6 text-xl">Loading stats...</div>;

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <h1 className="text-3xl font-bold">Sezukuu 2.5 — Live Stats</h1>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">

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

      {/* RECENT BOTS */}
      <div className="bg-white/10 p-4 rounded-xl border border-white/20">
        <h3 className="text-xl font-bold mb-3">Latest Bots</h3>

        {stats.topBots.map((b) => (
          <div key={b._id} className="p-2 border-b border-white/10">
            <strong>{b.botName}</strong> — @{b.botUsername}
          </div>
        ))}
      </div>

    </div>
  );
}
import { useEffect, useState } from "react";

export default function Login() {
  const [cfg, setCfg] = useState(null);

  useEffect(() => {
    async function load() {
      const r = await fetch("/api/get-public-config");
      const d = await r.json();
      setCfg(d.config);
    }
    load();
  }, []);

  if (!cfg)
    return <div className="p-6 text-white text-xl">Loading...</div>;

  // PUBLIC DISABLED
  if (!cfg.publicEnabled) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white text-center p-6">
        <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl max-w-md border border-white/20">
          <h1 className="text-3xl font-bold mb-4">🚫 Offline</h1>
          <p className="text-gray-300">{cfg.offMessage}</p>
        </div>
      </div>
    );
  }
import { useState } from "react";
import axios from "axios";
import Router from "next/router";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!username || !password) {
      alert("Username & password required");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("/api/login", {
        username,
        password,
      });

      if (res.data.ok) {
        localStorage.setItem("token", res.data.token);
        Router.push("/dashboard");
      } else {
        alert(res.data.error);
      }
    } catch {
      alert("Server error");
    }

    setLoading(false);
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-800 to-gray-900">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/20">
        
        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Sezukuu Public Login
        </h1>

        <input
          type="text"
          placeholder="Enter Username"
          className="w-full p-3 mb-4 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none"
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password (heartstealer)"
          className="w-full p-3 mb-6 rounded bg-white/20 text-white placeholder-gray-300 focus:outline-none"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-all active:scale-95"
        >
          {loading ? "Checking..." : "Login"}
        </button>

      </div>
    </div>
  );
            }
