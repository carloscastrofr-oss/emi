import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const proposals = [
  {
    title: "New Token: --color-brand-secondary",
    description: "Proposal to add a new secondary brand color for marketing materials.",
    votes: 23,
  },
  {
    title: "New Component: Stepper",
    description: "A multi-step progress indicator for forms and onboarding flows.",
    votes: 15,
  },
  {
    title: "Deprecate: Old 'Grid' component",
    description: "Proposing to deprecate the legacy Grid component in favor of the new Flex layout utilities.",
    votes: 8,
  },
];

export function VotingTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
            <CardTitle>Proposals</CardTitle>
            <CardDescription>Vote on new components, tokens, and other changes to the design system.</CardDescription>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {proposals.map((proposal) => (
          <Card key={proposal.title} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">{proposal.title}</CardTitle>
              <CardDescription>{proposal.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end">
                <div className="text-3xl font-bold">{proposal.votes}</div>
                <div className="ml-2 text-muted-foreground">Votes</div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button variant="outline" className="w-full">
                <ThumbsUp className="mr-2 h-4 w-4" /> Upvote
              </Button>
              <Button variant="outline" className="w-full">
                <ThumbsDown className="mr-2 h-4 w-4" /> Downvote
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
