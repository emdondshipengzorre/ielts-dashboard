"use client";

import { useState, useEffect, useCallback } from "react";
import { Mic, RotateCcw, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

export function SpeakingPractice() {
  const [part, setPart] = useState<Part>(1);
  const [topicIndex, setTopicIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);

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
  }

  const topic = PART1_TOPICS[topicIndex];
  const card = PART2_CARDS[cardIndex];
  const overTime = seconds > timeLimit;

  return (
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
              onClick={() => { setPart(p); reset(); }}
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
      </CardContent>
    </Card>
  );
}
