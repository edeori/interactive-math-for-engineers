import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";

export async function GET() {
  const checks = { database: false, symbolicService: false };
  try {
    await getDatabase().query("SELECT 1");
    checks.database = true;
  } catch {}
  try {
    const response = await fetch(
      `${process.env.SYMBOLIC_SERVICE_URL ?? "http://localhost:8000"}/health`,
      {
        signal: AbortSignal.timeout(2_000),
        cache: "no-store",
      },
    );
    checks.symbolicService = response.ok;
  } catch {}
  const healthy = checks.database && checks.symbolicService;
  return NextResponse.json(
    { status: healthy ? "ok" : "degraded", checks },
    { status: healthy ? 200 : 503 },
  );
}
