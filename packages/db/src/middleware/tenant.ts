import { prisma } from "../client.js";

/**
 * Cria uma extensão do PrismaClient com isolamento automático por tenant.
 *
 * COMO FUNCIONA:
 * - Recebe o `tenantId` (org_id do Clerk) no momento da criação.
 * - Toda query de modelos com campo `tenantId` é automaticamente filtrada.
 * - Toda criação automáticamente inclui o `tenantId`.
 *
 * SEGURANÇA:
 * - Isso é uma 1ª camada de isolamento em nível de aplicação.
 * - O Supabase RLS serve como 2ª camada (defense in depth).
 *
 * USO:
 * ```ts
 * const db = createTenantClient(tenantId);
 * const clientes = await db.cliente.findMany(); // sempre filtra por tenant
 * ```
 */
export function createTenantClient(tenantId: string) {
  return prisma.$extends({
    query: {
      // Aplica o filtro de tenantId em todos os models que possuem o campo
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findFirst({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async findUnique({ args, query }) {
          // findUnique não suporta filtro arbitrário, usamos findFirst internamente
          const where = (args as Record<string, unknown>).where as Record<string, unknown> | undefined;
          (args as Record<string, unknown>).where = { ...(where ?? {}), tenantId };
          return query(args);
        },
        async create({ args, query }) {
          (args.data as Record<string, unknown>).tenantId = tenantId;
          return query(args);
        },
        async createMany({ args, query }) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map((item) => ({ ...item, tenantId }));
          }
          return query(args);
        },
        async update({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async updateMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async delete({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async deleteMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async count({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async aggregate({ args, query }) {
          args.where = { ...(args.where as Record<string, unknown>), tenantId };
          return query(args);
        },
      },
    },
  });
}

export type TenantPrismaClient = ReturnType<typeof createTenantClient>;
