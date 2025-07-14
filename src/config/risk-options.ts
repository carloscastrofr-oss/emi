
import type { RiskCategory } from '@/types/risk';

export const ASSIGNEE_OPTIONS: Record<RiskCategory, string[]> = {
  accessibility: ['A11y Champion', 'UX Designer', 'Front-end Dev'],
  performance:    ['Perf Engineer', 'DevOps', 'Back-end Dev'],
  'design-debt': ['DS Core Team', 'Component Champion', 'Tech Lead'],
  governance:     ['Product Manager', 'DS Lead', 'Engineering Manager']
};
