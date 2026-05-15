import { NextResponse } from "next/server";

interface EvaluateSpeakingRequest {
  part: 1 | 2 | 3;
  topic: string;
  response: string;
  phase: number;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured. Add it to .env.local" },
      { status: 500 }
    );
  }

  const body: EvaluateSpeakingRequest = await request.json();

  if (!body.response || body.response.trim().length < 20) {
    return NextResponse.json(
      { error: "Response must be at least 20 characters." },
      { status: 400 }
    );
  }

  const strictness =
    body.phase <= 2
      ? "Be encouraging and supportive. Focus on what the learner is doing well while gently suggesting improvements. Score generously to build confidence."
      : "Apply strict IELTS scoring standards. Be precise and critical in your assessment. The learner needs accurate feedback to prepare for the real exam.";

  const systemPrompt = `You are an experienced IELTS Speaking examiner evaluating a Mandarin-speaking learner's response.
The learner is practicing IELTS Speaking Part ${body.part}.

Evaluate based on the 4 IELTS Speaking criteria:
- Fluency & Coherence (FC): logical flow, coherence markers, self-correction, hesitation
- Lexical Resource (LR): vocabulary range, collocations, paraphrasing, precision
- Grammatical Range & Accuracy (GRA): sentence structures, tense usage, error frequency
- Pronunciation (assess from written text): natural phrasing, use of discourse markers, stress patterns implied by punctuation and word choice, intonation markers

${strictness}

Respond with ONLY valid JSON matching this exact structure:
{
  "overallBand": <number 1-9, can use .5 increments>,
  "criteria": {
    "fluencyCoherence": <number 1-9, can use .5 increments>,
    "lexicalResource": <number 1-9, can use .5 increments>,
    "grammaticalRange": <number 1-9, can use .5 increments>,
    "pronunciation": <number 1-9, can use .5 increments>
  },
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": ["<area 1>", "<area 2>", ...],
  "modelAnswer": "<a Band 7+ model answer for the same question, demonstrating natural fluency, varied vocabulary, and complex grammar>",
  "tips": "<one concise, actionable tip for the learner>"
}`;

  const userMessage = `IELTS Speaking Part ${body.part}
Topic/Question: ${body.topic}

Learner's response:
${body.response}`;

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
          { role: "user", content: userMessage },
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

    const evaluation = JSON.parse(jsonMatch[0]);
    return NextResponse.json(evaluation);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
