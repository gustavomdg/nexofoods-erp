"use client";

import { api } from "@/lib/trpc/client";
import { ChefHat, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type StatusItem = "PENDENTE" | "CONFIRMADO" | "PREPARANDO" | "PRONTO";

const statusConfig: Record<StatusItem, { label: string; next: string | null; nextLabel: string | null; bg: string; border: string }> = {
  PENDENTE: { label: "Novo pedido", next: "CONFIRMADO", nextLabel: "Confirmar", bg: "bg-amber-500/10", border: "border-amber-500/40" },
  CONFIRMADO: { label: "Confirmado", next: "PREPARANDO", nextLabel: "Iniciar preparo", bg: "bg-blue-500/10", border: "border-blue-500/40" },
  PREPARANDO: { label: "Em preparo", next: "PRONTO", nextLabel: "Marcar pronto", bg: "bg-purple-500/10", border: "border-purple-500/40" },
  PRONTO: { label: "Pronto!", next: null, nextLabel: null, bg: "bg-emerald-500/10", border: "border-emerald-500/40" },
};

function minutosDesde(d: Date | string) {
  const diff = Date.now() - new Date(d).getTime();
  return Math.floor(diff / 60000);
}

export function KDSView() {
  const { data: itens, refetch, isLoading } = api.comandas.itensCozinha.useQuery(undefined, {
    refetchInterval: 8_000,
  });

  const atualizarStatus = api.comandas.atualizarStatusItem.useMutation({
    onSuccess: () => { refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const itensPorStatus = {
    PENDENTE: itens?.filter((i) => i.status === "PENDENTE") ?? [],
    CONFIRMADO: itens?.filter((i) => i.status === "CONFIRMADO") ?? [],
    PREPARANDO: itens?.filter((i) => i.status === "PREPARANDO") ?? [],
    PRONTO: itens?.filter((i) => i.status === "PRONTO") ?? [],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
          <p className="text-slate-400 text-sm">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-orange-400" /> Cozinha (KDS)
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pedidos em tempo real · Atualiza automaticamente
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Ao vivo
        </div>
      </div>

      {itens?.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <ChefHat className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">Nenhum pedido no momento</p>
          <p className="text-sm mt-1">Os pedidos aparecerão aqui assim que forem feitos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {(["PENDENTE", "CONFIRMADO", "PREPARANDO", "PRONTO"] as StatusItem[]).map((status) => {
            const cfg = statusConfig[status];
            const statusItens = itensPorStatus[status];
            return (
              <div key={status} className="space-y-3">
                <div className={cn("rounded-lg px-3 py-2 border", cfg.bg, cfg.border)}>
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-white">{cfg.label}</h2>
                    <span className="text-xs font-bold text-white bg-white/10 rounded-full px-2 py-0.5">
                      {statusItens.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {statusItens.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-sm">
                      Nenhum item
                    </div>
                  ) : (
                    statusItens.map((item) => {
                      const comanda = item.comanda as { numero: number; mesa: { numero: number; area: string | null } | null };
                      const produto = item.produto as { nome: string };
                      const mins = minutosDesde(item.createdAt);
                      const urgente = mins >= 10;
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "bg-slate-800 border rounded-xl p-3 space-y-2",
                            urgente ? "border-red-500/50" : "border-slate-700/50"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-sm font-bold text-white">{produto.nome}</p>
                              <p className="text-xs text-slate-400">
                                Comanda #{comanda.numero}
                                {comanda.mesa ? ` · Mesa ${comanda.mesa.numero}` : ""}
                              </p>
                            </div>
                            <div className={cn("flex items-center gap-1 text-xs font-medium whitespace-nowrap", urgente ? "text-red-400" : "text-slate-500")}>
                              <Clock className="h-3 w-3" />
                              {mins}min
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-orange-400">
                              × {Number(item.quantidade)}
                            </span>
                            {item.observacao && (
                              <span className="text-xs text-amber-300 italic truncate max-w-[100px]">"{item.observacao}"</span>
                            )}
                          </div>

                          {cfg.next && (
                            <button
                              onClick={() => atualizarStatus.mutate({ itemId: item.id, status: cfg.next as "CONFIRMADO" | "PREPARANDO" | "PRONTO" })}
                              disabled={atualizarStatus.isPending}
                              className={cn(
                                "w-full py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50",
                                status === "PENDENTE" && "bg-blue-500 hover:bg-blue-400 text-white",
                                status === "CONFIRMADO" && "bg-purple-500 hover:bg-purple-400 text-white",
                                status === "PREPARANDO" && "bg-emerald-500 hover:bg-emerald-400 text-white",
                              )}
                            >
                              {cfg.nextLabel}
                            </button>
                          )}

                          {status === "PRONTO" && (
                            <div className="flex items-center justify-center gap-1 text-emerald-400 text-xs font-medium py-1">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Aguardando entrega
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
