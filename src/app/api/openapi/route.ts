export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

// Parse the hand-maintained openapi.yaml at request time and serve it as JSON so
// Swagger UI (and Postman import) can consume it.
export function GET() {
  const file = readFileSync(join(process.cwd(), "openapi.yaml"), "utf8");
  return NextResponse.json(parse(file));
}
