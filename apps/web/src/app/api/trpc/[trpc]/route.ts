import { auth } from "@clerk/nextjs/server";
import { createTenantClient, prisma } from "@gastrosys/db";
import { appRouter } from "@gastrosys/api";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

/**
 * Handler tRPC para o App Router do Next.js.
 * Todas as chamadas tRPC passam por aqui: /api/trpc/[procedimento]
 */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      // Extrai userId e orgId (tenantId) da sessão do Clerk
      const { userId, orgId } = await auth();

      return {
        userId,
        tenantId: orgId ?? null,
        // O db é recriado por request para garantir o isolamento correto
        db: orgId ? createTenantClient(orgId) : prisma,
      };
    },
    onError({ path, error }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`❌ tRPC error em ${path}:`, error);
      }
    },
  });

export { handler as GET, handler as POST };
