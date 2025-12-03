"use client";

import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  riskCategories,
  riskCategoryCodes,
  type RiskCategory,
  type RiskStatus,
} from "@/types/risk";
import { cn } from "@/lib/utils";

const categoryOptions: { value: RiskCategory | "all"; label: string }[] = [
  { value: "all", label: "Todas" },
  ...riskCategoryCodes.map((cat) => ({ value: cat, label: riskCategories[cat].label })),
];

const statusOptions: { value: RiskStatus | "all"; label: string }[] = [
  { value: "all", label: "Abiertos" },
  { value: "resolved", label: "Resueltos" },
];

interface RiskFiltersProps {
  filters: {
    category: RiskCategory | "all";
    status: RiskStatus | "all";
  };
  onFilterChange: (newFilters: {
    category: RiskCategory | "all";
    status: RiskStatus | "all";
  }) => void;
}

export function RiskFilters({ filters, onFilterChange }: RiskFiltersProps) {
  const handleCategoryChange = (value: string) => {
    onFilterChange({ ...filters, category: value as RiskCategory | "all" });
  };

  const handleStatusChange = (value: string) => {
    onFilterChange({ ...filters, status: value as RiskStatus | "all" });
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-sm font-medium text-muted-foreground">Categoría</span>
        <Tabs value={filters.category} onValueChange={handleCategoryChange} className="mt-2">
          <TabsList className="h-auto bg-transparent p-0 gap-4">
            {categoryOptions.map((cat) => (
              <motion.div
                key={cat.value}
                whileHover={{ y: -2, boxShadow: "var(--tw-shadow-e8)" }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <TabsTrigger
                  value={cat.value}
                  className={cn(
                    "rounded-expressive shadow-e2 data-[state=active]:text-on-primary-container data-[state=active]:bg-primary-container data-[state=inactive]:bg-card text-card-foreground",
                    "px-4 py-2"
                  )}
                >
                  {cat.label}
                </TabsTrigger>
              </motion.div>
            ))}
          </TabsList>
        </Tabs>
      </div>
      <div>
        <span className="text-sm font-medium text-muted-foreground">Estado</span>
        <Tabs value={filters.status} onValueChange={handleStatusChange} className="mt-2">
          <TabsList className="bg-transparent p-0 gap-4">
            {statusOptions.map((st) => (
              <TabsTrigger
                key={st.value}
                value={st.value}
                className={cn(
                  "rounded-full text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=inactive]:bg-muted data-[state=inactive]:text-muted-foreground",
                  "px-3 py-1"
                )}
              >
                {st.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}
