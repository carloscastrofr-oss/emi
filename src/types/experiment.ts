export type ExperimentStatus = "design" | "running" | "done";

export interface Experiment {
  id: string;
  orgId: string;
  projectId: string;
  hypothesis: string;
  variantA: string; // Description or ref
  variantB: string; // Description or ref
  metrics: ("CR" | "LCP")[];
  status: ExperimentStatus;
  result: {
    crA: number;
    crB: number;
    uplift: number;
  };
}
