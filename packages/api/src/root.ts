import { createTRPCRouter } from "./trpc";
import { clientesRouter } from "./routers/core/clientes";
import { fornecedoresRouter } from "./routers/core/fornecedores";
import { produtosRouter } from "./routers/core/produtos";
import { financeiroRouter } from "./routers/core/financeiro";
import { mesasRouter } from "./routers/restaurante/mesas";
import { comandasRouter } from "./routers/restaurante/comandas";

/**
 * Router raiz — agrega todos os sub-routers.
 * O cliente tRPC no front-end acessa via: api.clientes.listar.useQuery(...)
 */
export const appRouter = createTRPCRouter({
  clientes: clientesRouter,
  fornecedores: fornecedoresRouter,
  produtos: produtosRouter,
  financeiro: financeiroRouter,
  mesas: mesasRouter,
  comandas: comandasRouter,
});

export type AppRouter = typeof appRouter;
