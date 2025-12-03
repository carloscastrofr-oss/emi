import type { Timestamp } from "firebase/firestore";

export const abTestTypes = ["screen", "component"] as const;
export type ABTestType = (typeof abTestTypes)[number];

export const kpiTypes = ["click-thru", "task-success", "time-on-task"] as const;
export type KpiType = (typeof kpiTypes)[number];

export const abTestStatuses = ["running", "finished"] as const;
export type ABTestStatus = (typeof abTestStatuses)[number];

export interface ABTest {
  id: string;
  name: string;
  type: ABTestType;
  aId: string; // e.g., "/checkout" or "button-primary"
  bId: string;
  // startDate: Timestamp; // Could be added later
  // endDate: Timestamp;
  kpi: KpiType;
  ownerUid: string;
  status: ABTestStatus;
  createdAt: Timestamp;
}

export interface ABTestAssignment {
  variant: "A" | "B";
  assignedAt: Timestamp;
}
