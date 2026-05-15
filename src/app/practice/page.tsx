"use client";

import { useEffect } from "react";
import { seedDatabase } from "@/lib/seed";
import { getPlanConfig, getCurrentPhase } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WritingPractice } from "@/components/activities/writing-practice";
import { SpeakingPractice } from "@/components/activities/speaking-practice";

export default function PracticePage() {
  useEffect(() => {
    seedDatabase().catch(console.error);
  }, []);

  const config = getPlanConfig();
  const currentPhase = getCurrentPhase(config.startDate);

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Practice</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Guided IELTS exercises with timers and prompts
          </p>
        </div>

        <Tabs defaultValue="writing">
          <TabsList>
            <TabsTrigger value="writing">Writing</TabsTrigger>
            <TabsTrigger value="speaking">Speaking</TabsTrigger>
          </TabsList>

          <TabsContent value="writing" className="mt-4">
            <WritingPractice phase={currentPhase} />
          </TabsContent>

          <TabsContent value="speaking" className="mt-4">
            <SpeakingPractice phase={currentPhase} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
