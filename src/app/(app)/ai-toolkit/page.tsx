
'use client';

import { PageHeader } from "@/components/page-header";
import { ResearchSynthAgentCard } from './research-synth-agent-card';
import { UIA11yReviewAgentCard } from './ui-a11y-review-agent-card';
import { StorytellerAgentCard } from './storyteller-agent-card';

export default function AIToolkitPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Toolkit"
        description="Conjunto de agentes de IA para potenciar tu sistema de diseño."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <ResearchSynthAgentCard />
        <UIA11yReviewAgentCard />
        <StorytellerAgentCard />
      </div>
    </div>
  );
}
