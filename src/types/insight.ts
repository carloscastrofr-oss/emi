
export type InsightType = "research" | "a11y" | "story" | "ux";
export type EvidenceType = "doc" | "quote";

export interface Evidence {
    type: EvidenceType;
    ref: string; // e.g., document ID or direct quote
}

export interface Kpi {
    name: string;
    value: number;
    unit: string;
}

export interface Insight {
    id: string;
    orgId: string;
    projectId: string;
    sourceRunId: string; // Link back to the agent run that generated it
    type: InsightType;
    summary: string;
    evidence: Evidence[];
    links: {
        figma: string;
        notion: string;
    };
    kpis: Kpi[];
    nextSteps: string[];
}
