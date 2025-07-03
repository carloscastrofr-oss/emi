import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BacklogTab } from "./backlog-tab";
import { VotingTab } from "./voting-tab";
import { ChangelogTab } from "./changelog-tab";

export default function WorkbenchPage() {
  return (
    <div>
      <PageHeader
        title="EMI.Workbench"
        description="Gobierna tu sistema de diseño con herramientas colaborativas."
      />
      <Tabs defaultValue="backlog" className="w-full">
        <TabsList>
          <TabsTrigger value="backlog">Backlog del DS</TabsTrigger>
          <TabsTrigger value="voting">Votación</TabsTrigger>
          <TabsTrigger value="changelog">Historial de Cambios</TabsTrigger>
        </TabsList>
        <TabsContent value="backlog">
          <BacklogTab />
        </TabsContent>
        <TabsContent value="voting">
          <VotingTab />
        </TabsContent>
        <TabsContent value="changelog">
          <ChangelogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
