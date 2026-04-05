import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const fornecedoresRouter = createTRPCRouter({
  listar: protectedProcedure
    .input(
      z.object({
        pagina: z.number().min(1).default(1),
        porPagina: z.number().min(1).max(100).default(20),
        busca: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { pagina, porPagina, busca } = input;
      const skip = (pagina - 1) * porPagina;

      const where = busca
        ? {
            OR: [
              { nome: { contains: busca, mode: "insensitive" as const } },
              { cnpj: { contains: busca } },
            ],
          }
        : {};

      const [fornecedores, total] = await Promise.all([
        ctx.db.fornecedor.findMany({ where, skip, take: porPagina, orderBy: { nome: "asc" } }),
        ctx.db.fornecedor.count({ where }),
      ]);

      return { fornecedores, total, paginas: Math.ceil(total / porPagina) };
    }),

  buscarPorId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const fornecedor = await ctx.db.fornecedor.findFirst({ where: { id: input.id } });
      if (!fornecedor) throw new TRPCError({ code: "NOT_FOUND", message: "Fornecedor não encontrado." });
      return fornecedor;
    }),

  criar: protectedProcedure
    .input(z.object({
      nome: z.string().min(2),
      cnpj: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      telefone: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.fornecedor.create({ data: { ...input, tenantId: ctx.tenantId } })),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.string(),
      nome: z.string().min(2).optional(),
      cnpj: z.string().optional(),
      email: z.string().email().optional().or(z.literal("")),
      telefone: z.string().optional(),
      ativo: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.fornecedor.update({ where: { id }, data });
    }),
});
