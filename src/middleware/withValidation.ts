import type { NextRequest } from "next/server";
import type { ZodType, ZodTypeDef } from "zod";

// Parses + validates the JSON body against a Zod schema. Zod also rejects
// non-scalar values where scalars are expected, which neutralizes the classic
// Mongo operator-injection vector ({ "$gt": "" }) at the edge.
export async function validateBody<T>(
  req: NextRequest,
  schema: ZodType<T, ZodTypeDef, unknown>,
): Promise<T> {
  let raw: unknown = {};
  const text = await req.text();
  if (text) {
    raw = JSON.parse(text);
  }
  return schema.parse(raw);
}

export function validateQuery<T>(req: NextRequest, schema: ZodType<T, ZodTypeDef, unknown>): T {
  const obj = Object.fromEntries(new URL(req.url).searchParams.entries());
  return schema.parse(obj);
}
