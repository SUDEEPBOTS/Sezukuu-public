import { useEffect, useState } from "react";
import axios from "axios";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [cfg, setCfg] = useState(null);
  const [user, setUser] = useState(null);
  const [bots, setBots] = useState([]);

  useEffect(() => {
    async function loadAll() {
      try {
        // 1) Load config
        const r = await fetch("/api/get-public-config");
        const d = await r.json();

        if (!d || !d.ok || !d.config) {
          setCfg({ publicEnabled: false, offMessage: "Config error" });
          setLoading(false);
          return;
        }

        setCfg(d.config);

        // If panel OFF → stop
        if (!d.config.publicEnabled) {
          setLoading(false);
          return;
        }

        // 2) Check Token
        const token = localStorage.getItem("token");
        if (!token) {
          window.location = "/login";
          return;
        }

        // 3) Load user
        const me = await axios.get("/api/me", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!me.data.ok) {
          localStorage.removeItem("token");
          window.location = "/login";
          return;
        }

        setUser(me.data.user);

        // 4) Load bots
        const botsRes = await axios.get("/api/my-bots", {
          headers: { Authorization: "Bearer " + token },
        });

        setBots(botsRes.data.data || []);

      } catch (err) {
        console.error("DASHBOARD LOAD ERROR:", err);
      }

      setLoading(false);
    }

    loadAll();
  }, []);

  // -------------------------------------
  // SAFE RENDER (NO HYDRATION CRASH)
  // -------------------------------------

  if (loading) return <div>Loading...</div>;

  if (!cfg) return <div>Config load failed.</div>;

  if (!cfg.publicEnabled) {
    return <div>{cfg.offMessage}</div>;
  }

  if (!user) return <div>User not logged in.</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user.username}
      </h1>

      <button
        onClick={() => {
          localStorage.removeItem("token");
          window.location = "/login";
        }}
        className="px-4 py-2 bg-black text-white rounded"
      >
        Logout
      </button>

      <h2 className="text-xl mt-6 mb-4 font-semibold">Your Bots</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map((bot) => (
          <div key={bot._id} className="p-4 bg-white rounded shadow">
            <h3 className="text-xl font-bold">
              {bot.botName} <span className="text-gray-500">@{bot.botUsername}</span>
            </h3>
            <p>Gender: {bot.gender}</p>
            <p>Personality: {bot.personality}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
