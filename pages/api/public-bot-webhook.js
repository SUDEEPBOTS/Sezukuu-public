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

  // Read raw
  const raw = await readRaw(req);
  let update;

  try {
    update = JSON.parse(raw.toString("utf8"));
  } catch {
    return res.status(200).json({ ok: true });
  }

  // Extract message
  const msg = update.message || update.edited_message;
  const chatId = msg?.chat?.id;
  const userId = msg?.from?.id?.toString();
  const userText = msg?.text || msg?.caption || "";
  const chatType = msg?.chat?.type;
  const isGroup = chatType?.includes("group");

  // Bot ID from URL
  const botId = req.query.botId;
  if (!botId) return res.status(200).json({ ok: true });

  // Load bot info
  const bot = await PublicBot.findById(botId).lean();
  if (!bot) return res.status(200).json({ ok: true });

  if (!bot.webhookConnected) return res.status(200).json({ ok: true });

  const BOT_TOKEN = bot.botToken;
  const botUsername = bot.botUsername?.toLowerCase();
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
  // 2) BOT GETS ADDED TO GROUP — WELCOME MESSAGE
  // ----------------------------------------------------------
  if (update.my_chat_member?.new_chat_member?.status === "member") {
    const welcome = bot.welcomeMessage || "Thanks for adding me 💗";

    // If image available
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

    // Save group info
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
  // 3) MODERATION (Anti-Link)
  // ----------------------------------------------------------
  if (isGroup) {
    if (lower.includes("http://") || lower.includes("https://") || lower.includes("t.me/")) {
      // Delete message
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

  async function isAdmin(BOT_TOKEN, chatId, userId) {
  try {
    const r = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/getChatMember?chat_id=${chatId}&user_id=${userId}`
    );
    const data = await r.json();

    if (!data.ok) return false;

    const status = data.result.status;

    return (
      status === "administrator" ||
      status === "creator"
    );
  } catch {
    return false;
  }
  }
  // ----------------------------------------------------------
  // 4) STRICT GROUP REPLY MODE
  // ----------------------------------------------------------
  let shouldReply = false;

  if (!isGroup) {
    shouldReply = true; // DM always reply
  } else {
    // Mention
    if (lower.includes("@" + botUsername)) shouldReply = true;

    // Reply to bot's message
    if (msg.reply_to_message?.from?.username?.toLowerCase() === botUsername)
      shouldReply = true;

    // Name call
    if (lower.includes(bot.botName.toLowerCase())) shouldReply = true;
  }

  if (isGroup && !shouldReply) return res.status(200).json({ ok: true });

  // ----------------------------------------------------------
  // 5) MEMORY SYSTEM
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
  // 6) AI PROMPT SYSTEM
  // ----------------------------------------------------------
  const toneMap = {
    normal: "Friendly, soft Hinglish, sweet natural tone.",
    flirty: "Cute flirty tone, fun, playful, emojis allowed.",
    professional: "Polite, calm, respectful. No flirting.",
  };

  const genderLine =
    bot.gender === "male"
      ? "Tum 19 saal ke Delhi ke ladke ho."
      : "Tum 18 saal ki Delhi ki cute girl ho.";

  const ownerRule = `
Tumhara real owner sirf *${bot.ownerName}* hai.
Owner ka naam tabhi lo jab koi specifically owner ke baare me pooche.
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

  // ----------------------------------------------------------
  // 7) TYPING + AI GENERATION
  // ----------------------------------------------------------
  await sendChatAction(BOT_TOKEN, chatId, "typing");

  let reply = "Oops, error 😅";
  try {
    reply = await generateWithYuki(finalPrompt);
  } catch (err) {
    console.log("AI ERROR:", err);
  }

  memory.history.push({ role: "bot", text: reply });
  if (memory.history.length > 10)
    memory.history = memory.history.slice(-10);

  await memory.save();

  // ----------------------------------------------------------
  // 8) SEND REPLY
  // ----------------------------------------------------------
  await sendMessage(BOT_TOKEN, chatId, reply);

  return res.status(200).json({ ok: true });
}
