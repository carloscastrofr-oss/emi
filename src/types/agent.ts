
import type { Timestamp } from 'firebase/firestore';

export type AgentStatus = "active" | "inactive";
export type AgentIntegration = "figma" | "notion" | "drive" | "slack" | "jira";

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: AgentStatus;
  inputSchemaRef: string;
  outputSchemaRef: string;
  integrations: AgentIntegration[];
}

export type AgentRunStatus = "queued" | "processing" | "done" | "error";

export interface AgentRun {
  id: string;
  orgId: string;
  projectId: string;
  createdAt: Timestamp;
  createdBy: string; // user UID
  inputRef: string; // Reference to data used for input
  status: AgentRunStatus;
  model: {
    provider: "google";
    id: "gemini-1.5-pro" | "gemini-1.5-flash";
  };
  metrics: {
    promptTokens: number;
    outputTokens: number;
    durationMs: number;
  };
  outputRef?: string; // Reference to the output data (e.g., an insight)
  error?: {
    code: string;
    detail: string;
  };
}
