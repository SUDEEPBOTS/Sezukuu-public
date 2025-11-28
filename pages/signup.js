"use client";

import { useState } from "react";
import axios from "axios";

export default function Signup() {
  const [username, setUsername] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSignup() {
    if (!username) return setMsg("Username required");

    const res = await axios.post("/api/signup", { username });

    if (res.data.ok) {
      setMsg("Account created 🎉");
    } else {
      setMsg(res.data.error);
    }
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-white/10 p-6 rounded-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4">Signup</h1>

        <input
          type="text"
          placeholder="Choose username"
          className="w-full p-3 bg-white/20 rounded mb-4"
          onChange={(e) => setUsername(e.target.value)}
        />

        <button
          onClick={handleSignup}
          className="w-full py-2 bg-blue-500 rounded"
        >
          Create Account
        </button>

        {msg && <p className="mt-4 text-center">{msg}</p>}
      </div>
    </div>
  );
        }
