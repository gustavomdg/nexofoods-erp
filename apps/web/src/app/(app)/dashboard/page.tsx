import type { Metadata } from "next";
import { Suspense } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { createServerCaller } from "@/lib/trpc/server";
import { DashboardCards } from "@/components/core/dashboard/dashboard-cards";
import { DashboardSkeleton } from "@/components/core/dashboard/dashboard-skeleton";
import { AlertCircle, TrendingDown, TrendingUp, CalendarClock } from "lucide-react";

export const metadata: Metadata = { title: "Dashboard" };

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
}

export default async function DashboardPage() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "gestor";
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      {/* Cabeçalho com saudação personalizada */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Aqui está o resumo financeiro do seu negócio este mês.
        </p>
      </div>

      {/* Cards de resumo financeiro */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardCardsServer />
      </Suspense>

      {/* Widget de vencimentos próximos */}
      <Suspense fallback={<VencimentosSkeleton />}>
        <VencimentosWidget />
      </Suspense>
    </div>
  );
}

async function DashboardCardsServer() {
  const trpc = await createServerCaller();

  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 0, 23, 59, 59);

  try {
    const resumo = await trpc.financeiro.resumo({
      dataInicio: inicioMes,
      dataFim: fimMes,
    });

    return <DashboardCards resumo={resumo} />;
  } catch {
    return (
      <DashboardCards
        resumo={{
          aPagar: 0, aReceber: 0, saldoPrevisto: 0,
          pago: 0, recebido: 0, saldoRealizado: 0,
        }}
      />
    );
  }
}

async function VencimentosWidget() {
  const trpc = await createServerCaller();

  const hoje = new Date();
  const em7Dias = new Date();
  em7Dias.setDate(em7Dias.getDate() + 7);

  try {
    const contasPagar = await trpc.financeiro.listarContasPagar({
      pagina: 1,
      porPagina: 50,
      status: "PENDENTE",
    });

    type Conta = { vencimento: Date | string; valor: unknown };

    const vencendoHoje = (contasPagar.contas as Conta[]).filter((c) => {
      const venc = new Date(c.vencimento);
      return venc.toDateString() === hoje.toDateString();
    });

    const vencendoEm7 = (contasPagar.contas as Conta[]).filter((c) => {
      const venc = new Date(c.vencimento);
      return venc > hoje && venc <= em7Dias;
    });

    const vencidas = (contasPagar.contas as Conta[]).filter((c) => {
      const venc = new Date(c.vencimento);
      return venc < hoje;
    });

    if (vencendoHoje.length === 0 && vencendoEm7.length === 0 && vencidas.length === 0) {
      return null;
    }

    return (
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Alertas Financeiros
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {vencidas.length > 0 && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-300">
                  {vencidas.length} conta{vencidas.length > 1 ? "s" : ""} vencida{vencidas.length > 1 ? "s" : ""}
                </p>
                <p className="text-xs text-red-400 mt-0.5">
                  Total: {formatBRL(vencidas.reduce((a, c) => a + Number(c.valor), 0))}
                </p>
              </div>
            </div>
          )}

          {vencendoHoje.length > 0 && (
            <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3">
              <CalendarClock className="h-5 w-5 text-orange-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-orange-300">
                  {vencendoHoje.length} vence{vencendoHoje.length > 1 ? "m" : ""} hoje
                </p>
                <p className="text-xs text-orange-400 mt-0.5">
                  Total: {formatBRL(vencendoHoje.reduce((a, c) => a + Number(c.valor), 0))}
                </p>
              </div>
            </div>
          )}

          {vencendoEm7.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
              <TrendingDown className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  {vencendoEm7.length} vence{vencendoEm7.length > 1 ? "m" : ""} em 7 dias
                </p>
                <p className="text-xs text-amber-400 mt-0.5">
                  Total: {formatBRL(vencendoEm7.reduce((a, c) => a + Number(c.valor), 0))}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch {
    return null;
  }
}

function VencimentosSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-4 w-32 bg-slate-700 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-slate-800 border border-slate-700/50 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}
