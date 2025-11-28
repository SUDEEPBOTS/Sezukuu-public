import { connectDB } from "@/lib/db";
import PublicBot from "@/models/PublicBot";
import Memory from "@/models/Memory";
import Group from "@/models/Group";
import { generateWithYuki } from "@/lib/ai";
import { sendMessage, sendChatAction } from "@/lib/telegram";

// RAW body for Telegram
export const config = {
  api: { bodyParser: false },
};

// Read raw body
function readRaw(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => resolve(data));
  });
}

export default async function handler(req, res) {
  await connectDB();

  const raw = await readRaw(req);
  let update;

  try {
    update = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(200).json({ ok: true });
  }

  const msg = update.message || update.edited_message;
  const chatId = msg?.chat?.id;
  const userId = msg?.from?.id?.toString();
  const userText = msg?.text || msg?.caption || "";
  const chatType = msg?.chat?.type;
  const isGroup = chatType?.includes("group");

  // Bot ID from URL
  const botId = req.query.botId;
  if (!botId) return res.status(200).json({ ok: true });

  const bot = await PublicBot.findById(botId).lean();
  if (!bot) return res.status(200).json({ ok: true });
  if (!bot.webhookConnected) return res.status(200).json({ ok: true });

  const BOT_TOKEN = bot.botToken;
  const botUsername = bot.botUsername.toLowerCase();
  const lower = userText.toLowerCase();

  // ----------------------------------------------------------
  // 1) START COMMAND
  // ----------------------------------------------------------
  if (lower.startsWith("/start")) {
    const text = bot.startMessage || `Hey, I'm *${bot.botName}* ✨`;

    await sendMessage(BOT_TOKEN, chatId, text, {
      parse_mode: "Markdown",
    });

    return res.status(200).json({ ok: true });
  }

  // ----------------------------------------------------------
  // 2) BOT ADDED TO GROUP → WELCOME
  // ----------------------------------------------------------
  if (update.my_chat_member?.new_chat_member?.status === "member") {
    const welcome = bot.welcomeMessage || "Thanks for adding me 💗";

    if (bot.welcomeImage) {
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          caption: welcome,
          photo: bot.welcomeImage,
        }),
      });
    } else {
      await sendMessage(BOT_TOKEN, chatId, welcome);
    }

    // Save group
    await Group.findOneAndUpdate(
      { chatId, botId },
      {
        chatId,
        botId,
        title: msg?.chat?.title || "",
        username: msg?.chat?.username || "",
        type: chatType,
        lastActiveAt: new Date(),
        $setOnInsert: { firstSeenAt: new Date() },
      },
      { upsert: true }
    );

    return res.status(200).json({ ok: true });
  }

  // ----------------------------------------------------------
  // 3) ANTI-LINK
  // ----------------------------------------------------------
  if (isGroup) {
    if (
      lower.includes("http://") ||
      lower.includes("https://") ||
      lower.includes("t.me/")
    ) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: msg.message_id,
          }),
        }
      );
    }
  }

  // ----------------------------------------------------------
  // ADMIN CHECK
  // ----------------------------------------------------------
  async function isAdmin(BOT_TOKEN, chatId, userId) {
    try {
      const r = await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${userId}`
      );
      const data = await r.json();
      if (!data.ok) return false;

      return (
        data.result.status === "administrator" ||
        data.result.status === "creator"
      );
    } catch {
      return false;
    }
  }

  // ----------------------------------------------------------
  // 4) COMMANDS SYSTEM (ban/mute/kick/unmute)
  // ----------------------------------------------------------
  if (
    lower.startsWith("/ban") ||
    lower.startsWith("/kick") ||
    lower.startsWith("/mute") ||
    lower.startsWith("/unmute")
  ) {
    if (!isGroup) {
      await sendMessage(BOT_TOKEN, chatId, "Ye command sirf groups me chalta hai.");
      return res.status(200).json({ ok: true });
    }

    const admin = await isAdmin(BOT_TOKEN, chatId, msg.from.id);
    if (!admin) {
      await sendMessage(BOT_TOKEN, chatId, "⛔ Sirf admin ye command use kar sakta!");
      return res.status(200).json({ ok: true });
    }

    const victim = msg.reply_to_message?.from;
    if (!victim) {
      await sendMessage(BOT_TOKEN, chatId, "Reply karke ban/mute karo.");
      return res.status(200).json({ ok: true });
    }

    const victimId = victim.id;

    // BAN
    if (lower.startsWith("/ban")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chat_id: chatId, user_id: victimId }),
        }
      );

      await sendMessage(BOT_TOKEN, chatId, `🚫 User banned.`);
    }

    // KICK
    else if (lower.startsWith("/kick")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/banChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: victimId,
            until_date: Math.floor(Date.now() / 1000) + 10,
          }),
        }
      );

      await sendMessage(BOT_TOKEN, chatId, `👢 User kicked.`);
    }

    // MUTE
    else if (lower.startsWith("/mute")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/restrictChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: victimId,
            permissions: { can_send_messages: false },
          }),
        }
      );

      await sendMessage(BOT_TOKEN, chatId, `🔇 User muted.`);
    }

    // UNMUTE
    else if (lower.startsWith("/unmute")) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/restrictChatMember`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            user_id: victimId,
            permissions: { can_send_messages: true },
          }),
        }
      );

      await sendMessage(BOT_TOKEN, chatId, `🔊 User unmuted.`);
    }

    return res.status(200).json({ ok: true });
  }

  // ----------------------------------------------------------
  // 5) ANTI-SPAM
  // ----------------------------------------------------------
  if (isGroup) {
    const last = global.lastMsg || {};
    const key = chatId + "-" + userId;
    const now = Date.now();

    if (last[key] && now - last[key] < 1200) {
      await fetch(
        `https://api.telegram.org/bot${BOT_TOKEN}/deleteMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: msg.message_id,
          }),
        }
      );
    }

    last[key] = now;
    global.lastMsg = last;
  }

  // ----------------------------------------------------------
  // 6) STRICT GROUP REPLY MODE
  // ----------------------------------------------------------
  let shouldReply = false;

  if (!isGroup) shouldReply = true;
  else {
    if (lower.includes("@" + botUsername)) shouldReply = true;
    if (
      msg.reply_to_message?.from?.username?.toLowerCase() === botUsername
    )
      shouldReply = true;
    if (lower.includes(bot.botName.toLowerCase())) shouldReply = true;
  }

  if (isGroup && !shouldReply)
    return res.status(200).json({ ok: true });

  // ----------------------------------------------------------
  // 7) MEMORY SYSTEM
  // ----------------------------------------------------------
  let memory = await Memory.findOne({ botId, chatId, userId });

  if (!memory) {
    memory = await Memory.create({
      botId,
      chatId,
      userId,
      history: [],
      mode: bot.personality,
    });
  }

  memory.history.push({ role: "user", text: userText });
  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);

  await memory.save();

  const conversation = memory.history
    .map((m) => `${m.role === "user" ? "User" : "Bot"}: ${m.text}`)
    .join("\n");

  // ----------------------------------------------------------
  // 8) AI PROMPT SYSTEM
  // ----------------------------------------------------------
  const toneMap = {
    normal: "Friendly, soft Hinglish, sweet natural tone.",
    flirty: "Cute flirty tone, playful, emojis allowed.",
    professional: "Calm, respectful, no flirting.",
  };

  const genderLine =
    bot.gender === "male"
      ? "Tum 19 saal ke Delhi ke ladke ho."
      : "Tum 18 saal ki cute Delhi girl ho.";

  const ownerRule = `
Tumhara real owner sirf *${bot.ownerName}* hai.
Owner ka naam tabhi lo jab koi specifically pooche.
`;

  const finalPrompt = `
Tumhara naam *${bot.botName}* hai.
${genderLine}
${toneMap[bot.personality]}
${ownerRule}

Conversation:
${conversation}

User: ${userText}
Bot:
`;

  await sendChatAction(BOT_TOKEN, chatId, "typing");

  let reply = "Oops, error 😅";
  try {
    reply = await generateWithYuki(finalPrompt);
  } catch {}

  memory.history.push({ role: "bot", text: reply });
  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);
  await memory.save();

  await sendMessage(BOT_TOKEN, chatId, reply);

  return res.status(200).json({ ok: true });
}
