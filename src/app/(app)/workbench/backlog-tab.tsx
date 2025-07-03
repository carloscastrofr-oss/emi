import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const backlogItems = [
  {
    task: "Crear nuevo componente DatePicker",
    status: "En Progreso",
    priority: "Alta",
    assignee: "Alex",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    task: "Actualizar estilo del botón primario",
    status: "Pendiente",
    priority: "Media",
    assignee: "Sam",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    task: "Añadir documentación de accesibilidad",
    status: "Hecho",
    priority: "Baja",
    assignee: "Jordan",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    task: "Refactorizar API del componente Card",
    status: "En Revisión",
    priority: "Alta",
    assignee: "Taylor",
    avatar: "https://placehold.co/40x40.png"
  },
];

const priorityVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    Alta: "destructive",
    Media: "secondary",
    Baja: "outline"
}


export function BacklogTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Backlog del Sistema de Diseño</CardTitle>
        <CardDescription>Tareas y mejoras para el sprint actual.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarea</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridad</TableHead>
              <TableHead>Asignado a</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backlogItems.map((item) => (
              <TableRow key={item.task}>
                <TableCell className="font-medium">{item.task}</TableCell>
                <TableCell>
                    <Badge variant={item.status === 'Hecho' ? 'default' : 'secondary'} className={item.status === 'Hecho' ? 'bg-green-600' : ''}>{item.status}</Badge>
                </TableCell>
                <TableCell>
                    <Badge variant={priorityVariant[item.priority]}>{item.priority}</Badge>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={item.avatar} alt={item.assignee} data-ai-hint="person avatar" />
                            <AvatarFallback>{item.assignee.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{item.assignee}</span>
                    </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
