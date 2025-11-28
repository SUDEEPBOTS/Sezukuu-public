
import { useEffect, useState } from "react";
import axios from "axios";
import Router from "next/router";
import BotCard from "@/components/BotCard";

export default function Dashboard() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);

  function logout() {
    localStorage.removeItem("token");
    Router.push("/login");
  }

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");

      if (!token) {
        return Router.push("/login");
      }

      try {
        // 1️⃣ VERIFY TOKEN
        const me = await axios.get("/api/me", {
          headers: { Authorization: "Bearer " + token },
        });

        if (!me.data.ok) {
          localStorage.removeItem("token");
          return Router.push("/login");
        }

        // 2️⃣ LOAD USER BOTS
        const res = await axios.get("/api/my-bots", {
          headers: { Authorization: "Bearer " + token },
        });

        if (res.data.ok) {
          setBots(res.data.bots);
        }

      } catch (err) {
        console.log("Dashboard Error:", err);
        localStorage.removeItem("token");
        return Router.push("/login");
      }

      setLoading(false);
    }

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* NAVBAR */}
      <header className="p-5 bg-black/40 backdrop-blur-xl flex justify-between items-center shadow-lg">
        <h1 className="text-2xl font-bold">Sezukuu Public Panel</h1>

        <button
          onClick={logout}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl active:scale-95 transition"
        >
          Logout
        </button>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-semibold">My Bots</h2>

          <button
            onClick={() => Router.push("/add-bot")}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition"
          >
            + Add New Bot
          </button>
        </div>

        {loading ? (
          <div className="text-gray-300 text-lg">Loading bots...</div>
        ) : bots.length === 0 ? (
          <div className="text-gray-400 text-lg">No bots found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bots.map((bot) => (
              <BotCard key={bot._id} bot={bot} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
