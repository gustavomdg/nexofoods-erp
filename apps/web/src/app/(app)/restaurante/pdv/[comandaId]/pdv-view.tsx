"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { ShoppingCart, Search, Plus, Minus, Trash2, X, Check, ChefHat, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

const statusItemConfig: Record<string, { label: string; cor: string }> = {
  PENDENTE: { label: "Pendente", cor: "bg-slate-600/50 text-slate-400" },
  CONFIRMADO: { label: "Confirmado", cor: "bg-blue-500/20 text-blue-400" },
  PREPARANDO: { label: "Preparando", cor: "bg-amber-500/20 text-amber-400" },
  PRONTO: { label: "Pronto", cor: "bg-emerald-500/20 text-emerald-400" },
  SERVIDO: { label: "Servido", cor: "bg-slate-500/20 text-slate-400" },
  CANCELADO: { label: "Cancelado", cor: "bg-red-500/20 text-red-400" },
};

export function PDVView({ comandaId }: { comandaId: string }) {
  const router = useRouter();
  const [buscaProduto, setBuscaProduto] = useState("");
  const [qtd, setQtd] = useState<Record<string, number>>({});
  const [obs, setObs] = useState("");
  const [modalFechar, setModalFechar] = useState(false);
  const [desconto, setDesconto] = useState("0");
  const [produtoSelecionado, setProdutoSelecionado] = useState<string | null>(null);

  const { data: comanda, refetch } = api.comandas.buscarPorId.useQuery({ id: comandaId }, { refetchInterval: 10_000 });
  const { data: produtos } = api.produtos.listar.useQuery({ busca: buscaProduto || undefined, ativo: true, pagina: 1, porPagina: 50 });

  const adicionarItem = api.comandas.adicionarItem.useMutation({
    onSuccess: () => { toast.success("Item adicionado!"); setProdutoSelecionado(null); setQtd({}); setObs(""); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const removerItem = api.comandas.removerItem.useMutation({
    onSuccess: () => { toast.success("Item removido."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const fechar = api.comandas.fechar.useMutation({
    onSuccess: () => { toast.success("Comanda fechada!"); router.push("/restaurante/salao"); },
    onError: (e) => toast.error(e.message),
  });

  const cancelar = api.comandas.cancelar.useMutation({
    onSuccess: () => { toast.success("Comanda cancelada."); router.push("/restaurante/salao"); },
    onError: (e) => toast.error(e.message),
  });

  if (!comanda) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const itensFiltrados = comanda.itens.filter((i) => i.status !== "CANCELADO");
  const total = itensFiltrados.reduce((acc, i) => acc + Number(i.subtotal), 0);
  const descontoNum = parseFloat(desconto.replace(",", ".")) || 0;
  const totalFinal = Math.max(0, total - descontoNum);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/restaurante/salao" className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-orange-400" />
            Comanda #{comanda.numero}
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {(comanda.mesa as { numero: number; area: string | null } | null) ? `Mesa ${(comanda.mesa as { numero: number }).numero}` : "Delivery"}
            {" · "}
            <span className={cn("font-medium", comanda.status === "ABERTA" ? "text-emerald-400" : "text-slate-500")}>
              {comanda.status === "ABERTA" ? "Aberta" : comanda.status === "FECHADA" ? "Fechada" : "Cancelada"}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Coluna esquerda: Produtos */}
        {comanda.status === "ABERTA" && (
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-white mb-3">Adicionar Item</h2>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
                  placeholder="Buscar produto..."
                  value={buscaProduto}
                  onChange={(e) => setBuscaProduto(e.target.value)}
                />
              </div>
              <div className="space-y-1 max-h-72 overflow-y-auto">
                {produtos?.produtos.map((p) => {
                  const q = qtd[p.id] ?? 1;
                  const isSelected = produtoSelecionado === p.id;
                  return (
                    <div
                      key={p.id}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer",
                        isSelected ? "bg-amber-500/20 border border-amber-500/30" : "hover:bg-slate-700/50"
                      )}
                      onClick={() => setProdutoSelecionado(isSelected ? null : p.id)}
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{p.nome}</p>
                        <p className="text-xs text-slate-400">{formatBRL(Number(p.preco))} / {p.unidade}</p>
                      </div>
                      {isSelected && (
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => setQtd((prev) => ({ ...prev, [p.id]: Math.max(1, (prev[p.id] ?? 1) - 1) }))} className="p-1 rounded bg-slate-700 text-white hover:bg-slate-600">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-white w-6 text-center">{q}</span>
                          <button onClick={() => setQtd((prev) => ({ ...prev, [p.id]: (prev[p.id] ?? 1) + 1 }))} className="p-1 rounded bg-slate-700 text-white hover:bg-slate-600">
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => adicionarItem.mutate({ comandaId, produtoId: p.id, quantidade: q, observacao: obs || undefined })}
                            disabled={adicionarItem.isPending}
                            className="ml-1 px-2 py-1 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded text-xs transition-colors disabled:opacity-50"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {!produtos?.produtos.length && (
                  <p className="text-center text-slate-500 text-sm py-6">Nenhum produto encontrado.</p>
                )}
              </div>
              {produtoSelecionado && (
                <div className="mt-3">
                  <input
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                    placeholder="Observação para a cozinha (opcional)..."
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Coluna direita: Itens da comanda */}
        <div className={cn("space-y-4", comanda.status === "ABERTA" ? "lg:col-span-2" : "lg:col-span-5")}>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700/50">
              <h2 className="text-sm font-semibold text-white">Itens da Comanda</h2>
            </div>
            {itensFiltrados.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Nenhum item adicionado.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {itensFiltrados.map((item) => {
                  const cfg = statusItemConfig[item.status] ?? statusItemConfig["PENDENTE"]!;
                  const p = item.produto as { nome: string; unidade: string };
                  return (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{p.nome}</p>
                        <p className="text-xs text-slate-400">
                          {Number(item.quantidade)} × {formatBRL(Number(item.precoUnit))}
                        </p>
                        {item.observacao && <p className="text-xs text-amber-400 mt-0.5 italic">"{item.observacao}"</p>}
                      </div>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap", cfg.cor)}>
                        {cfg.label}
                      </span>
                      <p className="text-sm font-semibold text-white whitespace-nowrap">{formatBRL(Number(item.subtotal))}</p>
                      {comanda.status === "ABERTA" && (
                        <button
                          onClick={() => removerItem.mutate({ itemId: item.id })}
                          className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total + ações */}
            <div className="border-t border-slate-700/50 px-4 py-4 space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span>
                <span>{formatBRL(total)}</span>
              </div>
              {Number(comanda.desconto) > 0 && (
                <div className="flex justify-between text-sm text-red-400">
                  <span>Desconto</span>
                  <span>- {formatBRL(Number(comanda.desconto))}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-white text-base border-t border-slate-700/50 pt-2">
                <span>Total</span>
                <span>{formatBRL(Number(comanda.total) || total)}</span>
              </div>

              {comanda.status === "ABERTA" && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => cancelar.mutate({ id: comandaId })}
                    className="flex-1 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="h-3.5 w-3.5" /> Cancelar
                  </button>
                  <button
                    onClick={() => setModalFechar(true)}
                    className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <Check className="h-3.5 w-3.5" /> Fechar Comanda
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal fechar */}
      {modalFechar && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-fechar-titulo" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalFechar(false)} />
          <div className="relative z-10 w-full max-w-sm bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
            <h2 id="modal-fechar-titulo" className="text-lg font-bold text-white mb-5">Fechar Comanda #{comanda.numero}</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-slate-400">
                <span>Subtotal</span><span>{formatBRL(total)}</span>
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Desconto (R$)</label>
                <input
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
                  value={desconto}
                  onChange={(e) => setDesconto(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="flex justify-between font-bold text-white border-t border-slate-700/50 pt-2">
                <span>Total Final</span><span>{formatBRL(totalFinal)}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalFechar(false)} className="flex-1 py-2 border border-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancelar</button>
              <button
                onClick={() => fechar.mutate({ id: comandaId, desconto: descontoNum })}
                disabled={fechar.isPending}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {fechar.isPending ? "Fechando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
