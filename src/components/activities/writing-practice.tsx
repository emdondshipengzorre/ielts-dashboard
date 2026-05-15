"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PROMPTS_BY_PHASE: Record<number, string[]> = {
  1: [
    "Describe your daily routine. What do you do in the morning, afternoon, and evening?",
    "Write about your favorite food. Where do you usually eat it?",
    "Describe your hometown. What do you like about it?",
    "Write about a person in your family. What do they do?",
    "What do you like to do in your free time? Why?",
    "Describe your home. How many rooms does it have?",
    "Write about your best friend. How did you meet?",
    "What is your favorite season? Why do you like it?",
    "Describe a place you visited recently. What did you see?",
    "Write about your job or studies. What do you do every day?",
  ],
  2: [
    "Some people prefer to live in a big city, while others prefer a small town. Discuss both views.",
    "Describe a skill you would like to learn. Why is it important to you?",
    "Write about the advantages and disadvantages of working from home.",
    "How has technology changed the way people communicate? Give examples.",
    "Describe an event that changed your life. What happened and how did it affect you?",
    "Is it better to travel alone or with friends? Discuss both options.",
    "Write about the importance of learning a second language.",
    "Describe a book or movie that made a strong impression on you.",
  ],
  3: [
    "Some people believe that university education should be free. To what extent do you agree or disagree?",
    "The gap between the rich and the poor is increasing. What problems does this cause? What solutions can you suggest?",
    "In many countries, the proportion of older people is increasing. What effects does this have on society?",
    "Some people think that the best way to reduce crime is to give longer prison sentences. Others think there are better ways. Discuss both views and give your opinion.",
    "Many people believe that social networking sites have a negative impact on individuals and society. To what extent do you agree?",
  ],
  4: [
    "Some experts believe that it is better for children to begin learning a foreign language at primary school rather than secondary school. Do the advantages outweigh the disadvantages?",
    "In some countries, an increasing number of people are suffering from health problems as a result of eating too much fast food. It is therefore necessary for governments to impose a higher tax on this kind of food. To what extent do you agree or disagree?",
    "Nowadays many people choose to be self-employed rather than work for a company. Why might this be the case? What could be the disadvantages of being self-employed?",
  ],
};

interface WritingPracticeProps {
  phase?: number;
}

export function WritingPractice({ phase = 1 }: WritingPracticeProps) {
  const prompts = PROMPTS_BY_PHASE[phase] ?? PROMPTS_BY_PHASE[1];
  const [promptIndex, setPromptIndex] = useState(() =>
    Math.floor(Math.random() * prompts.length)
  );
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const timeLimit = phase >= 3 ? 40 * 60 : 15 * 60;
  const wordTarget = phase >= 3 ? 250 : phase >= 2 ? 150 : 100;

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isRunning]);

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }, []);

  function newPrompt() {
    setPromptIndex((i) => (i + 1) % prompts.length);
    setText("");
    setSeconds(0);
    setIsRunning(false);
  }

  const timeWarning = seconds > timeLimit;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Writing Practice</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={timeWarning ? "destructive" : "secondary"} className="tabular-nums">
              {formatTime(seconds)} / {formatTime(timeLimit)}
            </Badge>
            <Badge variant={wordCount >= wordTarget ? "default" : "secondary"} className="tabular-nums">
              {wordCount} / {wordTarget} words
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-sm font-medium">Prompt:</p>
          <p className="text-sm text-muted-foreground mt-1">{prompts[promptIndex]}</p>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (!isRunning && e.target.value.length > 0) setIsRunning(true);
          }}
          placeholder="Start writing here... Timer starts automatically."
          className="flex min-h-[200px] w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-none"
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsRunning(!isRunning)}
            className="gap-1.5"
          >
            {isRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {isRunning ? "Pause" : "Resume"}
          </Button>
          <Button variant="outline" size="sm" onClick={newPrompt} className="gap-1.5">
            <RotateCcw className="size-3.5" />
            New Prompt
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
