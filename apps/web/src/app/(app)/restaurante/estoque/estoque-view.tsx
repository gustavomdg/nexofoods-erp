"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/client";
import { PackageSearch, Search, Plus, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

interface FichaForm {
  pratoId: string;
  ingredientes: Array<{ ingredienteId: string; quantidade: string; unidade: string }>;
}

export function EstoqueView() {
  const [busca, setBusca] = useState("");
  const [buscaInput, setBuscaInput] = useState("");
  const [modalFicha, setModalFicha] = useState<string | null>(null); // pratoId
  const [novoIngrediente, setNovoIngrediente] = useState({ ingredienteId: "", quantidade: "", unidade: "KG" });

  const { data: produtos, isLoading } = api.produtos.listar.useQuery({
    pagina: 1, porPagina: 100, busca: busca || undefined,
  });

  const { data: produtoDetalhe } = api.produtos.buscarPorId.useQuery(
    { id: modalFicha! },
    { enabled: !!modalFicha }
  );

  // Nota: mutations de ficha técnica precisariam de um router dedicado
  // Por ora exibimos os dados já existentes e indicamos onde implementar

  const pratos = produtos?.produtos ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <PackageSearch className="h-6 w-6 text-orange-400" /> Estoque & Fichas Técnicas
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie ingredientes e composição dos pratos</p>
        </div>
      </div>

      {/* Info card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-5 py-4">
        <p className="text-sm text-blue-300">
          <strong>Fichas Técnicas:</strong> Clique em um produto para visualizar ou configurar seus ingredientes.
          O sistema deduz automaticamente o estoque de ingredientes ao fechar comandas.
        </p>
      </div>

      {/* Busca */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
            placeholder="Buscar produto..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setBusca(buscaInput); }}
          />
        </div>
        <button onClick={() => setBusca(buscaInput)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors">Buscar</button>
      </div>

      {/* Grid de produtos */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Produto</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Categoria</th>
                  <th className="text-left px-4 py-3 text-slate-400 font-medium">Unidade</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Custo unit.</th>
                  <th className="text-right px-4 py-3 text-slate-400 font-medium">Preço venda</th>
                  <th className="text-center px-4 py-3 text-slate-400 font-medium">Ficha Técnica</th>
                </tr>
              </thead>
              <tbody>
                {pratos.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">Nenhum produto encontrado.</td></tr>
                ) : (
                  pratos.map((p) => {
                    const temFicha = p.fichaTecnica && (p.fichaTecnica as Array<unknown>).length > 0;
                    return (
                      <tr key={p.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-medium text-white">{p.nome}</p>
                          {p.descricao && <p className="text-xs text-slate-500 truncate max-w-[180px]">{p.descricao}</p>}
                        </td>
                        <td className="px-4 py-3">
                          {p.categoria ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">
                              <Tag className="h-2.5 w-2.5" />{p.categoria}
                            </span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{p.unidade}</td>
                        <td className="px-4 py-3 text-right text-slate-400">{p.custo ? formatBRL(Number(p.custo)) : "—"}</td>
                        <td className="px-4 py-3 text-right font-medium text-white">{formatBRL(Number(p.preco))}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setModalFicha(p.id)}
                            className={cn(
                              "text-xs px-3 py-1 rounded-lg font-medium transition-colors",
                              temFicha
                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30"
                                : "bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white"
                            )}
                          >
                            {temFicha ? `${(p.fichaTecnica as Array<unknown>).length} ingredientes` : "Configurar"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Ficha Técnica */}
      {modalFicha && produtoDetalhe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalFicha(null)} />
          <div className="relative z-10 w-full max-w-lg bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-1">Ficha Técnica</h2>
            <p className="text-slate-400 text-sm mb-5">{produtoDetalhe.nome}</p>

            {produtoDetalhe.fichaTecnica && (produtoDetalhe.fichaTecnica as unknown as Array<{ id: string; quantidade: number; unidade: string; ingrediente: { nome: string; unidade: string } }>).length > 0 ? (
              <div className="space-y-2 mb-5">
                {(produtoDetalhe.fichaTecnica as unknown as Array<{ id: string; quantidade: number; unidade: string; ingrediente: { nome: string; unidade: string } }>).map((ft) => (
                  <div key={ft.id} className="flex items-center justify-between bg-slate-900 rounded-lg px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-white">{ft.ingrediente.nome}</p>
                      <p className="text-xs text-slate-400">{ft.unidade}</p>
                    </div>
                    <span className="text-sm font-semibold text-amber-400">× {Number(ft.quantidade)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 mb-5">
                <p className="text-sm">Nenhum ingrediente configurado.</p>
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-5">
              <p className="text-xs text-blue-300">
                A edição de fichas técnicas está disponível via API. A interface de edição
                será implementada na próxima sprint. Os ingredientes são deduzidos automaticamente ao fechar comandas.
              </p>
            </div>

            <button onClick={() => setModalFicha(null)} className="w-full py-2 border border-slate-700 text-slate-400 rounded-lg text-sm hover:bg-slate-700 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
