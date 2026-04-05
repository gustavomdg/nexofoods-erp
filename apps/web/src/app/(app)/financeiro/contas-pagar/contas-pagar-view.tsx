"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { TrendingDown, Plus, CheckCircle, MoreHorizontal, Calendar, FileX } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString("pt-BR");
}

type Status = "PENDENTE" | "PAGO" | "CANCELADO" | "VENCIDO";

const statusLabels: Record<Status, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  CANCELADO: "Cancelado",
  VENCIDO: "Vencido",
};

const statusColors: Record<Status, string> = {
  PENDENTE: "bg-amber-500/20 text-amber-400",
  PAGO: "bg-emerald-500/20 text-emerald-400",
  CANCELADO: "bg-slate-600/50 text-slate-500",
  VENCIDO: "bg-red-500/20 text-red-400",
};

interface ContaFormData {
  descricao: string;
  valor: string;
  vencimento: string;
  categoria: string;
  observacao: string;
}

const emptyForm: ContaFormData = {
  descricao: "", valor: "", vencimento: "", categoria: "", observacao: "",
};

export function ContasPagarView() {
  const [pagina, setPagina] = useState(1);
  const [statusFiltro, setStatusFiltro] = useState<Status | "">("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<ContaFormData>(emptyForm);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  const { data, isLoading, refetch } = api.financeiro.listarContasPagar.useQuery({
    pagina, porPagina: 20,
    status: statusFiltro || undefined,
  });

  const criar = api.financeiro.criarContaPagar.useMutation({
    onSuccess: () => { toast.success("Conta criada!"); setModal(false); setForm(emptyForm); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const pagar = api.financeiro.pagarConta.useMutation({
    onSuccess: () => { toast.success("Conta marcada como paga!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  function salvar() {
    if (!form.descricao.trim()) return toast.error("Descrição obrigatória.");
    const valor = parseFloat(form.valor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) return toast.error("Valor inválido.");
    if (!form.vencimento) return toast.error("Vencimento obrigatório.");

    criar.mutate({
      descricao: form.descricao,
      valor,
      vencimento: new Date(form.vencimento + "T00:00:00"),
      categoria: form.categoria || undefined,
      observacao: form.observacao || undefined,
    });
  }

  const totalPendente = data?.contas
    .filter((c) => c.status === "PENDENTE")
    .reduce((acc, c) => acc + Number(c.valor), 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-400" /> Contas a Pagar
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie seus compromissos financeiros</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4" /> Nova Conta
        </button>
      </div>

      {/* Resumo */}
      {totalPendente > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-red-300">Total pendente (filtro atual)</span>
          <span className="text-xl font-bold text-red-400">{formatBRL(totalPendente)}</span>
        </div>
      )}

      {/* Filtro de status */}
      <div className="flex gap-2 flex-wrap">
        {(["", "PENDENTE", "PAGO", "VENCIDO", "CANCELADO"] as const).map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFiltro(s); setPagina(1); }}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              statusFiltro === s
                ? "bg-orange-500 text-white"
                : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
            )}
          >
            {s === "" ? "Todos" : statusLabels[s]}
          </button>
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Descrição</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Fornecedor</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Categoria</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Vencimento</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Valor</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-700/30">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.contas.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <FileX className="h-7 w-7 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">Nenhuma conta encontrada</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {statusFiltro ? `Sem contas com status "${statusLabels[statusFiltro]}"` : "Cadastre sua primeira conta a pagar"}
                        </p>
                      </div>
                      {!statusFiltro && (
                        <button
                          onClick={() => { setForm(emptyForm); setModal(true); }}
                          className="mt-1 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4" /> Nova Conta
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data?.contas.map((c) => {
                  const vencido = c.status === "PENDENTE" && new Date(c.vencimento) < new Date();
                  return (
                    <tr key={c.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 font-medium text-white">{c.descricao}</td>
                      <td className="px-4 py-3 text-slate-400">{(c.fornecedor as { nome: string } | null)?.nome ?? "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{c.categoria ?? "—"}</td>
                      <td className={cn("px-4 py-3 flex items-center gap-1", vencido ? "text-red-400" : "text-slate-400")}>
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(c.vencimento)}
                        {vencido && <span className="text-xs font-medium text-red-400 ml-1">vencida</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">{formatBRL(Number(c.valor))}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusColors[c.status as Status])}>
                          {statusLabels[c.status as Status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 relative">
                        {c.status === "PENDENTE" && (
                          <button
                            onClick={() => setMenuAberto(menuAberto === c.id ? null : c.id)}
                            className="p-1 rounded hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        )}
                        {menuAberto === c.id && (
                          <div className="absolute right-4 top-8 z-20 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                            <button
                              onClick={() => { pagar.mutate({ id: c.id }); setMenuAberto(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-slate-700 transition-colors flex items-center gap-2"
                            >
                              <CheckCircle className="h-3.5 w-3.5" /> Marcar como Pago
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {data && data.paginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-sm text-slate-500">
              Exibindo {(pagina - 1) * 20 + 1}–{Math.min(pagina * 20, data.total)} de {data.total} contas
            </span>
            <div className="flex gap-2">
              <button disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)} className="px-3 py-1 text-sm bg-slate-700 rounded disabled:opacity-40 hover:bg-slate-600 transition-colors text-white">Anterior</button>
              <span className="px-3 py-1 text-sm text-slate-400">{pagina} / {data.paginas}</span>
              <button disabled={pagina >= data.paginas} onClick={() => setPagina((p) => p + 1)} className="px-3 py-1 text-sm bg-slate-700 rounded disabled:opacity-40 hover:bg-slate-600 transition-colors text-white">Próxima</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-contas-titulo" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(false)} />
          <div className="relative z-10 w-full max-w-md bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
            <h2 id="modal-contas-titulo" className="text-lg font-bold text-white mb-5">Nova Conta a Pagar</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Descrição *</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Ex: Aluguel, Fornecedor XYZ..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Valor *</label>
                  <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" value={form.valor} onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))} placeholder="0,00" />
                </div>
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Vencimento *</label>
                  <input type="date" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" value={form.vencimento} onChange={(e) => setForm((f) => ({ ...f, vencimento: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Categoria</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} placeholder="Ex: Aluguel, Insumos, Salários..." />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Observação</label>
                <textarea className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 resize-none" rows={2} value={form.observacao} onChange={(e) => setForm((f) => ({ ...f, observacao: e.target.value }))} placeholder="Observações adicionais..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(false)} className="flex-1 py-2 border border-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancelar</button>
              <button onClick={salvar} disabled={criar.isPending} className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
                {criar.isPending ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {menuAberto && <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(null)} />}
    </div>
  );
}
