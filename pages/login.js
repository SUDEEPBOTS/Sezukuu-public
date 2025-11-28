import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  async function submit() {
    const res = await axios.post("/api/login", form);

    if (!res.data.ok) {
      setMsg(res.data.msg);
      return;
    }

    // Save token in browser
    localStorage.setItem("token", res.data.token);

    // Redirect
    window.location = "/dashboard";
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-6 bg-white shadow-md rounded w-80">
        <h1 className="text-xl font-bold mb-4 text-center">
          Sezukuu — Public Login
        </h1>

        <input
          className="w-full p-2 mb-3 border rounded"
          placeholder="Enter username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
        />

        <input
          type="password"
          className="w-full p-2 mb-3 border rounded"
          placeholder="Master password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        <button
          onClick={submit}
          className="w-full bg-black text-white p-2 rounded"
        >
          Login
        </button>

        {msg && <p className="mt-3 text-center text-red-600">{msg}</p>}
      </div>
    </div>
  );
        }
