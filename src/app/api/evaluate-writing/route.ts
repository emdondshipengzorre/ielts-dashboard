import { NextResponse } from "next/server";

interface EvaluateWritingRequest {
  prompt: string;
  text: string;
  phase: number;
  wordCount: number;
  timeSpentSeconds: number;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  const body: EvaluateWritingRequest = await request.json();

  const strictness =
    body.phase <= 2
      ? "Be encouraging and supportive. Focus on the most basic and impactful errors. Highlight what the student did well before mentioning improvements. Use simpler language in your feedback."
      : "Apply strict IELTS Academic Writing scoring standards. Be precise and detailed in your assessment. Point out subtle errors in grammar, cohesion, and task response.";

  const systemPrompt = `You are an experienced IELTS Writing examiner providing feedback to a Mandarin-speaking learner.

EVALUATION CONTEXT:
- The student is in Phase ${body.phase} of a 4-phase IELTS preparation plan.
- Phase 1-2: Foundation/Intermediate (be encouraging, focus on basic errors)
- Phase 3-4: IELTS Prep/Test Ready (use strict IELTS standards)
- Word count: ${body.wordCount} words
- Time spent: ${Math.floor(body.timeSpentSeconds / 60)} minutes ${body.timeSpentSeconds % 60} seconds

${strictness}

Evaluate the essay based on the 4 official IELTS Writing criteria:
1. Task Achievement (TA) — Does the response address the task? Is the position clear?
2. Coherence & Cohesion (CC) — Is the essay logically organized? Are linking words used effectively?
3. Lexical Resource (LR) — Is vocabulary varied and accurate? Are there spelling errors?
4. Grammatical Range & Accuracy (GRA) — Are sentence structures varied? Are there grammatical errors?

Common issues for Mandarin speakers to watch for:
- Article usage (a/an/the)
- Plural forms
- Tense consistency
- Subject-verb agreement
- Run-on sentences
- Direct translation patterns from Chinese

You MUST respond with ONLY valid JSON matching this exact structure (no markdown, no code fences):
{
  "overallBand": <number like 5.0 or 5.5>,
  "criteria": {
    "taskAchievement": <number>,
    "coherenceCohesion": <number>,
    "lexicalResource": <number>,
    "grammaticalRange": <number>
  },
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1 with specific example from their text>", "<improvement 2 with specific example>"],
  "correctedExcerpt": "<corrected version of their first paragraph>",
  "tips": "<one specific actionable tip for their next writing session>"
}`;

  const userMessage = `Writing Prompt: "${body.prompt}"

Student's Essay:
${body.text}`;

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
        messages: [{ role: "user", content: userMessage }],
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

    const feedback = JSON.parse(jsonMatch[0]);
    return NextResponse.json(feedback);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
