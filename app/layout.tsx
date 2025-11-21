export const metadata = {
  title: "n8n AI Workflow Architect",
  description: "AI agent to design, generate, and document n8n workflows",
};

import "./globals.css";
import React from "react";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="header" style={{ marginBottom: 24 }}>
            <div>
              <div className="kicker">Telegram + n8n</div>
              <div className="title">n8n AI Workflow Architect</div>
              <div className="subtitle">Asisten AI untuk merancang, membuat, dan mendokumentasikan workflow n8n secara otomatis.</div>
            </div>
            <a className="button" href="https://n8n.io" target="_blank" rel="noreferrer">n8n</a>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
