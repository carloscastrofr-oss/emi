import Image from "next/image";
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

const kits = [
  {
    title: "Core Component Kit",
    description: "The essential set of UI components for any new project.",
    image: "https://placehold.co/600x400.png",
    hint: "abstract geometric"
  },
  {
    title: "Token Starter Pack",
    description: "Design tokens for colors, typography, and spacing.",
    image: "https://placehold.co/600x400.png",
    hint: "vibrant colors"
  },
  {
    title: "E-commerce UI Kit",
    description: "Components tailored for online retail experiences.",
    image: "https://placehold.co/600x400.png",
    hint: "shopping cart"
  },
  {
    title: "SaaS Dashboard Kit",
    description: "A complete kit for building data-driven dashboards.",
    image: "https://placehold.co/600x400.png",
    hint: "dashboard interface"
  },
];

export default function KitPage() {
  return (
    <div>
      <PageHeader
        title="EMI.Kit"
        description="Download starter kits to bootstrap your projects."
      />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {kits.map((kit) => (
          <Card key={kit.title} className="flex flex-col">
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
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
