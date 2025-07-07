"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { component: "Button", adoption: 98 },
  { component: "Input", adoption: 92 },
  { component: "Card", adoption: 78 },
  { component: "Modal", adoption: 65 },
  { component: "Table", adoption: 55 },
  { component: "Avatar", adoption: 88 },
];

export function AdoptionChart() {
  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <BarChart data={chartData} accessibilityLayer>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="component"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
        />
        <YAxis
          tickFormatter={(value) => `${value}%`}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="adoption" fill="var(--color-primary)" radius={[12, 12, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
