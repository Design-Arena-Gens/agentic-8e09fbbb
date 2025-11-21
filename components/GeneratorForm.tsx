"use client";

import React, { useMemo, useState } from "react";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(3),
  trigger: z.string().min(3),
  actions: z.string().min(3),
  integrations: z.string().optional(),
  notes: z.string().optional(),
});

export default function GeneratorForm() {
  const [form, setForm] = useState({
    title: "Lead capture ke Google Sheets",
    trigger: "Telegram command /lead",
    actions: "Ambil nama dan email dari chat lalu simpan ke Google Sheets",
    integrations: "Telegram, Google Sheets",
    notes: "Tambahkan validasi email dan konfirmasi ke pengguna",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const valid = useMemo(() => schema.safeParse(form).success, [form]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setResult(null);
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  }

  return (
    <section className="card">
      <form onSubmit={onSubmit} className="grid" style={{ gridTemplateColumns: "1fr", gap: 16 }}>
        <div>
          <label className="label">Judul Workflow</label>
          <input className="input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Contoh: Lead capture ke Google Sheets" />
        </div>
        <div>
          <label className="label">Trigger</label>
          <input className="input" value={form.trigger} onChange={e => setForm({ ...form, trigger: e.target.value })} placeholder="Contoh: Telegram command /lead" />
        </div>
        <div>
          <label className="label">Aksi yang Diinginkan</label>
          <textarea className="input" rows={3} value={form.actions} onChange={e => setForm({ ...form, actions: e.target.value })} placeholder="Contoh: Ambil nama & email dari chat lalu simpan ke Google Sheets" />
        </div>
        <div>
          <label className="label">Integrasi (opsional)</label>
          <input className="input" value={form.integrations || ""} onChange={e => setForm({ ...form, integrations: e.target.value })} placeholder="Contoh: Telegram, Google Sheets" />
        </div>
        <div>
          <label className="label">Catatan (opsional)</label>
          <textarea className="input" rows={2} value={form.notes || ""} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Kebutuhan khusus, validasi, dsb." />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="button" disabled={!valid || loading} type="submit">
            {loading ? "Menghasilkan..." : "Hasilkan Workflow"}
          </button>
          <span className="kicker">Hasil: JSON workflow, dok teknis, instruksi penggunaan.</span>
        </div>
      </form>

      {result && (
        <div className="grid" style={{ marginTop: 18 }}>
          <div className="card">
            <div className="kicker">Workflow JSON</div>
            <pre className="code" style={{ overflowX: "auto" }}>{JSON.stringify(result.workflow, null, 2)}</pre>
          </div>
          <div className="card">
            <div className="kicker">Dokumentasi Teknis</div>
            <pre className="code">{result.technicalDocs}</pre>
          </div>
          <div className="card">
            <div className="kicker">Instruksi Penggunaan</div>
            <pre className="code">{result.usageInstructions}</pre>
          </div>
        </div>
      )}
    </section>
  );
}
