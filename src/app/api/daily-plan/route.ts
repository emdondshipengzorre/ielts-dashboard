import { NextResponse } from "next/server";
import { PHASE_LABELS, type Phase, type Skill, SKILL_LABELS } from "@/lib/types";

interface DailyPlanRequest {
  currentPhase: Phase;
  elapsedMonths: number;
  dayOfWeek: string;
  location: string;
  hoursBySkill: Record<string, number>;
  totalHours: number;
  targetHours: number;
  weeklyHours: number;
  weeklyTarget: number;
  streak: number;
  recentActivities: string[];
  upcomingMilestone: { title: string; description: string; month: number } | null;
  ankiStats: { dueCards: number; reviewedToday: number; isConnected: boolean } | null;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  const body: DailyPlanRequest = await request.json();

  const skillSummary = Object.entries(body.hoursBySkill)
    .sort(([, a], [, b]) => a - b)
    .map(([skill, hours]) => `${SKILL_LABELS[skill as Skill] ?? skill}: ${hours.toFixed(1)}h`)
    .join(", ");

  const weakSkills = Object.entries(body.hoursBySkill)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3)
    .map(([s]) => SKILL_LABELS[s as Skill] ?? s)
    .join(", ");

  const milestoneContext = body.upcomingMilestone
    ? `Next milestone: "${body.upcomingMilestone.title}" (Month ${body.upcomingMilestone.month}) — ${body.upcomingMilestone.description}`
    : "No upcoming milestone.";

  const ankiContext = body.ankiStats?.isConnected
    ? `Anki: ${body.ankiStats.dueCards} cards due, ${body.ankiStats.reviewedToday} reviewed today.`
    : "Anki: not connected.";

  const totalHours = body.totalHours ?? 0;
  const targetHours = body.targetHours ?? 1250;
  const progressPct = targetHours > 0 ? Math.round((totalHours / targetHours) * 100) : 0;
  const weeklyPct = body.weeklyTarget > 0 ? Math.round((body.weeklyHours / body.weeklyTarget) * 100) : 0;
  const recentContext = body.recentActivities?.length > 0
    ? `Recent activities (last 3 days): ${body.recentActivities.join("; ")}`
    : "No recent study sessions logged.";

  const systemPrompt = `You are an IELTS study coach for a Mandarin-speaking adult learner (beginner level, targeting Band 7+ Academic).
Their 30-month plan has 4 phases: Foundation (months 1-12), Intermediate (13-20), IELTS Prep (21-26), Test Ready (27-30).
They are in Phase ${body.currentPhase} (${PHASE_LABELS[body.currentPhase]}), month ${body.elapsedMonths}.
Today is ${body.dayOfWeek}. Location: ${body.location}.

PROGRESS:
- Total: ${totalHours.toFixed(1)}h / ${targetHours}h (${progressPct}%)
- This week: ${body.weeklyHours?.toFixed(1) ?? 0}h / ${body.weeklyTarget ?? 10}h (${weeklyPct}%)
- Current streak: ${body.streak ?? 0} day(s)
${recentContext}

SKILL BALANCE:
${skillSummary}
Weakest skills (need more focus): ${weakSkills}

${milestoneContext}
${ankiContext}

ADAPTATION RULES:
- If weekly progress is below 50%, suggest shorter but more frequent sessions to build momentum
- If a skill has <5% of total hours, mark related tasks as "high" priority
- If streak is 0, start with an easy/fun activity to re-engage
- If streak is 7+, suggest a slightly more challenging activity
- Match activities to the current phase goals (Phase 1: basics, Phase 2: IELTS format intro, Phase 3: test strategies, Phase 4: mock exams)
- Vary activities from recent sessions to avoid repetition
- Use activity names that match these exactly when applicable: "BBC 6 Minute English — commute", "Anki — 10 new words + review", "Anki review", "English File textbook", "italki tutor — conversation + grammar", "Graded reader — Oxford Bookworms", "VOA Learning English — slow news", "English YouTube/Netflix with subtitles", "Write a short paragraph about the week"

Generate a personalized daily study plan. Consider their phase goals, weak areas, and available time (~2 hours on weekdays, ~3 hours on weekends).
Respond with ONLY valid JSON matching this exact structure:
{
  "greeting": "short personalized greeting",
  "tasks": [
    {
      "time": "Morning|Afternoon|Evening",
      "skill": "one of: listening, speaking, reading, writing, vocabulary, grammar, mock-test, tutor-session",
      "activity": "specific activity description",
      "duration": "e.g. 30 min, 1 hour",
      "priority": "high|medium|low",
      "reason": "brief reason this was chosen"
    }
  ],
  "ankiReminder": "optional reminder about Anki reviews, null if not connected",
  "motivationalNote": "short encouraging message",
  "totalPlannedHours": 2.0
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [
          { role: "user", content: "Generate my study plan for today." },
        ],
        system: systemPrompt,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json(
        { error: `Anthropic API error: ${response.status} ${err}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 502 }
      );
    }

    const plan = JSON.parse(jsonMatch[0]);
    plan.generatedAt = new Date().toISOString();

    return NextResponse.json(plan);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
