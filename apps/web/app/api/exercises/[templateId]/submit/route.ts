import { NextRequest, NextResponse } from "next/server";
import { getExercise } from "@repo/curriculum";
import { generateExercise, validateAnswer } from "@repo/exercise-engine";
import { recordAttempt } from "@/lib/db";

interface Submission {
  seed?: unknown;
  answer?: unknown;
  durationMs?: unknown;
  usedHintIds?: unknown;
  lessonId?: unknown;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await params;
  const template = getExercise(templateId);
  if (!template)
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  const body = (await request.json()) as Submission;
  const seed =
    typeof body.seed === "string" ? body.seed.slice(0, 100) : "default";
  const instance = generateExercise(template, seed);

  let result;
  if (template.validators[0]?.type === "symbolic-equivalence") {
    const response = await fetch(
      `${process.env.SYMBOLIC_SERVICE_URL ?? "http://localhost:8000"}/equivalence`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          expected: String(instance.expectedAnswer),
          actual: String(body.answer ?? ""),
          variables: template.validators[0].variables,
          domain: template.validators[0].domain,
        }),
        signal: AbortSignal.timeout(5_000),
      },
    );
    const symbolic = (await response.json()) as { equivalent: boolean };
    result = {
      correct: symbolic.equivalent,
      score: symbolic.equivalent ? 1 : 0,
      message: symbolic.equivalent
        ? "Helyes válasz."
        : "A kifejezés nem ekvivalens a várt eredménnyel.",
      ...(symbolic.equivalent ? {} : { errorCategory: "symbolic-mismatch" }),
    };
  } else {
    result = validateAnswer(template, instance, body.answer);
  }

  try {
    await recordAttempt({
      lessonId: typeof body.lessonId === "string" ? body.lessonId : "unknown",
      templateId,
      templateVersion: template.version,
      seed,
      answer: body.answer,
      correct: result.correct,
      score: result.score,
      durationMs:
        typeof body.durationMs === "number" ? Math.max(0, body.durationMs) : 0,
      usedHintIds: Array.isArray(body.usedHintIds)
        ? body.usedHintIds.filter(
            (item): item is string => typeof item === "string",
          )
        : [],
      ...(result.errorCategory ? { errorCategory: result.errorCategory } : {}),
    });
  } catch (error) {
    console.error("Could not persist exercise attempt", error);
  }

  return NextResponse.json(result);
}
