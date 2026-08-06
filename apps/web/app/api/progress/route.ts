import { NextRequest, NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
  if (!process.env.DATABASE_URL) return NextResponse.json([]);
  const result = await getDatabase().query(
    "SELECT lesson_id, status, completed_at, updated_at FROM lesson_progress WHERE learner_id = 'local-learner' ORDER BY updated_at DESC",
  );
  return NextResponse.json(result.rows);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    lessonId?: unknown;
    status?: unknown;
  };
  if (
    typeof body.lessonId !== "string" ||
    !["started", "completed"].includes(String(body.status))
  ) {
    return NextResponse.json(
      { error: "Invalid progress payload" },
      { status: 400 },
    );
  }
  await getDatabase().query(
    `INSERT INTO lesson_progress (learner_id, lesson_id, status, completed_at)
     VALUES ('local-learner', $1, $2, CASE WHEN $2 = 'completed' THEN now() ELSE NULL END)
     ON CONFLICT (learner_id, lesson_id) DO UPDATE SET
       status = EXCLUDED.status,
       completed_at = EXCLUDED.completed_at,
       updated_at = now()`,
    [body.lessonId, body.status],
  );
  return NextResponse.json({ saved: true });
}
