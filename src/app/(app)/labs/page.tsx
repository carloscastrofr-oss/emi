import { PageHeader } from "@/components/page-header";
import { LabsForm } from "./labs-form";
import { Lightbulb } from "lucide-react";

export default function LabsPage() {
  return (
    <div>
      <PageHeader
        title="EMI.Labs"
        description="Experiment with AI to generate new component ideas."
      />
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
                <Lightbulb className="h-12 w-12 text-primary" />
            </div>
        </div>
        <LabsForm />
      </div>
    </div>
  );
}
