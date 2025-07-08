
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface UsageChartProps {
    data: { month: string; tokens: number }[];
}

export function UsageChart({ data }: UsageChartProps) {
  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <AreaChart data={data} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="month"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary-container-dynamic)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-primary-container-dynamic)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="tokens"
          stroke="var(--color-primary-dynamic)"
          fillOpacity={1}
          fill="url(#colorArea)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
