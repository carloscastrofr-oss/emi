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

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
       <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
            <Logo />
            <CardTitle className="mt-4 text-2xl">Welcome to DesignOS</CardTitle>
            <CardDescription>Your AI-powered design system toolkit.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-center text-muted-foreground">
                This guided tour will adapt to your role (Designer, Developer, or PM) to help you get the most out of DesignOS.
            </p>
        </CardContent>
        <CardFooter>
            <Button asChild className="w-full">
                <Link href="/dashboard">
                    Start Onboarding <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </CardFooter>
       </Card>
    </div>
  );
}
