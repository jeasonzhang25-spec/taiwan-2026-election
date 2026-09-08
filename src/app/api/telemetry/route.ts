import { NextResponse } from "next/server";

const ALLOWED_TYPES = new Set(["web-vital", "client-error"]);
const ALLOWED_VITALS = new Set(["CLS", "FCP", "INP", "LCP", "TTFB"]);

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > 2048) return new NextResponse(null, { status: 413 });

  try {
    const input = await request.json() as Record<string, unknown>;
    if (!ALLOWED_TYPES.has(String(input.type))) return new NextResponse(null, { status: 400 });
    const entry = {
      type: String(input.type),
      name: ALLOWED_VITALS.has(String(input.name)) ? String(input.name) : undefined,
      value: Number.isFinite(Number(input.value)) ? Number(input.value) : undefined,
      rating: ["good", "needs-improvement", "poor"].includes(String(input.rating)) ? String(input.rating) : undefined,
      category: ["error", "unhandled-rejection"].includes(String(input.category)) ? String(input.category) : undefined,
      path: typeof input.path === "string" && /^\/(?:$|county\/[a-z-]+$|data-status$|sources$|roadmap$)/.test(input.path) ? input.path : "other",
      release: typeof input.release === "string" ? input.release.slice(0, 64) : "unknown",
      receivedAt: new Date().toISOString(),
    };
    console.info("site_telemetry", JSON.stringify(entry));
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 400 });
  }
}

export function GET() {
  return NextResponse.json({ status: "ok", collects: ["sampled-web-vitals", "anonymous-client-error-counts"], personalData: false });
}
