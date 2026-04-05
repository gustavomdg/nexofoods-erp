import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

const statusMesaSchema = z.enum(["LIVRE", "OCUPADA", "RESERVADA", "MANUTENCAO"]);

export const mesasRouter = createTRPCRouter({
  listar: protectedProcedure
    .input(z.object({ status: statusMesaSchema.optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.status ? { status: input.status } : {};
      return ctx.db.mesa.findMany({
        where,
        orderBy: { numero: "asc" },
        include: {
          comandas: {
            where: { status: "ABERTA" },
            select: { id: true, numero: true, total: true, abertura: true },
          },
        },
      });
    }),

  criar: protectedProcedure
    .input(z.object({
      numero: z.number().int().positive(),
      capacidade: z.number().int().positive().default(4),
      area: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existe = await ctx.db.mesa.findFirst({ where: { numero: input.numero } });
      if (existe) throw new TRPCError({ code: "CONFLICT", message: `Mesa ${input.numero} já existe.` });
      return ctx.db.mesa.create({ data: { ...input, tenantId: ctx.tenantId } });
    }),

  atualizar: protectedProcedure
    .input(z.object({
      id: z.string(),
      numero: z.number().int().positive().optional(),
      capacidade: z.number().int().positive().optional(),
      area: z.string().optional(),
      status: statusMesaSchema.optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.db.mesa.update({ where: { id }, data });
    }),

  excluir: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comanda = await ctx.db.comanda.findFirst({ where: { mesaId: input.id, status: "ABERTA" } });
      if (comanda) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Mesa possui comanda aberta." });
      return ctx.db.mesa.delete({ where: { id: input.id } });
    }),

  abrirComanda: protectedProcedure
    .input(z.object({
      mesaId: z.string(),
      clienteId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const mesa = await ctx.db.mesa.findFirst({ where: { id: input.mesaId } });
      if (!mesa) throw new TRPCError({ code: "NOT_FOUND", message: "Mesa não encontrada." });
      if (mesa.status === "OCUPADA") throw new TRPCError({ code: "CONFLICT", message: "Mesa já está ocupada." });

      // Gera número sequencial para comanda
      const ultima = await ctx.db.comanda.findFirst({ orderBy: { numero: "desc" }, select: { numero: true } });
      const numero = (ultima?.numero ?? 0) + 1;

      const [comanda] = await Promise.all([
        ctx.db.comanda.create({
          data: { mesaId: input.mesaId, clienteId: input.clienteId, numero, status: "ABERTA", tenantId: ctx.tenantId },
        }),
        ctx.db.mesa.update({ where: { id: input.mesaId }, data: { status: "OCUPADA" } }),
      ]);
      return comanda;
    }),
});
