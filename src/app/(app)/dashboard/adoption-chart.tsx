
"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface AdoptionChartProps {
    data: { component: string; adoption: number }[];
}

export function AdoptionChart({ data }: AdoptionChartProps) {
  return (
    <ChartContainer config={{}} className="h-[250px] w-full">
      <BarChart data={data} accessibilityLayer>
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
        <Bar dataKey="adoption" fill="var(--color-primary-dynamic)" radius={[12, 12, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
