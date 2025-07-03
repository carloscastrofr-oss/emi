import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const changelog = [
  {
    version: "v2.1.0",
    date: "2024-05-15",
    changes: [
      { type: "Added", text: "New 'AvatarGroup' component." },
      { type: "Fixed", text: "Improved responsive behavior of 'Table' component." },
      { type: "Improved", text: "Updated focus styles for better accessibility." },
    ],
  },
  {
    version: "v2.0.0",
    date: "2024-04-20",
    changes: [
      { type: "Breaking", text: "Overhauled the entire color token system." },
      { type: "Added", text: "Dark mode support across all components." },
      { type: "Improved", text: "Performance improvements for the 'Select' component." },
    ],
  },
];

const badgeVariant : {[key:string]: "default" | "secondary" | "destructive" | "outline"} = {
    Added: "default",
    Fixed: "secondary",
    Improved: "outline",
    Breaking: "destructive",
}

export function ChangelogTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Changelog</CardTitle>
        <CardDescription>Release notes and updates for the design system.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {changelog.map((release) => (
            <div key={release.version}>
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-semibold">{release.version}</h3>
                <span className="text-sm text-muted-foreground">{release.date}</span>
              </div>
              <ul className="mt-4 list-none space-y-2 pl-2">
                {release.changes.map((change) => (
                  <li key={change.text} className="flex items-center gap-3">
                     <Badge variant={badgeVariant[change.type]}>{change.type}</Badge>
                     <span>{change.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
