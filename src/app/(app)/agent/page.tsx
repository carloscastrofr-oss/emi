import { PageHeader } from "@/components/page-header";
import { AgentCard } from "./agent-card";
import { Palette, MessageSquareText, ShieldAlert, Briefcase } from "lucide-react";
import { agentDesign } from "@/ai/flows/agent-design";
import { agentContent } from "@/ai/flows/agent-content";
import { agentQA } from "@/ai/flows/agent-qa";
import { agentBusiness } from "@/ai/flows/agent-business";

const agents = [
  {
    title: "EMI.Agent.Design",
    description: "Analyze token values, visual properties, and accessibility metrics.",
    icon: Palette,
    flow: agentDesign,
    formFields: [{ name: "componentUsage", label: "Component Usage Data (JSON)" }],
    placeholder: JSON.stringify({
      componentId: "button-primary",
      tokenValues: { color: "#455ADE", padding: "12px 24px" },
      visualProperties: { borderRadius: "8px" },
      accessibility: { contrastRatio: 3.5 }
    }, null, 2),
  },
  {
    title: "EMI.Agent.Content",
    description: "Analyze UX writing, microcopy issues, and tone consistency.",
    icon: MessageSquareText,
    flow: agentContent,
    formFields: [
        { name: "uiText", label: "UI Text" },
        { name: "userFeedback", label: "User Feedback (Optional)" }
    ],
    placeholder: "Your password must contain at least 8 characters.",
  },
  {
    title: "EMI.Agent.QA",
    description: "Identify patterns of usability failures or interaction bugs.",
    icon: ShieldAlert,
    flow: agentQA,
    formFields: [{ name: "errorEvents", label: "Error Events (JSON)" }],
    placeholder: JSON.stringify({
      component: "checkout-form",
      error_type: "form_failure",
      count: 152,
      users_affected: 89
    }, null, 2),
  },
  {
    title: "EMI.Agent.Business",
    description: "Correlate component usage with business KPIs.",
    icon: Briefcase,
    flow: agentBusiness,
    formFields: [{ name: "kpiData", label: "KPI Data (JSON)" }],
    placeholder: JSON.stringify({
      componentId: "add-to-cart-button",
      usage: 12000,
      conversionRate: "2.5%",
      relatedKpi: "sales"
    }, null, 2),
  },
];

export default function AgentPage() {
  return (
    <div>
      <PageHeader
        title="EMI.Agent Suite"
        description="Trigger AI agents to analyze and improve your design system."
      />
      <div className="grid gap-6 md:grid-cols-2">
        {agents.map((agent) => (
          <AgentCard
            key={agent.title}
            title={agent.title}
            description={agent.description}
            icon={agent.icon}
            flow={agent.flow}
            formFields={agent.formFields}
            placeholder={agent.placeholder}
          />
        ))}
      </div>
    </div>
  );
}
