import { NextRequest } from "next/server";
import { z } from "zod";
import { generateArtifacts } from "@/lib/ai";

const Schema = z.object({
  title: z.string().min(3),
  trigger: z.string().min(3),
  actions: z.string().min(3),
  integrations: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const json = await req.json();
  const parsed = Schema.safeParse(json);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: "Invalid input", issues: parsed.error.format() }), { status: 400 });
  }
  const out = await generateArtifacts(parsed.data);
  return Response.json(out);
}
