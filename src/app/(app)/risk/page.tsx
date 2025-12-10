"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, isFirebaseConfigValid, isFirestoreAvailable } from "@/lib/firebase";
import { Risk, RiskCategory, RiskStatus, riskCategoryCodes, riskCategories } from "@/types/risk";
import { RiskScore } from "./risk-score";
import { RiskFilters } from "./risk-filters";
import { RiskCard } from "./risk-card";
import { Skeleton } from "@/components/ui/skeleton";
import { RiskCategoryBars } from "./risk-category-bars";

const mockRisks: Risk[] = [
  {
    id: "risk1",
    category: "accessibility",
    title: "Contraste insuficiente en btn-pay",
    componentId: "button-primary",
    pageUrl: "/checkout",
    severity: 10,
    source: "agent-a11y",
    detectedAt: "2024-07-23T10:00:00Z" as any,
    status: "open",
    ownerUid: null,
    notes: "",
  },
  {
    id: "risk2",
    category: "accessibility",
    title: "Falta de rol ARIA en modal",
    componentId: "modal-dialog",
    pageUrl: "/subscribe",
    severity: 40,
    source: "agent-a11y",
    detectedAt: "2024-07-23T09:00:00Z" as any,
    status: "open",
    ownerUid: null,
    notes: "",
  },
  {
    id: "risk3",
    category: "performance",
    title: "LCP > 2.5s en página de inicio",
    componentId: null,
    pageUrl: "/",
    severity: 25,
    source: "agent-perf",
    detectedAt: "2024-07-22T11:30:00Z" as any,
    status: "in-progress",
    ownerUid: "core456",
    ownerName: "Core Team",
    notes: "Investigando optimización de imágenes.",
    recommendation: "Optimizar las imágenes de cabecera usando formato WebP y compresión.",
  },
  {
    id: "risk4",
    category: "design-debt",
    title: "Componente Card clonado 5 veces",
    componentId: "card-clone",
    pageUrl: "/products",
    severity: 60,
    source: "agent-debt",
    detectedAt: "2024-07-21T15:00:00Z" as any,
    status: "open",
    ownerUid: null,
    notes: "",
  },
];

const calculateRiskStats = (risks: Risk[]) => {
  if (!risks || risks.length === 0) {
    const byCategory = riskCategoryCodes.reduce(
      (acc, cat) => {
        acc[cat] = 100;
        return acc;
      },
      {} as Record<RiskCategory, number>
    );
    return { score: 100, byCategory };
  }

  const weights: Record<RiskCategory, number> = {
    accessibility: 0.4,
    performance: 0.3,
    "design-debt": 0.2,
    governance: 0.1,
  };

  const byCategory: {
    [key in RiskCategory]?: { totalSeverity: number; count: number; average: number };
  } = {};

  for (const category of riskCategoryCodes) {
    byCategory[category] = { totalSeverity: 0, count: 0, average: 100 };
  }

  const openRisks = risks.filter((r) => r.status !== "resolved");

  for (const risk of openRisks) {
    const categoryData = byCategory[risk.category];
    if (categoryData) {
      categoryData.totalSeverity += risk.severity;
      categoryData.count++;
    }
  }

  let globalScore = 0;

  riskCategoryCodes.forEach((cat) => {
    const categoryData = byCategory[cat];
    if (categoryData) {
      if (categoryData.count > 0) {
        categoryData.average = 100 - categoryData.totalSeverity / categoryData.count;
      } else {
        categoryData.average = 100;
      }
      globalScore += categoryData.average * weights[cat];
    }
  });

  return {
    score: Math.round(globalScore),
    byCategory: riskCategoryCodes.reduce(
      (acc, cat) => {
        const categoryData = byCategory[cat];
        acc[cat] = categoryData ? Math.round(categoryData.average) : 100;
        return acc;
      },
      {} as Record<RiskCategory, number>
    ),
  };
};

export default function RiskPage() {
  const [allRisks, setAllRisks] = useState<Risk[]>([]);
  const [riskStats, setRiskStats] = useState<{
    score: number;
    byCategory: Record<RiskCategory, number>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<{
    category: RiskCategory | "all";
    status: RiskStatus | "all";
  }>({
    category: "all",
    status: "all",
  });

  useEffect(() => {
    setIsLoading(true);
    if (!isFirebaseConfigValid || !isFirestoreAvailable() || !db) {
      console.warn("Firebase not configured. Using mock data for risks.");
      setAllRisks(mockRisks);
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, "risks"));
    const unsubscribeRisks = onSnapshot(
      q,
      (snapshot) => {
        const fetchedRisks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Risk);
        setAllRisks(fetchedRisks);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error fetching risks:", error);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribeRisks();
    };
  }, []);

  useEffect(() => {
    setRiskStats(calculateRiskStats(allRisks));
  }, [allRisks]);

  const handleAssignRisk = (riskId: string, assignee: { uid: string; name: string }) => {
    const updateState = (currentRisks: Risk[]): Risk[] =>
      currentRisks.map((risk) =>
        risk.id === riskId
          ? {
              ...risk,
              ownerUid: assignee.uid,
              ownerName: assignee.name,
              status: "in-progress" as const,
            }
          : risk
      );

    if (!isFirebaseConfigValid) {
      setAllRisks(updateState);
    } else {
      // Real update handled by server action, which will trigger onSnapshot
      // But we can optimistically update the state for a better UX
      setAllRisks((prevState) => updateState(prevState));
    }
  };

  const filteredRisks = allRisks.filter((risk) => {
    const categoryMatch = filters.category === "all" || risk.category === filters.category;

    let statusMatch = true;
    if (filters.status === "resolved") {
      statusMatch = risk.status === "resolved";
    } else if (filters.status === "all") {
      // 'all' in the new UI means 'open' or 'in-progress'
      statusMatch = risk.status === "open" || risk.status === "in-progress";
    }

    return categoryMatch && statusMatch;
  });

  const groupedRisks = filteredRisks.reduce(
    (acc, risk) => {
      (acc[risk.category] = acc[risk.category] || []).push(risk);
      return acc;
    },
    {} as Record<RiskCategory, Risk[]>
  );

  const categoryChartData = riskStats
    ? Object.entries(riskStats.byCategory).map(([name, score]) => ({
        name: riskCategories[name as RiskCategory]?.label || name,
        score: score as number,
      }))
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Risk Dashboard"
        description="Monitoriza y prioriza los riesgos que afectan tu sistema de diseño."
      />

      <RiskFilters filters={filters} onFilterChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-8 sticky top-24">
          <RiskScore score={riskStats?.score ?? 0} isLoading={isLoading} />
          {riskStats && <RiskCategoryBars data={categoryChartData} isLoading={isLoading} />}
        </div>

        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-expressive" />
            ))
          ) : Object.keys(groupedRisks).length > 0 ? (
            (Object.keys(groupedRisks) as RiskCategory[]).map((category) => (
              <RiskCard
                key={category}
                category={category}
                risks={groupedRisks[category]}
                onAssign={handleAssignRisk}
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground py-16">
              <p>No se encontraron riesgos que coincidan con los filtros.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
