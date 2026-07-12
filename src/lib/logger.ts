import pino from "pino";
import { config } from "./config";

// One base logger. Request handlers derive a child with the request-id so every
// log line for a request is correlated (see middleware/errorHandler.ts).
export const logger = pino({
  level: config.LOG_LEVEL,
  base: undefined,
  redact: {
    // Never leak secrets/tokens even if an object containing them is logged.
    paths: [
      "password",
      "passwordHash",
      "refreshTokenHash",
      "*.password",
      "req.headers.cookie",
      "req.headers.authorization",
    ],
    censor: "[redacted]",
  },
  transport: config.isProd
    ? undefined
    : { target: "pino-pretty", options: { colorize: true, translateTime: "SYS:HH:MM:ss" } },
});

export function childLogger(requestId: string) {
  return logger.child({ requestId });
}
