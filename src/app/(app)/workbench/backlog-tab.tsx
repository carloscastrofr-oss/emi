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
    task: "Create new DatePicker component",
    status: "In Progress",
    priority: "High",
    assignee: "Alex",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    task: "Update primary button style",
    status: "To Do",
    priority: "Medium",
    assignee: "Sam",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    task: "Add accessibility documentation",
    status: "Done",
    priority: "Low",
    assignee: "Jordan",
    avatar: "https://placehold.co/40x40.png"
  },
  {
    task: "Refactor Card component API",
    status: "In Review",
    priority: "High",
    assignee: "Taylor",
    avatar: "https://placehold.co/40x40.png"
  },
];

const priorityVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    High: "destructive",
    Medium: "secondary",
    Low: "outline"
}


export function BacklogTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Design System Backlog</CardTitle>
        <CardDescription>Tasks and improvements for the current sprint.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assignee</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backlogItems.map((item) => (
              <TableRow key={item.task}>
                <TableCell className="font-medium">{item.task}</TableCell>
                <TableCell>
                    <Badge variant={item.status === 'Done' ? 'default' : 'secondary'} className={item.status === 'Done' ? 'bg-green-600' : ''}>{item.status}</Badge>
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
