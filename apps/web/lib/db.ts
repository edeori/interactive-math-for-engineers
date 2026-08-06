import { Pool } from "pg";

const globalDatabase = globalThis as unknown as { mathPool?: Pool };

export function getDatabase(): Pool {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL is not configured");
  globalDatabase.mathPool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 3_000,
  });
  return globalDatabase.mathPool;
}

export async function recordAttempt(input: {
  lessonId: string;
  templateId: string;
  templateVersion: number;
  seed: string;
  answer: unknown;
  correct: boolean;
  score: number;
  durationMs: number;
  usedHintIds: string[];
  errorCategory?: string;
}): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  await getDatabase().query(
    `INSERT INTO exercise_attempt
      (learner_id, lesson_id, template_id, template_version, seed, answer, is_correct, score, duration_ms, used_hint_ids, error_category)
     VALUES ('local-learner', $1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)`,
    [
      input.lessonId,
      input.templateId,
      input.templateVersion,
      input.seed,
      JSON.stringify(input.answer),
      input.correct,
      input.score,
      input.durationMs,
      input.usedHintIds,
      input.errorCategory ?? null,
    ],
  );
}
