import GeneratorForm from "@/components/GeneratorForm";

export default function Page() {
  return (
    <main className="grid" style={{ gap: 24 }}>
      <section className="card">
        <div className="kicker">Fase 1</div>
        <h2 style={{ margin: "6px 0 12px" }}>Interaksi Cerdas untuk Membuat Workflow</h2>
        <p className="subtitle">Isi formulir di bawah ini atau gunakan bot Telegram untuk menghasilkan workflow n8n, dokumentasi teknis, dan instruksi penggunaan.</p>
      </section>
      <GeneratorForm />
      <section className="card">
        <div className="kicker">Telegram Webhook</div>
        <p className="subtitle">Setel webhook bot Telegram Anda ke endpoint: <code className="code">/api/telegram</code>. Tambahkan env <code className="code">TELEGRAM_BOT_TOKEN</code>.</p>
      </section>
    </main>
  );
}
