"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { LayoutGrid, Plus, Users2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

type StatusMesa = "LIVRE" | "OCUPADA" | "RESERVADA" | "MANUTENCAO";

const statusConfig: Record<StatusMesa, { label: string; bg: string; border: string; dot: string }> = {
  LIVRE: { label: "Livre", bg: "bg-emerald-500/10 hover:bg-emerald-500/20", border: "border-emerald-500/30", dot: "bg-emerald-400" },
  OCUPADA: { label: "Ocupada", bg: "bg-red-500/10 hover:bg-red-500/20", border: "border-red-500/30", dot: "bg-red-400" },
  RESERVADA: { label: "Reservada", bg: "bg-amber-500/10 hover:bg-amber-500/20", border: "border-amber-500/30", dot: "bg-amber-400" },
  MANUTENCAO: { label: "Manutenção", bg: "bg-slate-600/20 hover:bg-slate-600/30", border: "border-slate-600/30", dot: "bg-slate-500" },
};

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

export function SalaoView() {
  const [filtroStatus, setFiltroStatus] = useState<StatusMesa | "">("");
  const [modalNova, setModalNova] = useState(false);
  const [modalComanda, setModalComanda] = useState<string | null>(null); // mesaId
  const [formMesa, setFormMesa] = useState({ numero: "", capacidade: "4", area: "" });

  const { data: mesas, isLoading, refetch } = api.mesas.listar.useQuery(
    { status: filtroStatus || undefined },
    { refetchInterval: 15_000 }
  );

  const criarMesa = api.mesas.criar.useMutation({
    onSuccess: () => { toast.success("Mesa criada!"); setModalNova(false); setFormMesa({ numero: "", capacidade: "4", area: "" }); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const abrirComanda = api.mesas.abrirComanda.useMutation({
    onSuccess: (comanda) => {
      toast.success(`Comanda #${comanda.numero} aberta!`);
      setModalComanda(null);
      refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const mesasFiltradas = mesas ?? [];
  const resumo = {
    total: mesas?.length ?? 0,
    livre: mesas?.filter((m) => m.status === "LIVRE").length ?? 0,
    ocupada: mesas?.filter((m) => m.status === "OCUPADA").length ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-orange-400" /> Mesas e Salão
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie as mesas e abra comandas</p>
        </div>
        <button
          onClick={() => setModalNova(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm"
        >
          <Plus className="h-4 w-4" /> Nova Mesa
        </button>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{resumo.total}</p>
          <p className="text-xs text-slate-400 mt-1">Total de mesas</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{resumo.livre}</p>
          <p className="text-xs text-emerald-300/70 mt-1">Livres</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{resumo.ocupada}</p>
          <p className="text-xs text-red-300/70 mt-1">Ocupadas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {(["", "LIVRE", "OCUPADA", "RESERVADA", "MANUTENCAO"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
              filtroStatus === s ? "bg-orange-500 text-white" : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
            )}
          >
            {s === "" ? "Todas" : statusConfig[s].label}
          </button>
        ))}
      </div>

      {/* Grid de mesas */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : mesasFiltradas.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <LayoutGrid className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma mesa encontrada.</p>
          {mesas?.length === 0 && (
            <button onClick={() => setModalNova(true)} className="mt-4 text-amber-400 text-sm hover:underline">
              Criar primeira mesa
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
          {mesasFiltradas.map((mesa) => {
            const cfg = statusConfig[mesa.status as StatusMesa];
            const comanda = (mesa.comandas as unknown as Array<{ id: string; numero: number; total: number }>)[0];
            return (
              <div
                key={mesa.id}
                className={cn(
                  "rounded-xl border p-4 flex flex-col gap-2 transition-all cursor-pointer",
                  cfg.bg, cfg.border
                )}
                onClick={() => {
                  if (mesa.status === "LIVRE") setModalComanda(mesa.id);
                  else if (comanda) window.location.href = `/restaurante/pdv/${comanda.id}`;
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">Mesa {mesa.numero}</span>
                  <span className={cn("h-2.5 w-2.5 rounded-full", cfg.dot)} />
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <Users2 className="h-3 w-3" />
                  <span>{mesa.capacidade} lugares</span>
                </div>
                {mesa.area && <p className="text-xs text-slate-500">{mesa.area}</p>}
                <div className="mt-auto pt-1 border-t border-white/5">
                  {comanda ? (
                    <div>
                      <p className="text-xs font-medium text-orange-400">#{comanda.numero}</p>
                      <p className="text-xs text-slate-400">{formatBRL(Number(comanda.total))}</p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500">{cfg.label}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal nova mesa */}
      {modalNova && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-mesa-titulo" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalNova(false)} />
          <div className="relative z-10 w-full max-w-sm bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
            <h2 id="modal-mesa-titulo" className="text-lg font-bold text-white mb-5">Nova Mesa</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Número da Mesa *</label>
                <input type="number" min="1" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" value={formMesa.numero} onChange={(e) => setFormMesa((f) => ({ ...f, numero: e.target.value }))} placeholder="Ex: 1, 2, 10..." />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Capacidade (lugares)</label>
                <input type="number" min="1" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" value={formMesa.capacidade} onChange={(e) => setFormMesa((f) => ({ ...f, capacidade: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Área / Setor</label>
                <input className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500" value={formMesa.area} onChange={(e) => setFormMesa((f) => ({ ...f, area: e.target.value }))} placeholder="Ex: Salão, Terraço, Delivery..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalNova(false)} className="flex-1 py-2 border border-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancelar</button>
              <button
                onClick={() => {
                  const num = parseInt(formMesa.numero);
                  if (!num) return toast.error("Número inválido.");
                  criarMesa.mutate({ numero: num, capacidade: parseInt(formMesa.capacidade) || 4, area: formMesa.area || undefined });
                }}
                disabled={criarMesa.isPending}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {criarMesa.isPending ? "Criando..." : "Criar Mesa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar abertura de comanda */}
      {modalComanda && (
        <div role="dialog" aria-modal="true" aria-labelledby="modal-comanda-titulo" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalComanda(null)} />
          <div className="relative z-10 w-full max-w-sm bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
            <h2 id="modal-comanda-titulo" className="text-lg font-bold text-white mb-3">Abrir Comanda</h2>
            <p className="text-slate-400 text-sm mb-6">
              Deseja abrir uma nova comanda para esta mesa?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setModalComanda(null)} className="flex-1 py-2 border border-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancelar</button>
              <button
                onClick={() => abrirComanda.mutate({ mesaId: modalComanda })}
                disabled={abrirComanda.isPending}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {abrirComanda.isPending ? "Abrindo..." : "Abrir Comanda"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
