import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { prisma, createTenantClient } from "@gastrosys/db";
import type { TenantPrismaClient } from "@gastrosys/db";

// ============================================================
// Tipagem do Contexto tRPC
// ============================================================

export interface TRPCContext {
  /** ID do usuário autenticado (userId do Clerk) */
  userId: string | null;
  /** ID do tenant/organização ativa (orgId do Clerk) */
  tenantId: string | null;
  /** PrismaClient com isolamento de tenant pré-configurado */
  db: TenantPrismaClient | typeof prisma;
}

// ============================================================
// Inicialização do tRPC
// ============================================================

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Expõe erros de validação do Zod de forma estruturada
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

// ============================================================
// Exportações base do tRPC
// ============================================================

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;

// ============================================================
// Procedures base
// ============================================================

/**
 * Procedure pública — não requer autenticação.
 * Usada para endpoints como status, lookup público, etc.
 */
export const publicProcedure = t.procedure;

/**
 * Middleware de autenticação.
 * Garante que o usuário está logado E tem um tenant ativo (organização).
 */
const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.userId || !ctx.tenantId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Você precisa estar autenticado e ter uma empresa ativa.",
    });
  }

  return next({
    ctx: {
      userId: ctx.userId,
      tenantId: ctx.tenantId,
      // Fornece um PrismaClient já isolado para o tenant
      db: createTenantClient(ctx.tenantId),
    },
  });
});

/**
 * Procedure protegida — requer autenticação + tenant ativo.
 * USE ESTA para todos os endpoints de negócio.
 */
export const protectedProcedure = t.procedure.use(enforceAuth);
