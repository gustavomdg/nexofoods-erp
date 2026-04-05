import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc.js";
import { TRPCError } from "@trpc/server";

export const clientesRouter = createTRPCRouter({
  /** Lista todos os clientes do tenant com paginação */
  listar: protectedProcedure
    .input(
      z.object({
        pagina: z.number().min(1).default(1),
        porPagina: z.number().min(1).max(100).default(20),
        busca: z.string().optional(),
        ativo: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { pagina, porPagina, busca, ativo } = input;
      const skip = (pagina - 1) * porPagina;

      const where = {
        ...(ativo !== undefined && { ativo }),
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: "insensitive" as const } },
            { email: { contains: busca, mode: "insensitive" as const } },
            { cpfCnpj: { contains: busca } },
          ],
        }),
      };

      const [clientes, total] = await Promise.all([
        ctx.db.cliente.findMany({
          where,
          skip,
          take: porPagina,
          orderBy: { nome: "asc" },
        }),
        ctx.db.cliente.count({ where }),
      ]);

      return {
        clientes,
        total,
        paginas: Math.ceil(total / porPagina),
        paginaAtual: pagina,
      };
    }),

  /** Busca cliente por ID (com validação de tenant automática via middleware) */
  buscarPorId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const cliente = await ctx.db.cliente.findFirst({
        where: { id: input.id },
      });

      if (!cliente) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Cliente não encontrado." });
      }

      return cliente;
    }),

  /** Cria novo cliente */
  criar: protectedProcedure
    .input(
      z.object({
        nome: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
        cpfCnpj: z.string().optional(),
        email: z.string().email("E-mail inválido").optional().or(z.literal("")),
        telefone: z.string().optional(),
        tipo: z.enum(["FISICA", "JURIDICA"]).default("FISICA"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cliente.create({ data: { ...input, tenantId: ctx.tenantId } });
    }),

  /** Atualiza cliente existente */
  atualizar: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        nome: z.string().min(2).optional(),
        cpfCnpj: z.string().optional(),
        email: z.string().email().optional().or(z.literal("")),
        telefone: z.string().optional(),
        tipo: z.enum(["FISICA", "JURIDICA"]).optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.cliente.update({ where: { id }, data });
    }),

  /** Desativa (soft-delete) um cliente */
  desativar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.cliente.update({
        where: { id: input.id },
        data: { ativo: false },
      });
    }),
});
