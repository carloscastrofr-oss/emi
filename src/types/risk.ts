
import type { Timestamp } from 'firebase/firestore';
import { AlertTriangle, BarChart, ShieldQuestion, FileWarning, BadgePercent, LucideIcon } from 'lucide-react';

export const riskCategoryCodes = ["accessibility", "performance", "design-debt", "governance", "brand"] as const;
export type RiskCategory = typeof riskCategoryCodes[number];

export const riskStatuses = ["open", "in-progress", "resolved"] as const;
export type RiskStatus = typeof riskStatuses[number];

export const riskCategories: Record<RiskCategory, { label: string; icon: LucideIcon }> = {
    accessibility: { label: 'Accesibilidad', icon: AlertTriangle },
    performance: { label: 'Rendimiento', icon: BarChart },
    'design-debt': { label: 'Deuda de Diseño', icon: FileWarning },
    governance: { label: 'Gobernanza', icon: ShieldQuestion },
    brand: { label: 'Marca', icon: BadgePercent },
};

export interface Risk {
  id: string;
  category: RiskCategory;
  title: string;
  componentId: string | null;
  pageUrl: string | null;
  severity: number; // 0-100 (0 is most severe)
  source: string;
  detectedAt: Timestamp;
  status: RiskStatus;
  ownerUid: string | null;
  notes: string | null;
  recommendation?: string;
}
