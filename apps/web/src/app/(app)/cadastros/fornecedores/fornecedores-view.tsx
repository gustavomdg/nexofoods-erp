"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/trpc/client";
import { Building2, Plus, Search, Phone, Mail, MoreHorizontal, BuildingIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ModalMode = "criar" | "editar" | null;

interface FornecedorFormData {
  nome: string;
  cnpj: string;
  email: string;
  telefone: string;
}

const emptyForm: FornecedorFormData = { nome: "", cnpj: "", email: "", telefone: "" };

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function FornecedoresView() {
  const [pagina, setPagina] = useState(1);
  const [buscaInput, setBuscaInput] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FornecedorFormData>(emptyForm);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  const busca = useDebounce(buscaInput, 400);
  useEffect(() => { setPagina(1); }, [busca]);

  const { data, isLoading, refetch } = api.fornecedores.listar.useQuery({ pagina, porPagina: 20, busca: busca || undefined });

  const criar = api.fornecedores.criar.useMutation({
    onSuccess: () => { toast.success("Fornecedor criado!"); setModal(null); setForm(emptyForm); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const atualizar = api.fornecedores.atualizar.useMutation({
    onSuccess: () => { toast.success("Fornecedor atualizado!"); setModal(null); setEditandoId(null); setForm(emptyForm); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const desativar = api.fornecedores.atualizar.useMutation({
    onSuccess: () => { toast.success("Fornecedor desativado."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  function abrirEditar(f: { id: string; nome: string; cnpj: string | null; email: string | null; telefone: string | null }) {
    setEditandoId(f.id);
    setForm({ nome: f.nome, cnpj: f.cnpj ?? "", email: f.email ?? "", telefone: f.telefone ?? "" });
    setModal("editar");
    setMenuAberto(null);
  }

  function salvar() {
    if (!form.nome.trim()) return toast.error("Nome obrigatório.");
    if (modal === "criar") {
      criar.mutate({ nome: form.nome, cnpj: form.cnpj || undefined, email: form.email || undefined, telefone: form.telefone || undefined });
    } else if (editandoId) {
      atualizar.mutate({ id: editandoId, nome: form.nome, cnpj: form.cnpj || undefined, email: form.email || undefined, telefone: form.telefone || undefined });
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
            <Building2 className="h-6 w-6 text-orange-400" /> Fornecedores
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie os fornecedores do seu negócio</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setModal("criar"); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4" /> Novo Fornecedor
        </button>
      </div>

      {/* Busca com debounce */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          placeholder="Buscar por nome ou CNPJ..."
          value={buscaInput}
          onChange={(e) => setBuscaInput(e.target.value)}
          aria-label="Buscar fornecedores"
        />
      </div>

      {/* Tabela */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Lista de fornecedores">
            <thead>
              <tr className="border-b border-white/5">
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Nome</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">CNPJ</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Contato</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.fornecedores.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <Building2 className="h-7 w-7 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">
                          {busca ? "Nenhum fornecedor encontrado" : "Nenhum fornecedor cadastrado ainda"}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {busca ? `Nenhum resultado para "${busca}"` : "Cadastre seu primeiro fornecedor para começar"}
                        </p>
                      </div>
                      {!busca && (
                        <button
                          onClick={() => { setForm(emptyForm); setModal("criar"); }}
                          className="mt-1 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4" /> Novo Fornecedor
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data?.fornecedores.map((f: any) => (
                  <tr key={f.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{f.nome}</td>
                    <td className="px-4 py-3 text-slate-400">{f.cnpj ?? "—"}</td>
                    <td className="px-4 py-3 text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        {f.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{f.email}</span>}
                        {f.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{f.telefone}</span>}
                        {!f.email && !f.telefone && "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", f.ativo ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600/50 text-slate-500")}>
                        {f.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setMenuAberto(menuAberto === f.id ? null : f.id)}
                        aria-label={`Ações para ${f.nome}`}
                        className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuAberto === f.id && (
                        <div
                          role="menu"
                          aria-label={`Ações para ${f.nome}`}
                          className="absolute right-4 top-8 z-20 w-44 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                        >
                          <button role="menuitem" onClick={() => abrirEditar(f)} className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors">Editar</button>
                          {f.ativo ? (
                            <button role="menuitem" onClick={() => { desativar.mutate({ id: f.id, ativo: false }); setMenuAberto(null); }} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors">Desativar</button>
                          ) : (
                            <button role="menuitem" onClick={() => { desativar.mutate({ id: f.id, ativo: true }); setMenuAberto(null); }} className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-white/5 transition-colors">Reativar</button>
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
              {data.total > 0 ? `Exibindo ${inicio}–${fim} de ${data.total} fornecedores` : "0 fornecedores"}
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
        <div role="dialog" aria-modal="true" aria-labelledby="modal-fornecedor-titulo" className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-md bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
            <h2 id="modal-fornecedor-titulo" className="text-lg font-bold text-white mb-5">
              {modal === "criar" ? "Novo Fornecedor" : "Editar Fornecedor"}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="forn-nome" className="text-sm text-slate-400 mb-1 block">Nome / Razão Social *</label>
                <input id="forn-nome" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.nome} onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))} placeholder="Razão social ou nome" />
              </div>
              <div>
                <label htmlFor="forn-cnpj" className="text-sm text-slate-400 mb-1 block">CNPJ</label>
                <input id="forn-cnpj" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.cnpj} onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))} placeholder="00.000.000/0000-00" />
              </div>
              <div>
                <label htmlFor="forn-email" className="text-sm text-slate-400 mb-1 block">E-mail</label>
                <input id="forn-email" type="email" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="email@fornecedor.com" />
              </div>
              <div>
                <label htmlFor="forn-tel" className="text-sm text-slate-400 mb-1 block">Telefone</label>
                <input id="forn-tel" className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors" value={form.telefone} onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))} placeholder="(11) 99999-0000" />
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
