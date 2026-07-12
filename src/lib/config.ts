import { z } from "zod";

// Validate environment once, at module load. Fail fast with a clear message
// rather than crashing deep in a request with `undefined` secrets.
const EnvSchema = z.object({
  DATABASE_URL: z.string().min(1).default("mongodb://localhost:27017/assetflow?replicaSet=rs0&directConnection=true"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be >= 16 chars"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be >= 16 chars"),
  ACCESS_TOKEN_TTL: z.string().default("15m"),
  REFRESH_TOKEN_TTL: z.string().default("7d"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  CRON_SECRET: z.string().default("dev-cron-secret"),
});

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("Invalid environment configuration:", parsed.error.flatten().fieldErrors);
  throw new Error("Invalid environment configuration");
}

export const config = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  bcryptRounds: 12,
  // Aggressive limit on auth endpoints to blunt credential stuffing.
  authRateLimit: { windowMs: 60_000, max: 5 },
  apiRateLimit: { windowMs: 60_000, max: 120 },
  reportCacheTtlMs: 45_000,
};
