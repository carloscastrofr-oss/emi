import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { DollarSign, Package, AlertTriangle, TrendingUp } from "lucide-react";
import { AdoptionChart } from "./adoption-chart";
import { UsageChart } from "./usage-chart";

const kpis = [
  {
    title: "Component Adoption",
    value: "82%",
    change: "+5.2% from last month",
    icon: Package,
  },
  {
    title: "Token Usage",
    value: "95%",
    change: "+1.0% from last month",
    icon: TrendingUp,
  },
  {
    title: "Accessibility Issues",
    value: "12",
    change: "-3 from last week",
    icon: AlertTriangle,
  },
  {
    title: "Estimated ROI",
    value: "$120,500",
    change: "+$15k this quarter",
    icon: DollarSign,
  },
];

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="EMI.Metrics"
        description="Key performance indicators for your design system."
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Component Adoption Rate</CardTitle>
            <CardDescription>
              Percentage of projects using core components.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdoptionChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Token Usage Frequency</CardTitle>
            <CardDescription>
              Usage of design tokens over the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsageChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
