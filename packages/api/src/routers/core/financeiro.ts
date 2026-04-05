import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../../trpc";

const statusSchema = z.enum(["PENDENTE", "PAGO", "CANCELADO", "VENCIDO"]);

export const financeiroRouter = createTRPCRouter({
  // ── Contas a Pagar ─────────────────────────────────────────

  listarContasPagar: protectedProcedure
    .input(z.object({
      pagina: z.number().min(1).default(1),
      porPagina: z.number().min(1).max(100).default(20),
      status: statusSchema.optional(),
      dataInicio: z.date().optional(),
      dataFim: z.date().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { pagina, porPagina, status, dataInicio, dataFim } = input;
      const skip = (pagina - 1) * porPagina;

      const where = {
        ...(status && { status }),
        ...(dataInicio || dataFim
          ? { vencimento: { gte: dataInicio, lte: dataFim } }
          : {}),
      };

      const [contas, total] = await Promise.all([
        ctx.db.contaPagar.findMany({
          where, skip, take: porPagina,
          orderBy: { vencimento: "asc" },
          include: { fornecedor: { select: { nome: true } } },
        }),
        ctx.db.contaPagar.count({ where }),
      ]);

      return { contas, total, paginas: Math.ceil(total / porPagina) };
    }),

  criarContaPagar: protectedProcedure
    .input(z.object({
      fornecedorId: z.string().optional(),
      descricao: z.string().min(3),
      valor: z.number().positive(),
      vencimento: z.date(),
      categoria: z.string().optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.contaPagar.create({ data: { ...input, tenantId: ctx.tenantId } })),

  pagarConta: protectedProcedure
    .input(z.object({
      id: z.string(),
      dataPagamento: z.date().default(() => new Date()),
    }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.contaPagar.update({
        where: { id: input.id },
        data: { status: "PAGO", pagamento: input.dataPagamento },
      })
    ),

  // ── Contas a Receber ────────────────────────────────────────

  listarContasReceber: protectedProcedure
    .input(z.object({
      pagina: z.number().min(1).default(1),
      porPagina: z.number().min(1).max(100).default(20),
      status: statusSchema.optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { pagina, porPagina, status } = input;
      const skip = (pagina - 1) * porPagina;

      const where = status ? { status } : {};
      const [contas, total] = await Promise.all([
        ctx.db.contaReceber.findMany({
          where, skip, take: porPagina,
          orderBy: { vencimento: "asc" },
          include: { cliente: { select: { nome: true } } },
        }),
        ctx.db.contaReceber.count({ where }),
      ]);

      return { contas, total, paginas: Math.ceil(total / porPagina) };
    }),

  criarContaReceber: protectedProcedure
    .input(z.object({
      clienteId: z.string().optional(),
      descricao: z.string().min(3),
      valor: z.number().positive(),
      vencimento: z.date(),
      categoria: z.string().optional(),
      observacao: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => ctx.db.contaReceber.create({ data: { ...input, tenantId: ctx.tenantId } })),

  receberConta: protectedProcedure
    .input(z.object({
      id: z.string(),
      dataRecebimento: z.date().default(() => new Date()),
    }))
    .mutation(async ({ ctx, input }) =>
      ctx.db.contaReceber.update({
        where: { id: input.id },
        data: { status: "PAGO", recebimento: input.dataRecebimento },
      })
    ),

  // ── Resumo / Fluxo de Caixa ─────────────────────────────────

  /**
   * Retorna um resumo financeiro do período para o Dashboard.
   * Calcula: total a pagar, total a receber, saldo previsto.
   */
  resumo: protectedProcedure
    .input(z.object({
      dataInicio: z.date(),
      dataFim: z.date(),
    }))
    .query(async ({ ctx, input }) => {
      const { dataInicio, dataFim } = input;
      const periodo = { gte: dataInicio, lte: dataFim };

      const [totalPagar, totalReceber, totalPago, totalRecebido] = await Promise.all([
        ctx.db.contaPagar.aggregate({
          where: { status: "PENDENTE", vencimento: periodo },
          _sum: { valor: true },
        }),
        ctx.db.contaReceber.aggregate({
          where: { status: "PENDENTE", vencimento: periodo },
          _sum: { valor: true },
        }),
        ctx.db.contaPagar.aggregate({
          where: { status: "PAGO", pagamento: periodo },
          _sum: { valor: true },
        }),
        ctx.db.contaReceber.aggregate({
          where: { status: "PAGO", recebimento: periodo },
          _sum: { valor: true },
        }),
      ]);

      const aPagar = Number(totalPagar._sum.valor ?? 0);
      const aReceber = Number(totalReceber._sum.valor ?? 0);
      const pago = Number(totalPago._sum.valor ?? 0);
      const recebido = Number(totalRecebido._sum.valor ?? 0);

      return {
        aPagar,
        aReceber,
        saldoPrevisto: aReceber - aPagar,
        pago,
        recebido,
        saldoRealizado: recebido - pago,
      };
    }),
});
