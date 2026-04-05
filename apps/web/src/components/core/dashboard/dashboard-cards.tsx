"use client";

import { TrendingDown, TrendingUp, Wallet, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResumoFinanceiro {
  aPagar: number;
  aReceber: number;
  saldoPrevisto: number;
  pago: number;
  recebido: number;
  saldoRealizado: number;
}

function formatBRL(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

interface CardProps {
  titulo: string;
  valor: number;
  descricao: string;
  icone: React.ElementType;
  cor: "green" | "red" | "blue" | "amber";
  positivo?: boolean;
}

const corMap = {
  green: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    badge: "bg-emerald-500/20 text-emerald-400",
  },
  red: {
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    icon: "text-red-400",
    badge: "bg-red-500/20 text-red-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    icon: "text-blue-400",
    badge: "bg-blue-500/20 text-blue-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    badge: "bg-amber-500/20 text-amber-400",
  },
};

function SummaryCard({ titulo, valor, descricao, icone: Icon, cor }: CardProps) {
  const cores = corMap[cor];
  return (
    <div
      className={cn(
        "rounded-xl border p-5 flex flex-col gap-4",
        "bg-slate-800/50 backdrop-blur-sm",
        cores.border,
        "hover:bg-slate-800 transition-colors duration-200"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-400">{titulo}</span>
        <div className={cn("p-2 rounded-lg", cores.bg)}>
          <Icon className={cn("h-4 w-4", cores.icon)} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{formatBRL(valor)}</p>
        <p className="text-xs text-slate-500 mt-1">{descricao}</p>
      </div>
    </div>
  );
}

export function DashboardCards({ resumo }: { resumo: ResumoFinanceiro }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <SummaryCard
        titulo="A Receber (mês)"
        valor={resumo.aReceber}
        descricao="Contas a receber com vencimento este mês"
        icone={TrendingUp}
        cor="green"
      />
      <SummaryCard
        titulo="A Pagar (mês)"
        valor={resumo.aPagar}
        descricao="Contas a pagar com vencimento este mês"
        icone={TrendingDown}
        cor="red"
      />
      <SummaryCard
        titulo="Saldo Previsto"
        valor={resumo.saldoPrevisto}
        descricao="Recebimentos - Pagamentos do mês"
        icone={Wallet}
        cor={resumo.saldoPrevisto >= 0 ? "blue" : "red"}
      />
      <SummaryCard
        titulo="Recebido (mês)"
        valor={resumo.recebido}
        descricao="Total efetivamente recebido no período"
        icone={DollarSign}
        cor="green"
      />
      <SummaryCard
        titulo="Pago (mês)"
        valor={resumo.pago}
        descricao="Total efetivamente pago no período"
        icone={TrendingDown}
        cor="amber"
      />
      <SummaryCard
        titulo="Saldo Realizado"
        valor={resumo.saldoRealizado}
        descricao="Recebido - Pago (caixa efetivo)"
        icone={Wallet}
        cor={resumo.saldoRealizado >= 0 ? "blue" : "red"}
      />
    </div>
  );
}
