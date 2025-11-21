import OpenAI from "openai";
import { buildN8nWorkflow, type WorkflowInput } from "@/lib/n8n";

function hasOpenAI() {
  return !!process.env.OPENAI_API_KEY;
}

export type GeneratedArtifacts = {
  workflow: ReturnType<typeof buildN8nWorkflow>;
  technicalDocs: string;
  usageInstructions: string;
};

export async function generateArtifacts(input: WorkflowInput): Promise<GeneratedArtifacts> {
  const workflow = buildN8nWorkflow(input);

  if (!hasOpenAI()) {
    const technicalDocs = makeRuleBasedDocs(input);
    const usageInstructions = makeRuleBasedUsage(input);
    return { workflow, technicalDocs, usageInstructions };
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system = `Anda adalah arsitek workflow n8n. Hasilkan dokumentasi teknis dan instruksi penggunaan yang ringkas, terstruktur, dan siap dipakai.`;
    const user = `Buat dokumentasi dan instruksi untuk workflow dengan detail berikut:\nTitle: ${input.title}\nTrigger: ${input.trigger}\nActions: ${input.actions}\nIntegrations: ${input.integrations || "-"}\nNotes: ${input.notes || "-"}`;
    const chat = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
    });
    const content = chat.choices[0]?.message?.content || "";
    const [technicalDocs, usageInstructions] = splitDocs(content);
    return { workflow, technicalDocs, usageInstructions };
  } catch {
    // Fallback to rule-based if OpenAI fails
    const technicalDocs = makeRuleBasedDocs(input);
    const usageInstructions = makeRuleBasedUsage(input);
    return { workflow, technicalDocs, usageInstructions };
  }
}

function splitDocs(text: string): [string, string] {
  const marker = "\n---\n";
  if (text.includes(marker)) {
    const [a, b] = text.split(marker);
    return [a.trim(), b.trim()];
  }
  // Best-effort split
  const mid = Math.floor(text.length / 2);
  return [text.slice(0, mid).trim(), text.slice(mid).trim()];
}

function makeRuleBasedDocs(input: WorkflowInput): string {
  return [
    `# Spesifikasi Teknis: ${input.title}`,
    ``,
    `- Trigger: ${input.trigger}`,
    `- Aksi: ${input.actions}`,
    `- Integrasi: ${input.integrations || "-"}`,
    `- Catatan: ${input.notes || "-"}`,
    ``,
    `## Arsitektur Ringkas`,
    `1. Node Manual Trigger (dummy untuk uji lokal).`,
    `2. Node Function menyiapkan payload: title, trigger, actions, dll.`,
    ``,
    `## Kredensial/Variabel`,
    `- Tambahkan kredensial untuk setiap integrasi (mis. Google Sheets API).`,
    `- Variabel lingkungan di n8n (N8N_...) sesuai kebutuhan.`,
  ].join("\n");
}

function makeRuleBasedUsage(input: WorkflowInput): string {
  return [
    `# Instruksi Penggunaan`,
    `1. Import JSON workflow ke n8n.`,
    `2. Konfigurasi kredensial untuk integrasi: ${input.integrations || "-"}.`,
    `3. Sesuaikan parameter aksi di node sesuai kebutuhan.`,
    `4. Aktifkan workflow dan uji trigger: ${input.trigger}.`,
  ].join("\n");
}
