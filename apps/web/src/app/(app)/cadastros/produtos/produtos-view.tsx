"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc/client";
import { Package, Plus, Search, MoreHorizontal, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatBRL(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
}

type ModalMode = "criar" | "editar" | null;

interface ProdutoFormData {
  nome: string;
  descricao: string;
  preco: string;
  custo: string;
  unidade: string;
  categoria: string;
  codigoBarras: string;
}

const emptyForm: ProdutoFormData = {
  nome: "", descricao: "", preco: "", custo: "", unidade: "UN", categoria: "", codigoBarras: "",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function ProdutosView() {
  const [pagina, setPagina] = useState(1);
  const [buscaInput, setBuscaInput] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ProdutoFormData>(emptyForm);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  const busca = useDebounce(buscaInput, 400);
  useEffect(() => { setPagina(1); }, [busca, categoriaFiltro]);

  const { data, isLoading, refetch } = api.produtos.listar.useQuery({
    pagina, porPagina: 20,
    busca: busca || undefined,
    categoria: categoriaFiltro || undefined,
  });

  const { data: categorias } = api.produtos.listarCategorias.useQuery();

  const criar = api.produtos.criar.useMutation({
    onSuccess: () => { toast.success("Produto criado!"); setModal(null); setForm(emptyForm); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const atualizar = api.produtos.atualizar.useMutation({
    onSuccess: () => { toast.success("Produto atualizado!"); setModal(null); setEditandoId(null); setForm(emptyForm); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const desativar = api.produtos.atualizar.useMutation({
    onSuccess: () => { toast.success("Produto desativado."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  function abrirEditar(p: { id: string; nome: string; descricao: string | null; preco: unknown; custo: unknown; unidade: string; categoria: string | null; codigoBarras: string | null }) {
    setEditandoId(p.id);
    setForm({
      nome: p.nome,
      descricao: p.descricao ?? "",
      preco: String(p.preco),
      custo: p.custo ? String(p.custo) : "",
      unidade: p.unidade,
      categoria: p.categoria ?? "",
      codigoBarras: p.codigoBarras ?? "",
    });
    setModal("editar");
    setMenuAberto(null);
  }

  function salvar() {
    if (!form.nome.trim()) return toast.error("Nome obrigatório.");
    const preco = parseFloat(form.preco.replace(",", "."));
    if (isNaN(preco) || preco < 0) return toast.error("Preço inválido.");
    const custo = form.custo ? parseFloat(form.custo.replace(",", ".")) : undefined;

    const payload = {
      nome: form.nome,
      descricao: form.descricao || undefined,
      preco,
      custo,
      unidade: form.unidade,
      categoria: form.categoria || undefined,
      codigoBarras: form.codigoBarras || undefined,
    };

    if (modal === "criar") {
      criar.mutate(payload);
    } else if (editandoId) {
      atualizar.mutate({ id: editandoId, ...payload });
    }
  }

  const isSaving = criar.isPending || atualizar.isPending;
  const inicio = (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, data?.total ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-orange-400" /> Produtos
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie o catálogo de produtos</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModal("criar"); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4" /> Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            placeholder="Buscar por nome ou código..."
            value={buscaInput}
            onChange={(e) => setBuscaInput(e.target.value)}
            aria-label="Buscar produtos"
          />
        </div>
        {categorias && categorias.length > 0 && (
          <select
            className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            aria-label="Filtrar por categoria"
          >
            <option value="">Todas as categorias</option>
            {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Tabela */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Lista de produtos">
            <thead>
              <tr className="border-b border-white/5">
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Produto</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Categoria</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Unidade</th>
                <th scope="col" className="text-right px-4 py-3 text-slate-400 font-medium">Custo</th>
                <th scope="col" className="text-right px-4 py-3 text-slate-400 font-medium">Preço</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-slate-700 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : data?.produtos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <Package className="h-7 w-7 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">
                          {busca || categoriaFiltro ? "Nenhum produto encontrado" : "Nenhum produto cadastrado ainda"}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {busca ? `Nenhum resultado para "${busca}"` : categoriaFiltro ? `Sem produtos na categoria "${categoriaFiltro}"` : "Cadastre seu primeiro produto para começar"}
                        </p>
                      </div>
                      {!busca && !categoriaFiltro && (
                        <button
                          onClick={() => { setForm(emptyForm); setModal("criar"); }}
                          className="mt-1 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4" /> Novo Produto
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data?.produtos.map((p: any) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-white">{p.nome}</p>
                      {p.descricao && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{p.descricao}</p>}
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
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", p.ativo ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600/50 text-slate-500")}>
                        {p.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setMenuAberto(menuAberto === p.id ? null : p.id)}
                        aria-label={`Ações para ${p.nome}`}
                        className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuAberto === p.id && (
                        <div role="menu" aria-label={`Ações para ${p.nome}`} className="absolute right-4 top-8 z-20 w-44 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden">
                          <button role="menuitem" onClick={() => abrirEditar(p)} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">Editar</button>
                          {p.ativo ? (
                            <button role="menuitem" onClick={() => { desativar.mutate({ id: p.id, ativo: false }); setMenuAberto(null); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors">Desativar</button>
                          ) : (
                            <button role="menuitem" onClick={() => { desativar.mutate({ id: p.id, ativo: true }); setMenuAberto(null); }} className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-white/5 transition-colors">Reativar</button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {data && data.paginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-sm text-slate-500">
              {data.total > 0 ? `Exibindo ${inicio}–${fim} de ${data.total} produtos` : "0 produtos"}
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
        <div role="dialog" aria-modal="true" aria-labelledby="modal-produto-titulo" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-lg bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 id="modal-produto-titulo" className="text-lg font-bold text-white mb-5">{modal === "criar" ? "Novo Produto" : "Editar Produto"}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="prod-nome" className="text-sm text-slate-400 mb-1 block">Nome *</label>
                <input id="prod-nome" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Nome do produto" />
              </div>
              <div>
                <label htmlFor="prod-desc" className="text-sm text-slate-400 mb-1 block">Descrição</label>
                <textarea id="prod-desc" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors resize-none" rows={2} value={form.descricao} onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))} placeholder="Descrição opcional" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-preco" className="text-sm text-slate-400 mb-1 block">Preço de Venda *</label>
                  <input id="prod-preco" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.preco} onChange={(e) => setForm((f) => ({ ...f, preco: e.target.value }))} placeholder="0,00" />
                </div>
                <div>
                  <label htmlFor="prod-custo" className="text-sm text-slate-400 mb-1 block">Custo</label>
                  <input id="prod-custo" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.custo} onChange={(e) => setForm((f) => ({ ...f, custo: e.target.value }))} placeholder="0,00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prod-unidade" className="text-sm text-slate-400 mb-1 block">Unidade</label>
                  <select id="prod-unidade" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.unidade} onChange={(e) => setForm((f) => ({ ...f, unidade: e.target.value }))}>
                    <option value="UN">UN — Unidade</option>
                    <option value="KG">KG — Quilograma</option>
                    <option value="G">G — Grama</option>
                    <option value="L">L — Litro</option>
                    <option value="ML">ML — Mililitro</option>
                    <option value="CX">CX — Caixa</option>
                    <option value="PC">PC — Peça</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="prod-cat" className="text-sm text-slate-400 mb-1 block">Categoria</label>
                  <input id="prod-cat" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.categoria} onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))} placeholder="Ex: Bebidas, Pratos..." list="categorias-list" />
                  <datalist id="categorias-list">
                    {categorias?.map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>
              <div>
                <label htmlFor="prod-barras" className="text-sm text-slate-400 mb-1 block">Código de Barras</label>
                <input id="prod-barras" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.codigoBarras} onChange={(e) => setForm((f) => ({ ...f, codigoBarras: e.target.value }))} placeholder="EAN-13 ou interno" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/5 transition-colors">Cancelar</button>
              <button onClick={salvar} disabled={isSaving} className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50">
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {menuAberto && <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(null)} />}
    </div>
  );
}
