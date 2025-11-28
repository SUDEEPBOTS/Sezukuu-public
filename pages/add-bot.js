import { useState } from "react";
import axios from "axios";

export default function AddBot() {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");

  async function submit() {
    setMsg("Checking token…");

    const res = await axios.post(
      "/api/add-bot",
      { botToken: token },
      {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") }
      }
    );

    if (!res.data.ok) {
      setMsg(res.data.msg);
      return;
    }

    setMsg("Bot added successfully ✔");
    setTimeout(() => {
      window.location = "/dashboard";
    }, 800);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white rounded shadow w-96">
        <h1 className="text-2xl font-bold mb-4 text-center">Add New Bot</h1>

        <input
          className="w-full p-2 mb-3 border rounded"
          placeholder="Enter Bot Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />

        <button
          onClick={submit}
          className="w-full bg-black text-white p-2 rounded"
        >
          Add Bot
        </button>

        {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
      </div>
    </div>
  );
        }
