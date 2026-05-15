"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, RotateCcw, ChevronRight, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Phase } from "@/lib/types";

const PART1_TOPICS = [
  { topic: "Hometown", questions: ["Where is your hometown?", "What do you like about it?", "Has it changed much recently?", "Would you recommend it to visitors?"] },
  { topic: "Work/Studies", questions: ["What do you do?", "Why did you choose this job/subject?", "What do you enjoy most about it?", "Do you plan to continue in the future?"] },
  { topic: "Daily Routine", questions: ["What is your typical daily routine?", "What time do you usually get up?", "Is your routine different on weekends?", "Would you like to change your routine?"] },
  { topic: "Food", questions: ["What kind of food do you like?", "Do you prefer cooking at home or eating out?", "Is there any food you dislike?", "What food is popular in your country?"] },
  { topic: "Weather", questions: ["What's the weather like in your country?", "What's your favorite type of weather?", "Does the weather affect your mood?", "What do you do on rainy days?"] },
];

const PART2_CARDS = [
  { cue: "Describe a place you have visited that you found beautiful.", points: ["Where it is", "When you went there", "What you saw there", "Why you found it beautiful"] },
  { cue: "Describe a person who has influenced you.", points: ["Who this person is", "How you know them", "What they did", "How they influenced you"] },
  { cue: "Describe a skill you would like to learn.", points: ["What the skill is", "Why you want to learn it", "How you would learn it", "How it would help you"] },
  { cue: "Describe a book you have read recently.", points: ["What the book is about", "Why you read it", "What you liked about it", "Whether you would recommend it"] },
  { cue: "Describe a time when you helped someone.", points: ["Who you helped", "What the situation was", "How you helped them", "How you felt about it"] },
];

type Part = 1 | 2 | 3;

interface SpeakingFeedback {
  overallBand: number;
  criteria: {
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRange: number;
    pronunciation: number;
  };
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  tips: string;
}

interface SpeakingPracticeProps {
  phase?: Phase;
}

