import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BacklogTab } from "./backlog-tab";
import { VotingTab } from "./voting-tab";
import { RequestsTab } from "./requests-tab";

export default function WorkbenchPage({
  params: _params,
  searchParams: _searchParams,
}: {
  params: Record<string, never>;
  searchParams: Record<string, never>;
}) {
  return (
    <div>
      <PageHeader
        title="Workbench"
        description="Gobierna tu sistema de diseño con herramientas colaborativas."
      />
      <Tabs defaultValue="requests" className="w-full">
        <TabsList>
          <TabsTrigger value="requests">Solicitudes</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
          <TabsTrigger value="voting">Votación</TabsTrigger>
        </TabsList>
        <TabsContent value="requests">
          <RequestsTab />
        </TabsContent>
        <TabsContent value="backlog">
          <BacklogTab />
        </TabsContent>
        <TabsContent value="voting">
          <VotingTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
