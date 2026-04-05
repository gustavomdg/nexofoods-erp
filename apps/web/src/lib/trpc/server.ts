import { createCallerFactory } from "@gastrosys/api";
import { appRouter } from "@gastrosys/api";
import { auth } from "@clerk/nextjs/server";
import { createTenantClient, prisma } from "@gastrosys/db";

/**
 * Caller do tRPC para uso em Server Components e Server Actions.
 * Permite chamar procedures diretamente, sem HTTP.
 *
 * USO em Server Component:
 * ```tsx
 * import { trpc } from "@/lib/trpc/server";
 * const clientes = await trpc.clientes.listar({ pagina: 1 });
 * ```
 */
export async function createServerCaller() {
  const { userId, orgId } = await auth();

  const createCaller = createCallerFactory(appRouter);
  return createCaller({
    userId,
    tenantId: orgId ?? null,
    db: orgId ? createTenantClient(orgId) : prisma,
  });
}
