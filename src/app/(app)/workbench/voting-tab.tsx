
'use client';
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";

const proposals = [
  {
    title: "Nuevo Token: --color-brand-secondary",
    description: "Propuesta para añadir un nuevo color secundario de marca para materiales de marketing.",
    votes: 23,
  },
  {
    title: "Nuevo Componente: Stepper",
    description: "Un indicador de progreso de varios pasos para formularios y flujos de bienvenida.",
    votes: 15,
  },
  {
    title: "Obsoleto: Antiguo componente 'Grid'",
    description: "Se propone declarar obsoleto el componente Grid heredado en favor de las nuevas utilidades de layout Flex.",
    votes: 8,
  },
];

const MotionCard = motion(Card);

export function VotingTab() {
  return (
    <div className="space-y-4">
      <Card className="rounded-expressive">
        <CardHeader>
            <CardTitle>Propuestas</CardTitle>
            <CardDescription>Vota sobre nuevos componentes, tokens y otros cambios al sistema de diseño.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map((proposal) => (
          <MotionCard 
            key={proposal.title} 
            className="flex flex-col rounded-expressive shadow-e2"
            whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <CardHeader>
              <CardTitle className="text-lg">{proposal.title}</CardTitle>
              <CardDescription>{proposal.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
                <div className="text-3xl font-bold">{proposal.votes}</div>
                <div className="ml-2 text-muted-foreground">Votos</div>
            </CardContent>
            <CardFooter className="gap-2">
                <RequireRole roles={['producer', 'core', 'admin']} showIsBlocked>
                    <Button variant="outline" className="w-full">
                        <ThumbsUp className="mr-2 h-4 w-4" /> Votar a favor
                    </Button>
                </RequireRole>
                 <RequireRole roles={['producer', 'core', 'admin']} showIsBlocked>
                    <Button variant="outline" className="w-full">
                        <ThumbsDown className="mr-2 h-4 w-4" /> Votar en contra
                    </Button>
                </RequireRole>
            </CardFooter>
          </MotionCard>
        ))}
      </div>
    </div>
  );
}
