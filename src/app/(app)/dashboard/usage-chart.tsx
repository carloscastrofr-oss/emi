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

const chartData = [
  { month: "January", tokens: 186 },
  { month: "February", tokens: 305 },
  { month: "March", tokens: 237 },
  { month: "April", tokens: 273 },
  { month: "May", tokens: 209 },
  { month: "June", tokens: 214 },
];

export function UsageChart() {
  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <AreaChart data={chartData} accessibilityLayer>
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
          <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="tokens"
          stroke="var(--color-primary)"
          fillOpacity={1}
          fill="url(#colorTokens)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
