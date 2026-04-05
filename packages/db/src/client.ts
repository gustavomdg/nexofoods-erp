import { PrismaClient } from "@prisma/client";

// ============================================================
// Singleton do PrismaClient
// Em Next.js (dev), o hot-reload recria módulos constantemente.
// Armazenamos a instância no globalThis para evitar múltiplas conexões.
// ============================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
