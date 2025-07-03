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
        description="Govern your design system with collaborative tools."
      />
      <Tabs defaultValue="backlog" className="w-full">
        <TabsList>
          <TabsTrigger value="backlog">DS Backlog</TabsTrigger>
          <TabsTrigger value="voting">Voting</TabsTrigger>
          <TabsTrigger value="changelog">Changelog</TabsTrigger>
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
