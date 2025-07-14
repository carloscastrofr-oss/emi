
import type { Timestamp } from 'firebase/firestore';

export interface BrandMetrics {
  adoption: number;
  tokenUsage: number;
  coverage: number;
  teamContrib: number;
  a11yIssues: number;
  roi: number;
  riskScore?: number;
  adoptionTrend: number[];
  tokenFreqTrend: number[];
}

export interface Brand {
  id: string;
  name: string;
  primary: string;
  primaryContainer: string;
  onPrimary: string;
  metrics: BrandMetrics;
  updatedAt: Timestamp;
}
