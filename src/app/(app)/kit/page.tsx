
'use client';
import { motion } from "framer-motion";
import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Github, FileText, SwatchBook, Package, Palette, ShoppingCart, ArrowRight } from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";


const kits = [
  {
    title: "Consulta de Repositorio",
    description: "Accede al repositorio de código fuente y la documentación técnica.",
    icon: Github
  },
  {
    title: "Research",
    description: "Todos los artefactos y hallazgos de la investigación de usuarios.",
    icon: FileText
  },
  {
    title: "Branding",
    description: "Logos, paleta de colores, tipografía y guías de estilo de la marca.",
    icon: SwatchBook
  },
  {
    title: "Kit de Componentes Principales",
    description: "El conjunto esencial de componentes de UI para cualquier proyecto nuevo.",
    icon: Package
  },
  {
    title: "Paquete de Inicio de Tokens",
    description: "Tokens de diseño para colores, tipografía y espaciado.",
    icon: Palette
  },
  {
    title: "Kit de UI para E-commerce",
    description: "Componentes diseñados para experiencias de venta en línea.",
    icon: ShoppingCart
  },
];

export default function KitPage({
  params,
  searchParams,
}: {
  params: {};
  searchParams: {};
}) {
  return (
    <div>
      <PageHeader
        title="Kit"
        description="Descarga kits de inicio para arrancar tus proyectos."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kits.map((kit) => (
            <motion.div
                key={kit.title} 
                className="h-full"
                whileHover={{ y: -4, boxShadow: 'var(--tw-shadow-e8)'}}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
                <Card className="flex flex-col rounded-expressive shadow-e2 h-full">
                    <CardHeader className="flex flex-row items-start gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                        <kit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle>{kit.title}</CardTitle>
                        <CardDescription>{kit.description}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    </CardContent>
                    <CardFooter>
                        <RequireRole roles={['producer', 'core', 'admin']} showIsBlocked>
                            <Button className="w-full">
                                <ArrowRight className="mr-2 h-4 w-4" />
                                Consultar
                            </Button>
                        </RequireRole>
                    </CardFooter>
                </Card>
            </motion.div>
        ))}
      </div>
    </div>
  );
}
