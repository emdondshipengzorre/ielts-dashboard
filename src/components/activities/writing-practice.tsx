"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Pause, RotateCcw, Sparkles, Loader2, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface WritingFeedback {
  overallBand: number;
  criteria: {
    taskAchievement: number;
    coherenceCohesion: number;
    lexicalResource: number;
    grammaticalRange: number;
  };
  strengths: string[];
  improvements: string[];
  correctedExcerpt: string;
  tips: string;
}

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
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

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
    setFeedback(null);
  }

  async function handleEvaluate() {
    setIsEvaluating(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompts[promptIndex],
          text,
          phase,
          wordCount,
          timeSpentSeconds: seconds,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to evaluate writing");
      }
      const data: WritingFeedback = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error("Evaluation error:", err);
    } finally {
      setIsEvaluating(false);
    }
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
          {wordCount >= 30 && (
            <Button
              size="sm"
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="gap-1.5 ml-auto"
            >
              {isEvaluating ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5" />
              )}
              {isEvaluating ? "Evaluating..." : "Get AI Feedback"}
            </Button>
          )}
        </div>

        {isEvaluating && (
          <div className="space-y-3">
            <div className="h-20 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-32 rounded-lg bg-muted/50 animate-pulse" />
            <div className="h-24 rounded-lg bg-muted/50 animate-pulse" />
          </div>
        )}

        {feedback && !isEvaluating && (
          <FeedbackPanel feedback={feedback} />
        )}
      </CardContent>
    </Card>
  );
}

function getBandColor(band: number): string {
  if (band >= 7) return "text-green-400";
  if (band >= 6) return "text-emerald-400";
  if (band >= 5) return "text-amber-400";
  return "text-red-400";
}

function getBandBg(band: number): string {
  if (band >= 7) return "bg-green-400";
  if (band >= 6) return "bg-emerald-400";
  if (band >= 5) return "bg-amber-400";
  return "bg-red-400";
}

function FeedbackPanel({ feedback }: { feedback: WritingFeedback }) {
  const criteriaItems = [
    { label: "Task Achievement", value: feedback.criteria.taskAchievement },
    { label: "Coherence & Cohesion", value: feedback.criteria.coherenceCohesion },
    { label: "Lexical Resource", value: feedback.criteria.lexicalResource },
    { label: "Grammatical Range", value: feedback.criteria.grammaticalRange },
  ];

  return (
    <div className="space-y-4 pt-2">
      {/* Overall Band Score */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-0">
          <div className="flex flex-col items-center justify-center rounded-lg bg-muted/50 px-5 py-3">
            <span className={`text-3xl font-bold tabular-nums ${getBandColor(feedback.overallBand)}`}>
              {feedback.overallBand}
            </span>
            <span className="text-xs text-muted-foreground">Band Score</span>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2">
            {criteriaItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className={`font-medium tabular-nums ${getBandColor(item.value)}`}>
                    {item.value}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBandBg(item.value)}`}
                    style={{ width: `${(item.value / 9) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Improvements */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm text-green-400">
              <CheckCircle2 className="size-4" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {feedback.strengths.map((s, i) => (
                <li key={i} className="text-sm text-green-300/80 flex gap-2">
                  <span className="shrink-0 mt-1.5 size-1 rounded-full bg-green-400" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm text-amber-400">
              <AlertTriangle className="size-4" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {feedback.improvements.map((s, i) => (
                <li key={i} className="text-sm text-amber-300/80 flex gap-2">
                  <span className="shrink-0 mt-1.5 size-1 rounded-full bg-amber-400" />
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Corrected Excerpt */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Corrected First Paragraph</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed border-l-2 border-primary/50">
            {feedback.correctedExcerpt}
          </div>
        </CardContent>
      </Card>

      {/* Tip */}
      <div className="flex gap-3 rounded-lg bg-primary/10 border border-primary/20 p-3">
        <Lightbulb className="size-4 shrink-0 mt-0.5 text-primary" />
        <p className="text-sm text-primary/90">{feedback.tips}</p>
      </div>
    </div>
  );
}
