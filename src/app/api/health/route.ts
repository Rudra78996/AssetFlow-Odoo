export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
export function GET() {
  return NextResponse.json({ success: true, data: { status: "ok", ts: new Date().toISOString() } });
}
