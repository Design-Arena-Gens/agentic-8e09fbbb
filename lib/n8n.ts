export type WorkflowInput = {
  title: string;
  trigger: string;
  actions: string;
  integrations?: string;
  notes?: string;
};

export function buildN8nWorkflow(input: WorkflowInput) {
  const now = new Date().toISOString();
  // Minimal, valid n8n workflow JSON
  // Ref: typical structure used by export; kept simple for bootstrap
  return {
    name: input.title || "Generated Workflow",
    nodes: [
      {
        id: "1",
        name: "Trigger",
        type: "n8n-nodes-base.manualTrigger",
        typeVersion: 1,
        position: [260, 300],
      },
      {
        id: "2",
        name: "Prepare",
        type: "n8n-nodes-base.function",
        typeVersion: 2,
        position: [520, 300],
        parameters: {
          functionCode: `return [{ json: {\n  title: ${JSON.stringify(input.title)},\n  trigger: ${JSON.stringify(input.trigger)},\n  actions: ${JSON.stringify(input.actions)},\n  integrations: ${JSON.stringify(input.integrations || "")},\n  notes: ${JSON.stringify(input.notes || "")},\n  generatedAt: ${JSON.stringify(now)}\n}}];`,
        },
      },
    ],
    connections: {
      Trigger: {
        main: [[{ node: "Prepare", type: "main", index: 0 }]],
      },
    },
    settings: {
      saveExecutionProgress: true,
    },
    staticData: {},
    pinData: {},
    meta: {
      templateCredsSetup: [],
      instanceId: "n8n-ai-workflow-architect",
      description: `${input.trigger} -> ${input.actions}`.slice(0, 250),
    },
  } as const;
}
