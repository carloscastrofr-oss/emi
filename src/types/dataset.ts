
import type { Timestamp } from 'firebase/firestore';

export type DatasetType = "interviews" | "docs" | "figma" | "metrics";
export type DatasetSourceType = "drive" | "upload" | "url";
export type DatasetPiiStatus = "redacted" | "contains_pii";

export interface DatasetSource {
    type: DatasetSourceType;
    ref: string;
}

export interface Dataset {
    id: string;
    orgId: string;
    projectId: string;
    type: DatasetType;
    sources: DatasetSource[];
    pii: DatasetPiiStatus;
    updatedAt: Timestamp;
}
