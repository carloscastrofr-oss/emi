"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

const topComponents = [
  { name: "Button", usage: 34 },
  { name: "Input", usage: 28 },
  { name: "Card", usage: 19 },
  { name: "Table", usage: 12 },
  { name: "Modal", usage: 7 },
];

export function TopComponentsList() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Componente</TableHead>
          <TableHead className="text-right">Uso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {topComponents.map((component) => (
          <TableRow key={component.name}>
            <TableCell className="font-medium">{component.name}</TableCell>
            <TableCell className="flex items-center gap-4 justify-end">
              <span className="text-muted-foreground w-8">{component.usage}%</span>
              <Progress value={component.usage} className="h-2 flex-1" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
