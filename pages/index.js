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
