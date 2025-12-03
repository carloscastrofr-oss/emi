"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { assignRisk } from "./actions";
import { useAuth } from "@/hooks/use-auth";
import type { Risk } from "@/types/risk";
import { ASSIGNEE_OPTIONS } from "@/config/risk-options";
import { Loader2 } from "lucide-react";
import { isFirebaseConfigValid } from "@/lib/firebase";

interface AssignRiskModalProps {
  risk: Risk;
  open: boolean;
  onClose: () => void;
  onAssign: (assignee: { uid: string; name: string }) => void;
}

// Dummy utility to map a role label to a mock user object
function getMockUserFromLabel(label: string): { uid: string; name: string } {
  return { uid: label.toLowerCase().replace(/\s/g, "-"), name: label };
}

export function AssignRiskModal({ risk, open, onClose, onAssign }: AssignRiskModalProps) {
  const { toast } = useToast();
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");

  const assigneeOptions = ASSIGNEE_OPTIONS[risk.category] ?? ["DS Core"];

  const handleSave = async () => {
    if (!selectedAssignee || !userProfile) {
      toast({
        title: "Error",
        description: "Selecciona un responsable e inicia sesión.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const assigneeUser = getMockUserFromLabel(selectedAssignee);

    if (!isFirebaseConfigValid) {
      onAssign(assigneeUser);
    } else {
      const result = await assignRisk(
        risk.id,
        assigneeUser.uid,
        assigneeUser.name,
        userProfile.uid
      );
      if (!result.success) {
        toast({ title: "Error", description: result.message, variant: "destructive" });
      }
    }

    setIsLoading(false);
    toast({
      title: "Riesgo Asignado",
      description: `El riesgo "${risk.title}" ha sido asignado a ${assigneeUser.name}.`,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-expressive shadow-e8">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold mb-2">
            Asignar Riesgo de <span className="capitalize">{risk.category}</span>
          </DialogTitle>
          <DialogDescription>
            Selecciona un responsable para el riesgo: "{risk.title}"
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedAssignee} value={selectedAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="— Elegir responsable —" />
            </SelectTrigger>
            <SelectContent>
              {assigneeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!selectedAssignee || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Asignar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
