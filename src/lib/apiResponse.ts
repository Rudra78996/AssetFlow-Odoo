import { NextResponse } from "next/server";

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuccessBody<T> {
  success: true;
  data: T;
  meta?: PageMeta;
}

export interface ErrorBody {
  success: false;
  error: { code: string; message: string; details?: unknown };
}

// Every endpoint returns through these helpers — no ad-hoc NextResponse.json.
export function ok<T>(data: T, init?: { status?: number; meta?: PageMeta }): NextResponse {
  const body: SuccessBody<T> = { success: true, data };
  if (init?.meta) body.meta = init.meta;
  return NextResponse.json(body, { status: init?.status ?? 200 });
}

export function created<T>(data: T): NextResponse {
  return ok(data, { status: 201 });
}

export function fail(
  code: string,
  message: string,
  status: number,
  details?: unknown,
): NextResponse {
  const body: ErrorBody = { success: false, error: { code, message, details } };
  return NextResponse.json(body, { status });
}