export function SpeakingPractice({ phase = 1 }: SpeakingPracticeProps) {
  const [part, setPart] = useState<Part>(1);
  const [topicIndex, setTopicIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [responseText, setResponseText] = useState("");
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalError, setEvalError] = useState<string | null>(null);

  const timeLimit = part === 1 ? 5 * 60 : part === 2 ? 2 * 60 : 5 * 60;
  const prepTime = part === 2 ? 60 : 0;

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

  function reset() {
    setSeconds(0);
    setIsRunning(false);
    setQuestionIndex(0);
  }

  function nextTopic() {
    if (part === 1) setTopicIndex((i) => (i + 1) % PART1_TOPICS.length);
    if (part === 2) setCardIndex((i) => (i + 1) % PART2_CARDS.length);
    reset();
    setResponseText("");
    setFeedback(null);
    setEvalError(null);
  }

  function getCurrentTopic(): string {
    if (part === 1) {
      const topic = PART1_TOPICS[topicIndex];
      return topic.questions[questionIndex] ?? topic.topic;
    }
    if (part === 2) {
      return PART2_CARDS[cardIndex].cue;
    }
    return "Discussion questions related to Part 2";
  }

  async function evaluateResponse() {
    setIsEvaluating(true);
    setEvalError(null);
    setFeedback(null);

    try {
      const res = await fetch("/api/evaluate-speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          part,
          topic: getCurrentTopic(),
          response: responseText,
          phase,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      const data: SpeakingFeedback = await res.json();
      setFeedback(data);
    } catch (err) {
      setEvalError(err instanceof Error ? err.message : "Failed to get feedback");
    } finally {
      setIsEvaluating(false);
    }
  }

  const topic = PART1_TOPICS[topicIndex];
  const card = PART2_CARDS[cardIndex];
  const overTime = seconds > timeLimit;

  function bandColor(band: number): string {
    if (band >= 7) return "text-green-400";
    if (band >= 6) return "text-yellow-400";
    if (band >= 5) return "text-orange-400";
    return "text-red-400";
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Speaking Practice</CardTitle>
            <Badge variant={overTime ? "destructive" : "secondary"} className="tabular-nums">
              {formatTime(seconds)} / {formatTime(timeLimit)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-1">
            {([1, 2, 3] as Part[]).map((p) => (
              <Button
                key={p}
                variant={part === p ? "default" : "outline"}
                size="sm"
                onClick={() => { setPart(p); reset(); setResponseText(""); setFeedback(null); setEvalError(null); }}
              >
                Part {p}
              </Button>
            ))}
          </div>

          {part === 1 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Topic: {topic.topic}</p>
              <div className="space-y-2">
                {topic.questions.map((q, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-2 text-sm ${
                      i === questionIndex ? "border-primary bg-primary/5" : "border-border/50"
                    }`}
                  >
                    {q}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuestionIndex((i) => Math.min(i + 1, topic.questions.length - 1))}
                disabled={questionIndex >= topic.questions.length - 1}
                className="gap-1.5"
              >
                <ChevronRight className="size-3.5" />
                Next Question
              </Button>
            </div>
          )}

          {part === 2 && (
            <div className="space-y-3">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">{card.cue}</p>
                <p className="text-xs text-muted-foreground mt-2">You should say:</p>
                <ul className="mt-1 space-y-0.5">
                  {card.points.map((p, i) => (
                    <li key={i} className="text-xs text-muted-foreground">• {p}</li>
                  ))}
                </ul>
              </div>
              {seconds < prepTime && isRunning && (
                <Badge variant="secondary">Preparation: {formatTime(prepTime - seconds)} remaining</Badge>
              )}
            </div>
          )}

          {part === 3 && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-sm font-medium">Discussion questions related to Part 2:</p>
              <p className="text-sm text-muted-foreground mt-2">
                Think about broader themes from your Part 2 answer. Discuss causes, effects, comparisons,
                and give your opinion with supporting examples.
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant={isRunning ? "outline" : "default"}
              size="sm"
              onClick={() => setIsRunning(!isRunning)}
              className="gap-1.5"
            >
              <Mic className={`size-3.5 ${isRunning ? "text-red-400 animate-pulse" : ""}`} />
              {isRunning ? "Stop" : "Start Speaking"}
            </Button>
            <Button variant="outline" size="sm" onClick={nextTopic} className="gap-1.5">
              <RotateCcw className="size-3.5" />
              New Topic
            </Button>
          </div>

          {/* Response input and AI feedback section */}
          <div className="space-y-3 border-t pt-4">
            <p className="text-sm font-medium">AI Feedback</p>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              placeholder="Type your speaking response here for AI feedback..."
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
            />

            {responseText.trim().length > 20 && (
              <Button
                size="sm"
                onClick={evaluateResponse}
                disabled={isEvaluating}
                className="gap-1.5"
              >
                {isEvaluating ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Send className="size-3.5" />
                )}
                {isEvaluating ? "Evaluating..." : "Get AI Feedback"}
              </Button>
            )}

            {evalError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{evalError}</p>
              </div>
            )}

            {isEvaluating && (
              <div className="space-y-3">
                <div className="h-8 w-32 animate-pulse rounded-lg bg-muted" />
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-6 animate-pulse rounded-lg bg-muted" />
                  ))}
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 animate-pulse rounded-lg bg-muted" style={{ width: `${80 - i * 10}%` }} />
                  ))}
                </div>
              </div>
            )}

            {feedback && !isEvaluating && (
              <div className="space-y-4">
                {/* Overall Band */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Overall Band:</span>
                  <span className={`text-2xl font-bold ${bandColor(feedback.overallBand)}`}>
                    {feedback.overallBand}
                  </span>
                </div>

                {/* Criteria Scores */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ["Fluency & Coherence", feedback.criteria.fluencyCoherence],
                    ["Lexical Resource", feedback.criteria.lexicalResource],
                    ["Grammatical Range", feedback.criteria.grammaticalRange],
                    ["Pronunciation", feedback.criteria.pronunciation],
                  ] as const).map(([label, score]) => (
                    <div key={label} className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-1.5">
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className={`text-sm font-semibold ${bandColor(score)}`}>{score}</span>
                    </div>
                  ))}
                </div>

                {/* Strengths */}
                {feedback.strengths.length > 0 && (
                  <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1.5">
                    <p className="text-xs font-medium text-green-400">Strengths</p>
                    <ul className="space-y-1">
                      {feedback.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-green-300/90">+ {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {feedback.improvements.length > 0 && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1.5">
                    <p className="text-xs font-medium text-amber-400">Areas for Improvement</p>
                    <ul className="space-y-1">
                      {feedback.improvements.map((s, i) => (
                        <li key={i} className="text-sm text-amber-300/90">- {s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Model Answer */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-primary">Band 7+ Model Answer</p>
                  <p className="text-sm leading-relaxed">{feedback.modelAnswer}</p>
                </div>

                {/* Tip */}
                {feedback.tips && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-sm"><span className="font-medium">Tip:</span> {feedback.tips}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
