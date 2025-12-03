"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Child Components ---
export function MetricCard({
  label,
  value,
  icon: Icon,
  format,
  color,
}: {
  label: string;
  value?: number;
  icon: React.ElementType;
  format: (val: number) => string;
  color: string;
}) {
  const hasValue = value !== undefined && value !== null;
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "var(--tw-shadow-e8)" }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      style={{ "--brand-color": color } as React.CSSProperties}
    >
      <Card className="rounded-expressive shadow-e2 h-full border-transparent border-l-4 border-l-[--brand-color]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {hasValue ? (
            <div className="text-2xl font-bold" style={{ color }}>
              {format(value)}
            </div>
          ) : (
            <div className="text-2xl font-bold text-muted-foreground">—</div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default MetricCard;
