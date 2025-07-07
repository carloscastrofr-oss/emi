
'use client';
import Image from "next/image";
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
import { Download } from "lucide-react";
import { RequireRole } from "@/components/auth/require-role";


const kits = [
  {
    title: "Kit de Componentes Principales",
    description: "El conjunto esencial de componentes de UI para cualquier proyecto nuevo.",
    image: "https://placehold.co/600x400.png",
    hint: "abstract geometric"
  },
  {
    title: "Paquete de Inicio de Tokens",
    description: "Tokens de diseño para colores, tipografía y espaciado.",
    image: "https://placehold.co/600x400.png",
    hint: "vibrant colors"
  },
  {
    title: "Kit de UI para E-commerce",
    description: "Componentes diseñados para experiencias de venta en línea.",
    image: "https://placehold.co/600x400.png",
    hint: "shopping cart"
  },
  {
    title: "Kit de Panel para SaaS",
    description: "Un kit completo para construir paneles de control basados en datos.",
    image: "https://placehold.co/600x400.png",
    hint: "dashboard interface"
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
                    <CardHeader>
                    <CardTitle>{kit.title}</CardTitle>
                    <CardDescription>{kit.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                    <div className="aspect-video overflow-hidden rounded-md">
                        <Image
                        src={kit.image}
                        alt={kit.title}
                        width={600}
                        height={400}
                        data-ai-hint={kit.hint}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        />
                    </div>
                    </CardContent>
                    <CardFooter>
                        <RequireRole roles={['producer', 'core', 'admin']} showIsBlocked>
                            <Button className="w-full">
                                <Download className="mr-2 h-4 w-4" />
                                Descargar
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
