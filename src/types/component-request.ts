import type { Timestamp } from "firebase/firestore";

export const requestStatuses = [
  "Solicitado",
  "En Revisión",
  "En Desarrollo",
  "QA / A11y",
  "Listo",
  "Rechazado",
] as const;

export type RequestStatus = (typeof requestStatuses)[number];

export const requestPriorities = ["Alta", "Media", "Baja"] as const;
export type RequestPriority = (typeof requestPriorities)[number];

export interface RequestHistoryItem {
  status: RequestStatus;
  byUid: string;
  at: Timestamp;
}

export interface ComponentRequest {
  id: string;
  title: string;
  description: string;
  priority: RequestPriority;
  requesterUid: string;
  championUid: string | null;
  figmaFileUrl: string | null;
  status: RequestStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  history: RequestHistoryItem[];
}
