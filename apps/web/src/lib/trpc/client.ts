import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@gastrosys/api";

/**
 * Client tRPC tipado para uso em Client Components.
 * 
 * USO:
 * ```tsx
 * import { api } from "@/lib/trpc/client";
 * 
 * const { data } = api.clientes.listar.useQuery({ pagina: 1 });
 * ```
 */
export const api = createTRPCReact<AppRouter>();
