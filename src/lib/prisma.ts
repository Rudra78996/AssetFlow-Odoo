import { PrismaClient } from "@prisma/client";

// Hot-reload-safe singleton: Next.js dev re-imports modules on every change,
// which would otherwise spawn a new PrismaClient (and a new connection pool)
// per reload and exhaust Mongo connections.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
