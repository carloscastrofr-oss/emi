import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Logo } from "@/components/logo";
import { ArrowRight } from "lucide-react";

export default function OnboardingPage({
  params,
  searchParams,
}: {
  params: {};
  searchParams: {};
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
            <Logo />
            <CardTitle className="mt-4 text-2xl">Bienvenido a DesignOS</CardTitle>
            <CardDescription>Tu kit de herramientas para sistemas de diseño impulsado por IA.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                Este tour guiado se adaptará a tu rol (Diseñador, Desarrollador o PM) para ayudarte a aprovechar al máximo DesignOS.
            </p>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href="/dashboard">
                    Comenzar Tour <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
       </Card>
    </div>
  );
}
