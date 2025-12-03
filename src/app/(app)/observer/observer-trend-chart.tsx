"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

const chartData = [
  { month: "Ene", adoption: 120 },
  { month: "Feb", adoption: 240 },
  { month: "Mar", adoption: 200 },
  { month: "Abr", adoption: 260 },
  { month: "May", adoption: 210 },
  { month: "Jun", adoption: 190 },
];

export function ObserverTrendChart() {
  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <AreaChart
        data={chartData}
        accessibilityLayer
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <defs>
          <linearGradient id="colorAdoption" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="adoption"
          stroke="var(--color-primary)"
          fillOpacity={1}
          fill="url(#colorAdoption)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
