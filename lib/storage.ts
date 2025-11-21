type SessionState = {
  step: "idle" | "ask_title" | "ask_trigger" | "ask_actions" | "ask_integrations" | "ask_notes" | "complete";
  data: {
    title?: string;
    trigger?: string;
    actions?: string;
    integrations?: string;
    notes?: string;
  };
};

const memory = new Map<string, SessionState>();

export function getSession(chatId: string): SessionState {
  if (!memory.has(chatId)) memory.set(chatId, { step: "idle", data: {} });
  return memory.get(chatId)!;
}

export function setSession(chatId: string, state: SessionState) {
  memory.set(chatId, state);
}

export function resetSession(chatId: string) {
  memory.set(chatId, { step: "idle", data: {} });
}
