"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { BarChart3, TrendingUp, TrendingDown, Wallet, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function getMesAno(date: Date) {
  return {
    mes: date.toLocaleString("pt-BR", { month: "long", year: "numeric" }),
    inicioMes: new Date(date.getFullYear(), date.getMonth(), 1),
    fimMes: new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59),
  };
}

interface CardResumoProps {
  titulo: string;
  valor: number;
  descricao: string;
  icone: React.ElementType;
  cor: "green" | "red" | "blue" | "amber";
}

const corMap = {
  green: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", icon: "text-emerald-400", text: "text-emerald-400" },
  red: { bg: "bg-red-500/10", border: "border-red-500/20", icon: "text-red-400", text: "text-red-400" },
  blue: { bg: "bg-blue-500/10", border: "border-blue-500/20", icon: "text-blue-400", text: "text-blue-400" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", icon: "text-amber-400", text: "text-amber-400" },
};

function CardResumo({ titulo, valor, descricao, icone: Icon, cor }: CardResumoProps) {
  const c = corMap[cor];
  return (
    <div className={cn("rounded-xl border p-5 bg-slate-800/50", c.border)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-slate-400">{titulo}</span>
        <div className={cn("p-2 rounded-lg", c.bg)}>
          <Icon className={cn("h-4 w-4", c.icon)} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{formatBRL(valor)}</p>
      <p className="text-xs text-slate-500 mt-1">{descricao}</p>
    </div>
  );
}

export function FluxoCaixaView() {
  const [refDate, setRefDate] = useState(new Date());
  const { mes, inicioMes, fimMes } = getMesAno(refDate);

  const { data, isLoading } = api.financeiro.resumo.useQuery({
    dataInicio: inicioMes,
    dataFim: fimMes,
  });

  // Dados para o gráfico de barras (previsto vs realizado)
  const chartData = data
    ? [
        { name: "A Receber", previsto: data.aReceber, realizado: data.recebido, fill: "#10b981" },
        { name: "A Pagar", previsto: data.aPagar, realizado: data.pago, fill: "#ef4444" },
      ]
    : [];

  function navMes(delta: number) {
    setRefDate((d) => {
      const novo = new Date(d);
      novo.setMonth(novo.getMonth() + delta);
      return novo;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-orange-400" /> Fluxo de Caixa
          </h1>
          <p className="text-slate-400 text-sm mt-1">Visão financeira do período</p>
        </div>

        {/* Navegação de mês */}
        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
          <button onClick={() => navMes(-1)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium text-white capitalize min-w-[140px] text-center">{mes}</span>
          <button onClick={() => navMes(1)} className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/50 border border-slate-700/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : data ? (
        <>
          {/* Cards de resumo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <CardResumo titulo="A Receber" valor={data.aReceber} descricao="Pendente de recebimento no mês" icone={TrendingUp} cor="green" />
            <CardResumo titulo="A Pagar" valor={data.aPagar} descricao="Pendente de pagamento no mês" icone={TrendingDown} cor="red" />
            <CardResumo
              titulo="Saldo Previsto"
              valor={data.saldoPrevisto}
              descricao="A Receber menos A Pagar"
              icone={Wallet}
              cor={data.saldoPrevisto >= 0 ? "blue" : "red"}
            />
            <CardResumo titulo="Recebido" valor={data.recebido} descricao="Efetivamente recebido no período" icone={DollarSign} cor="green" />
            <CardResumo titulo="Pago" valor={data.pago} descricao="Efetivamente pago no período" icone={TrendingDown} cor="amber" />
            <CardResumo
              titulo="Saldo Realizado"
              valor={data.saldoRealizado}
              descricao="Recebido menos Pago (caixa efetivo)"
              icone={Wallet}
              cor={data.saldoRealizado >= 0 ? "blue" : "red"}
            />
          </div>

          {/* Gráfico */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-6">Previsto vs Realizado</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} barCategoryGap="40%">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 13 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `R$ ${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: "8px", color: "#fff" }}
                  formatter={(value: number) => formatBRL(value)}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
                <Bar dataKey="previsto" name="Previsto" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="realizado" name="Realizado" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Indicadores de saúde financeira */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Eficiência de Cobrança</h3>
              {data.aReceber + data.recebido > 0 ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Recebido / Total a Receber</span>
                    <span className="text-white font-medium">
                      {Math.round((data.recebido / (data.recebido + data.aReceber)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((data.recebido / (data.recebido + data.aReceber)) * 100))}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-slate-600 text-sm">Sem dados no período.</p>
              )}
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
              <h3 className="text-sm font-medium text-slate-400 mb-3">Eficiência de Pagamento</h3>
              {data.aPagar + data.pago > 0 ? (
                <>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Pago / Total a Pagar</span>
                    <span className="text-white font-medium">
                      {Math.round((data.pago / (data.pago + data.aPagar)) * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.round((data.pago / (data.pago + data.aPagar)) * 100))}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="text-slate-600 text-sm">Sem dados no período.</p>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
