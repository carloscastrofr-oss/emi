
'use client';

import { PageHeader } from "@/components/page-header";
import { UXDraftAgentCard } from "../ai-toolkit/ux-draft-agent-card";
import { motion } from "framer-motion";

export default function AIFlowPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Flow"
        description="Genera borradores de flujos y microcopy basados en tus objetivos."
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="max-w-2xl mx-auto"
      >
        <UXDraftAgentCard />
      </motion.div>
    </div>
  );
}
