import { NextRequest } from "next/server";
import { getSession, resetSession, setSession } from "@/lib/storage";
import { generateArtifacts } from "@/lib/ai";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function sendMessage(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`${API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch {}
}

export async function POST(req: NextRequest) {
  if (!TELEGRAM_BOT_TOKEN) {
    return new Response("Missing TELEGRAM_BOT_TOKEN", { status: 500 });
  }
  const update = await req.json();
  const message = update.message || update.edited_message;
  if (!message) return Response.json({ ok: true });

  const chatId: number = message.chat.id;
  const chatKey = String(chatId);
  const text: string = message.text || "";

  if (text.startsWith("/start")) {
    resetSession(chatKey);
    await sendMessage(chatId, "Halo! Saya asisten n8n. Gunakan /newflow untuk memulai.");
    return Response.json({ ok: true });
  }

  if (text.startsWith("/help")) {
    await sendMessage(chatId, "Perintah: /newflow untuk membuat workflow, /cancel untuk batal.");
    return Response.json({ ok: true });
  }

  if (text.startsWith("/cancel")) {
    resetSession(chatKey);
    await sendMessage(chatId, "Sesi dibatalkan.");
    return Response.json({ ok: true });
  }

  if (text.startsWith("/newflow")) {
    setSession(chatKey, { step: "ask_title", data: {} });
    await sendMessage(chatId, "Baik, mari mulai. Judul workflow?");
    return Response.json({ ok: true });
  }

  // Interactive mode
  const state = getSession(chatKey);
  if (state.step === "ask_title") {
    state.data.title = text.trim();
    state.step = "ask_trigger";
    setSession(chatKey, state);
    await sendMessage(chatId, "Apa trigger-nya? (mis: Telegram command /lead)");
    return Response.json({ ok: true });
  }
  if (state.step === "ask_trigger") {
    state.data.trigger = text.trim();
    state.step = "ask_actions";
    setSession(chatKey, state);
    await sendMessage(chatId, "Deskripsikan aksi yang diinginkan.");
    return Response.json({ ok: true });
  }
  if (state.step === "ask_actions") {
    state.data.actions = text.trim();
    state.step = "ask_integrations";
    setSession(chatKey, state);
    await sendMessage(chatId, "Integrasi yang diperlukan? (pisahkan dengan koma) atau ketik -");
    return Response.json({ ok: true });
  }
  if (state.step === "ask_integrations") {
    state.data.integrations = text.trim() === "-" ? undefined : text.trim();
    state.step = "ask_notes";
    setSession(chatKey, state);
    await sendMessage(chatId, "Catatan tambahan? (opsional) atau ketik -");
    return Response.json({ ok: true });
  }
  if (state.step === "ask_notes") {
    state.data.notes = text.trim() === "-" ? undefined : text.trim();
    state.step = "complete";
    setSession(chatKey, state);
    try {
      const artifacts = await generateArtifacts({
        title: state.data.title!,
        trigger: state.data.trigger!,
        actions: state.data.actions!,
        integrations: state.data.integrations,
        notes: state.data.notes,
      });
      await sendMessage(chatId, `Workflow: ${artifacts.workflow.name}`);
      await sendMessage(chatId, `Dok teknis:\n${artifacts.technicalDocs.slice(0, 3500)}`);
      await sendMessage(chatId, `Instruksi:\n${artifacts.usageInstructions.slice(0, 3500)}`);
      await sendMessage(chatId, `JSON (potongan):\n${JSON.stringify(artifacts.workflow).slice(0, 3500)}`);
      resetSession(chatKey);
    } catch (e) {
      await sendMessage(chatId, "Terjadi kesalahan saat menghasilkan workflow.");
      resetSession(chatKey);
    }
    return Response.json({ ok: true });
  }

  // If no active session, offer help
  if (state.step === "idle") {
    await sendMessage(chatId, "Ketik /newflow untuk memulai pembuatan workflow.");
  }
  return Response.json({ ok: true });
}
