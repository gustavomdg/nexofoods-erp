import { createTRPCRouter } from "./trpc.js";
import { clientesRouter } from "./routers/core/clientes.js";
import { fornecedoresRouter } from "./routers/core/fornecedores.js";
import { produtosRouter } from "./routers/core/produtos.js";
import { financeiroRouter } from "./routers/core/financeiro.js";
import { mesasRouter } from "./routers/restaurante/mesas.js";
import { comandasRouter } from "./routers/restaurante/comandas.js";

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
