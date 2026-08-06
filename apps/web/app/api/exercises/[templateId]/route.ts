import { NextRequest, NextResponse } from "next/server";
import { getExercise } from "@repo/curriculum";
import { generateExercise, toPublicExercise } from "@repo/exercise-engine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ templateId: string }> },
) {
  const { templateId } = await params;
  const template = getExercise(templateId);
  if (!template)
    return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
  const seed =
    request.nextUrl.searchParams.get("seed")?.slice(0, 100) || "default";
  const instance = generateExercise(template, seed);
  return NextResponse.json(toPublicExercise(instance, template));
}
