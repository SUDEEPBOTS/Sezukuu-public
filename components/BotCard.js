import Router from "next/router";

export default function BotCard({ bot }) {
  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
      onClick={() => Router.push(`/bot/${bot._id}`)}
    >
      <h1 className="text-xl font-bold">{bot.botName}</h1>
      <p className="text-gray-300">@{bot.botUsername}</p>

      <div className="mt-3">
        <span
          className={`px-3 py-1 rounded-xl text-sm ${
            bot.webhookConnected
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {bot.webhookConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={(e) => {
            e.stopPropagation();
            Router.push(`/edit-bot/${bot._id}`);
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl active:scale-95 transition"
        >
          Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            Router.push(`/delete-bot/${bot._id}`);
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-xl active:scale-95 transition"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
