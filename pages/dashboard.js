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
        const r = await fetch("/api/get-public-config");
        const d = await r.json();

        if (!d || !d.ok || !d.config) {
          setCfg({ publicEnabled: false, offMessage: "Config error" });
          setLoading(false);
          return;
        }

        setCfg(d.config);

        if (!d.config.publicEnabled) {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          window.location = "/login";
          return;
        }

        const me = await axios.get("/api/me", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!me.data.ok) {
          localStorage.removeItem("token");
          window.location = "/login";
          return;
        }

        setUser(me.data.user);

        const botsRes = await axios.get("/api/my-bots", {
          headers: { Authorization: "Bearer " + token },
        });

        setBots(botsRes.data.data || []);
      } catch (e) {
        console.error(e);
      }

      setLoading(false);
    }

    loadAll();
  }, []);


  if (loading) return <div>Loading...</div>;
  if (!cfg) return <div>Config error.</div>;
  if (!cfg.publicEnabled) return <div>{cfg.offMessage}</div>;
  if (!user) return <div>Not logged in.</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
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
      </div>

      {/* ADD BOT */}
      <button
        onClick={() => (window.location = "/add-bot")}
        className="px-4 py-2 bg-green-600 text-white rounded mb-6"
      >
        + Add New Bot
      </button>


      {/* BOT LIST */}
      <h2 className="text-xl font-semibold mb-4">Your Bots</h2>

      {bots.length === 0 && (
        <p>No bots created yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {bots.map((bot) => (
          <div key={bot._id} className="p-4 bg-white rounded shadow">

            <h3 className="text-xl font-semibold mb-2">
              {bot.botName} <span className="text-gray-500">@{bot.botUsername}</span>
            </h3>

            <p><b>Gender:</b> {bot.gender}</p>
            <p><b>Personality:</b> {bot.personality}</p>

            <p className="mt-2">
              <b>Status:</b>{" "}
              {bot.webhookConnected ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-red-600">Disconnected</span>
              )}
            </p>

            <button
              onClick={() => window.location = `/settings?id=${bot._id}`}
              className="mt-3 px-3 py-1 bg-blue-600 text-white rounded"
            >
              Settings
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
