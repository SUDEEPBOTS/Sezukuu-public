import { useEffect, useState } from "react";
import axios from "axios";
import Router, { useRouter } from "next/router";

export default function EditBot() {
  const router = useRouter();
  const { id } = router.query;

  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  function update(field, value) {
    setData({ ...data, [field]: value });
  }

  async function loadBot() {
    const token = localStorage.getItem("token");
    if (!token) return Router.push("/");

    try {
      const res = await axios.get("/api/my-bots", {
        headers: { Authorization: "Bearer " + token },
      });

      const bot = res.data.bots.find((b) => b._id === id);
      if (!bot) return Router.push("/dashboard");

      setData(bot);
      setLoading(false);
    } catch {
      Router.push("/dashboard");
    }
  }

  useEffect(() => {
    if (id) loadBot();
  }, [id]);

  async function save() {
    const token = localStorage.getItem("token");
    setLoading(true);

    const res = await axios.post("/api/update-bot", data, {
      headers: { Authorization: "Bearer " + token },
    });

    alert(res.data.ok ? "Updated!" : res.data.error);
    setLoading(false);
  }

  async function deleteBot() {
    if (!confirm("Delete this bot?")) return;

    const token = localStorage.getItem("token");
    const res = await axios.post(
      "/api/delete-bot",
      { id },
      { headers: { Authorization: "Bearer " + token } }
    );

    if (res.data.ok) {
      alert("Bot deleted");
      Router.push("/dashboard");
    } else {
      alert("Error");
    }
  }

  // ---------- ADD WEBHOOK BUTTONS ----------
  async function connectWebhook() {
    const token = localStorage.getItem("token");

    const r = await axios.post(
      "/api/connect-webhook",
      { id: data._id },
      { headers: { Authorization: "Bearer " + token } }
    );

    if (r.data.ok) {
      alert("Webhook connected!");
      Router.reload();
    } else {
      alert(r.data.error || "Failed");
    }
  }

  async function disconnectWebhook() {
    const token = localStorage.getItem("token");
    if (!confirm("Disconnect webhook?")) return;

    const r = await axios.post(
      "/api/disconnect-webhook",
      { id: data._id },
      { headers: { Authorization: "Bearer " + token } }
    );

    if (r.data.ok) {
      alert("Webhook disconnected");
      Router.reload();
    } else {
      alert(r.data.error || "Failed");
    }
  }

  if (loading)
    return <div className="text-white p-6">Loading bot...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">

      <h1 className="text-3xl font-bold mb-6">
        Edit Bot – {data.botName}
      </h1>

      <div className="max-w-xl bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-xl">

        {/* WEBHOOK STATUS + BUTTONS */}
        <div className="flex items-center justify-between mb-6 p-3 bg-black/20 rounded-xl">
          <span className="text-lg font-semibold">
            Status:{" "}
            {data.webhookConnected ? (
              <span className="text-green-400">Connected</span>
            ) : (
              <span className="text-red-400">Disconnected</span>
            )}
          </span>

          {data.webhookConnected ? (
            <button
              onClick={disconnectWebhook}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl active:scale-95"
            >
              Disconnect
            </button>
          ) : (
            <button
              onClick={connectWebhook}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl active:scale-95"
            >
              Connect
            </button>
          )}
        </div>

        {/* BOT UPDATE FIELDS */}
        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.botName}
          onChange={(e) => update("botName", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.botUsername}
          onChange={(e) => update("botUsername", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.ownerName}
          onChange={(e) => update("ownerName", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.ownerUsername}
          onChange={(e) => update("ownerUsername", e.target.value)}
        />

        <select
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.gender}
          onChange={(e) => update("gender", e.target.value)}
        >
          <option value="female">Female</option>
          <option value="male">Male</option>
        </select>

        <select
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.personality}
          onChange={(e) => update("personality", e.target.value)}
        >
          <option value="normal">Normal</option>
          <option value="flirty">Flirty</option>
          <option value="professional">Professional</option>
        </select>

        <textarea
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.startMessage}
          placeholder="Start Message"
          onChange={(e) => update("startMessage", e.target.value)}
        />

        <textarea
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.welcomeMessage}
          placeholder="Welcome Message"
          onChange={(e) => update("welcomeMessage", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.welcomeImage}
          placeholder="Welcome Image URL"
          onChange={(e) => update("welcomeImage", e.target.value)}
        />

        <input
          className="w-full p-3 mb-4 bg-white/20 rounded"
          value={data.supportGroup}
          placeholder="Support Group"
          onChange={(e) => update("supportGroup", e.target.value)}
        />

        {/* SAVE BUTTON */}
        <button
          onClick={save}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-xl mb-4 transition"
        >
          Save Changes
        </button>

        {/* DELETE BUTTON */}
        <button
          onClick={deleteBot}
          className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl transition"
        >
          Delete Bot
        </button>

      </div>
    </div>
  );
            }
