import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";
import { TRPCError } from "@trpc/server";

export const comandasRouter = createTRPCRouter({
  buscarPorId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const comanda = await ctx.db.comanda.findFirst({
        where: { id: input.id },
        include: {
          mesa: { select: { numero: true, area: true } },
          cliente: { select: { nome: true } },
          itens: {
            include: { produto: { select: { nome: true, unidade: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
      });
      if (!comanda) throw new TRPCError({ code: "NOT_FOUND", message: "Comanda não encontrada." });
      return comanda;
    }),

  listar: protectedProcedure
    .input(z.object({ status: z.enum(["ABERTA", "FECHADA", "CANCELADA"]).optional() }).optional())
    .query(async ({ ctx, input }) => {
      const where = input?.status ? { status: input.status } : {};
      return ctx.db.comanda.findMany({
        where,
        orderBy: { abertura: "desc" },
        include: {
          mesa: { select: { numero: true, area: true } },
          cliente: { select: { nome: true } },
          itens: { select: { id: true, status: true, quantidade: true, precoUnit: true } },
        },
      });
    }),

  adicionarItem: protectedProcedure
    .input(z.object({
      comandaId: z.string(),
      produtoId: z.string(),
      quantidade: z.number().positive(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const produto = await ctx.db.produto.findFirst({ where: { id: input.produtoId } });
      if (!produto) throw new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado." });

      const precoUnit = Number(produto.preco);
      const subtotal = precoUnit * input.quantidade;

      const item = await ctx.db.itemPedido.create({
        data: {
          comandaId: input.comandaId,
          produtoId: input.produtoId,
          quantidade: input.quantidade,
          precoUnit,
          subtotal,
          observacao: input.observacao,
          status: "PENDENTE",
        },
      });

      // Atualiza total da comanda
      await recalcularTotal(ctx.db, input.comandaId);
      return item;
    }),

  removerItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.db.itemPedido.findFirst({ where: { id: input.itemId } });
      if (!item) throw new TRPCError({ code: "NOT_FOUND", message: "Item não encontrado." });
      await ctx.db.itemPedido.delete({ where: { id: input.itemId } });
      await recalcularTotal(ctx.db, item.comandaId);
      return { ok: true };
    }),

  atualizarStatusItem: protectedProcedure
    .input(z.object({
      itemId: z.string(),
      status: z.enum(["PENDENTE", "CONFIRMADO", "PREPARANDO", "PRONTO", "SERVIDO", "CANCELADO"]),
    }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.itemPedido.update({
        where: { id: input.itemId },
        data: { status: input.status },
      })
    ),

  fechar: protectedProcedure
    .input(z.object({
      id: z.string(),
      desconto: z.number().min(0).default(0),
    }))
    .mutation(async ({ ctx, input }) => {
      const comanda = await ctx.db.comanda.findFirst({
        where: { id: input.id },
        include: { itens: true },
      });
      if (!comanda) throw new TRPCError({ code: "NOT_FOUND", message: "Comanda não encontrada." });
      if (comanda.status !== "ABERTA") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Comanda não está aberta." });

      const totalItens = comanda.itens.reduce((acc, i) => acc + Number(i.subtotal), 0);
      const totalFinal = Math.max(0, totalItens - input.desconto);

      const [updatedComanda] = await Promise.all([
        ctx.db.comanda.update({
          where: { id: input.id },
          data: { status: "FECHADA", fechamento: new Date(), desconto: input.desconto, total: totalFinal },
        }),
        comanda.mesaId
          ? ctx.db.mesa.update({ where: { id: comanda.mesaId }, data: { status: "LIVRE" } })
          : Promise.resolve(),
      ]);
      return updatedComanda;
    }),

  cancelar: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const comanda = await ctx.db.comanda.findFirst({ where: { id: input.id } });
      if (!comanda) throw new TRPCError({ code: "NOT_FOUND", message: "Comanda não encontrada." });

      const [updatedComanda] = await Promise.all([
        ctx.db.comanda.update({
          where: { id: input.id },
          data: { status: "CANCELADA", fechamento: new Date() },
        }),
        comanda.mesaId
          ? ctx.db.mesa.update({ where: { id: comanda.mesaId }, data: { status: "LIVRE" } })
          : Promise.resolve(),
      ]);
      return updatedComanda;
    }),

  // KDS: itens pendentes/em preparo para a cozinha
  itensCozinha: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.itemPedido.findMany({
      where: { status: { in: ["PENDENTE", "CONFIRMADO", "PREPARANDO"] } },
      include: {
        produto: { select: { nome: true } },
        comanda: {
          select: {
            numero: true,
            mesa: { select: { numero: true, area: true } },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  }),
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function recalcularTotal(db: any, comandaId: string) {
  const itens = await db.itemPedido.findMany({
    where: { comandaId, status: { not: "CANCELADO" } },
  });
  const total = (itens as Array<{ subtotal: unknown }>).reduce((acc, i) => acc + Number(i.subtotal), 0);
  await db.comanda.update({ where: { id: comandaId }, data: { total } });
}
