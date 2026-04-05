import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc.js";
import { TRPCError } from "@trpc/server";

export const produtosRouter = createTRPCRouter({
  listar: protectedProcedure
    .input(z.object({
      pagina: z.number().min(1).default(1),
      porPagina: z.number().min(1).max(100).default(20),
      busca: z.string().optional(),
      categoria: z.string().optional(),
      ativo: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { pagina, porPagina, busca, categoria, ativo } = input;
      const skip = (pagina - 1) * porPagina;

      const where = {
        ...(ativo !== undefined && { ativo }),
        ...(categoria && { categoria }),
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { codigoBarras: { contains: busca } },
          ],
        }),
      };

      const [produtos, total] = await Promise.all([
        ctx.db.produto.findMany({
          where, skip, take: porPagina, orderBy: { nome: "asc" },
          include: { fichaTecnica: { include: { ingrediente: true } } },
        }),
        ctx.db.produto.count({ where }),
      ]);

      return { produtos, total, paginas: Math.ceil(total / porPagina) };
    }),

  buscarPorId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const produto = await ctx.db.produto.findFirst({
        where: { id: input.id },
        include: {
          fichaTecnica: { include: { ingrediente: true } },
        },
      });
      if (!produto) throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado." });
      return produto;
    }),

  criar: protectedProcedure
    .input(z.object({
      nome: z.string().min(2),
      descricao: z.string().optional(),
      preco: z.number().min(0),
      custo: z.number().min(0).optional(),
      unidade: z.string().default("UN"),
      categoria: z.string().optional(),
      codigoBarras: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.produto.create({ data: { ...input, tenantId: ctx.tenantId } });
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.string(),
      nome: z.string().min(2).optional(),
      descricao: z.string().optional(),
      preco: z.number().min(0).optional(),
      custo: z.number().min(0).optional(),
      unidade: z.string().optional(),
      categoria: z.string().optional(),
      codigoBarras: z.string().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.produto.update({ where: { id }, data });
    }),

  /** Lista categorias únicas do tenant (para filtros/dropdowns) */
  listarCategorias: protectedProcedure
    .query(async ({ ctx }) => {
      const result = await ctx.db.produto.findMany({
        where: { categoria: { not: null } },
        select: { categoria: true },
        distinct: ["categoria"],
        orderBy: { categoria: "asc" },
      });
      return result.map((r) => r.categoria).filter(Boolean) as string[];
    }),
});
