import { NextResponse } from "next/server";
import { getPollDataHealth } from "@/lib/data/health";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getPollDataHealth(), {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=1800" },
  });
}
