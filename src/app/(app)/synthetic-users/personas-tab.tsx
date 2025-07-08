
"use client";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const mockPersonas = [
  { name: 'Ana', goals: 'Comprar rápido, sin errores.', pains: 'Los textos pequeños y de bajo contraste son difíciles de leer.' },
  { name: 'David', goals: 'Asegurarse de que el producto es el correcto.', pains: 'Se frustra si la navegación no es clara con un lector de pantalla.' },
  { name: 'Elena', goals: 'Encontrar las mejores ofertas.', pains: 'Le molestan los pop-ups y elementos que se mueven solos.' },
  { name: 'Carlos', goals: 'Tener una experiencia de compra placentera.', pains: 'Duda en introducir sus datos si la página no le inspira confianza.' },
];

export function PersonasTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {mockPersonas.map((persona, index) => (
        <motion.div
            key={index}
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <Card className="rounded-xl h-full">
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://placehold.co/80x80.png`} data-ai-hint="person avatar" />
                        <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle>{persona.name}</CardTitle>
                        <CardDescription>Usuario Sintético</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div>
                        <h4 className="font-semibold">Metas</h4>
                        <p className="text-muted-foreground">{persona.goals}</p>
                    </div>
                     <div>
                        <h4 className="font-semibold">Puntos de Dolor</h4>
                        <p className="text-muted-foreground">{persona.pains}</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
      ))}
    </div>
  );
}
