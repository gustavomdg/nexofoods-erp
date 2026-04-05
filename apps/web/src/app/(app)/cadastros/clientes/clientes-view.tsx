"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/trpc/client";
import { Users, Plus, Search, Phone, Mail, MoreHorizontal, UserCheck, UserX, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatCpfCnpj(v: string | null | undefined) {
  if (!v) return "—";
  return v;
}

type ModalMode = "criar" | "editar" | null;

interface ClienteFormData {
  nome: string;
  cpfCnpj: string;
  email: string;
  telefone: string;
  tipo: "FISICA" | "JURIDICA";
}

const emptyForm: ClienteFormData = {
  nome: "",
  cpfCnpj: "",
  email: "",
  telefone: "",
  tipo: "FISICA",
};

// Hook de debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function ClientesView() {
  const [pagina, setPagina] = useState(1);
  const [buscaInput, setBuscaInput] = useState("");
  const [modal, setModal] = useState<ModalMode>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<ClienteFormData>(emptyForm);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  // Debounce automático — sem botão "Buscar"
  const busca = useDebounce(buscaInput, 400);

  // Reset página ao mudar busca
  useEffect(() => { setPagina(1); }, [busca]);

  const { data, isLoading, refetch } = api.clientes.listar.useQuery({
    pagina,
    porPagina: 20,
    busca: busca || undefined,
  });

  const criar = api.clientes.criar.useMutation({
    onSuccess: () => { toast.success("Cliente criado!"); setModal(null); setForm(emptyForm); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const atualizar = api.clientes.atualizar.useMutation({
    onSuccess: () => { toast.success("Cliente atualizado!"); setModal(null); setEditandoId(null); setForm(emptyForm); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const desativar = api.clientes.desativar.useMutation({
    onSuccess: () => { toast.success("Cliente desativado."); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const reativar = api.clientes.atualizar.useMutation({
    onSuccess: () => { toast.success("Cliente reativado!"); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  function abrirEditar(c: { id: string; nome: string; cpfCnpj: string | null; email: string | null; telefone: string | null; tipo: string }) {
    setEditandoId(c.id);
    setForm({
      nome: c.nome,
      cpfCnpj: c.cpfCnpj ?? "",
      email: c.email ?? "",
      telefone: c.telefone ?? "",
      tipo: c.tipo as "FISICA" | "JURIDICA",
    });
    setModal("editar");
    setMenuAberto(null);
  }

  function salvar() {
    if (!form.nome.trim()) return toast.error("Nome obrigatório.");
    if (modal === "criar") {
      criar.mutate({ nome: form.nome, cpfCnpj: form.cpfCnpj || undefined, email: form.email || undefined, telefone: form.telefone || undefined, tipo: form.tipo });
    } else if (editandoId) {
      atualizar.mutate({ id: editandoId, nome: form.nome, cpfCnpj: form.cpfCnpj || undefined, email: form.email || undefined, telefone: form.telefone || undefined, tipo: form.tipo });
    }
  }

  const isSaving = criar.isPending || atualizar.isPending;

  // Calcula "Exibindo X-Y de Z"
  const inicio = (pagina - 1) * 20 + 1;
  const fim = Math.min(pagina * 20, data?.total ?? 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-orange-400" /> Clientes
          </h1>
          <p className="text-slate-400 text-sm mt-1">Gerencie os clientes do seu negócio</p>
        </div>
        <button
          id="btn-novo-cliente"
          onClick={() => { setForm(emptyForm); setModal("criar"); }}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm shadow-lg shadow-orange-500/20"
        >
          <Plus className="h-4 w-4" /> Novo Cliente
        </button>
      </div>

      {/* Busca com debounce automático */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          id="busca-clientes"
          className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          placeholder="Buscar por nome, e-mail ou CPF/CNPJ..."
          value={buscaInput}
          onChange={(e) => setBuscaInput(e.target.value)}
          aria-label="Buscar clientes"
        />
      </div>

      {/* Tabela */}
      <div className="bg-slate-800/50 border border-white/5 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table" aria-label="Lista de clientes">
            <thead>
              <tr className="border-b border-white/5">
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Nome</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Tipo</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">CPF/CNPJ</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Contato</th>
                <th scope="col" className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th scope="col" className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-slate-700 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.clientes.length === 0 ? (
                /* Empty state com CTA */
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-14 w-14 rounded-full bg-slate-700/50 flex items-center justify-center">
                        <UserPlus className="h-7 w-7 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-slate-300 font-medium">
                          {busca ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">
                          {busca ? `Nenhum resultado para "${busca}"` : "Cadastre seu primeiro cliente para começar"}
                        </p>
                      </div>
                      {!busca && (
                        <button
                          onClick={() => { setForm(emptyForm); setModal("criar"); }}
                          className="mt-1 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg transition-colors text-sm"
                        >
                          <Plus className="h-4 w-4" /> Novo Cliente
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data?.clientes.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{c.nome}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", c.tipo === "JURIDICA" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400")}>
                        {c.tipo === "JURIDICA" ? "PJ" : "PF"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{formatCpfCnpj(c.cpfCnpj)}</td>
                    <td className="px-4 py-3 text-slate-400">
                      <div className="flex flex-col gap-0.5">
                        {c.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{c.email}</span>}
                        {c.telefone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.telefone}</span>}
                        {!c.email && !c.telefone && "—"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", c.ativo ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-600/50 text-slate-500")}>
                        {c.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 relative">
                      <button
                        onClick={() => setMenuAberto(menuAberto === c.id ? null : c.id)}
                        aria-label={`Ações para ${c.nome}`}
                        className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                      {menuAberto === c.id && (
                        <div
                          role="menu"
                          aria-label={`Ações para ${c.nome}`}
                          className="absolute right-4 top-8 z-20 w-44 bg-slate-800 border border-white/10 rounded-lg shadow-xl overflow-hidden"
                        >
                          <button
                            role="menuitem"
                            onClick={() => abrirEditar(c)}
                            className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/5 transition-colors"
                          >
                            Editar
                          </button>
                          {c.ativo ? (
                            <button
                              role="menuitem"
                              onClick={() => { desativar.mutate({ id: c.id }); setMenuAberto(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                              <UserX className="h-3.5 w-3.5" /> Desativar
                            </button>
                          ) : (
                            <button
                              role="menuitem"
                              onClick={() => { reativar.mutate({ id: c.id, ativo: true }); setMenuAberto(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-emerald-400 hover:bg-white/5 transition-colors flex items-center gap-2"
                            >
                              <UserCheck className="h-3.5 w-3.5" /> Reativar
                            </button>
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

        {/* Paginação com contador */}
        {data && data.paginas > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <span className="text-sm text-slate-500">
              {data.total > 0
                ? `Exibindo ${inicio}–${fim} de ${data.total} clientes`
                : "0 clientes"}
            </span>
            <div className="flex gap-2">
              <button
                disabled={pagina === 1}
                onClick={() => setPagina((p) => p - 1)}
                className="px-3 py-1 text-sm bg-slate-700 rounded disabled:opacity-40 hover:bg-slate-600 transition-colors text-white"
              >
                Anterior
              </button>
              <span className="px-3 py-1 text-sm text-slate-400">{pagina} / {data.paginas}</span>
              <button
                disabled={pagina >= data.paginas}
                onClick={() => setPagina((p) => p + 1)}
                className="px-3 py-1 text-sm bg-slate-700 rounded disabled:opacity-40 hover:bg-slate-600 transition-colors text-white"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-clientes-titulo"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative z-10 w-full max-w-md bg-slate-800 border border-white/10 rounded-xl p-6 shadow-2xl">
            <h2 id="modal-clientes-titulo" className="text-lg font-bold text-white mb-5">
              {modal === "criar" ? "Novo Cliente" : "Editar Cliente"}
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="campo-nome" className="text-sm text-slate-400 mb-1 block">Nome *</label>
                <input
                  id="campo-nome"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Nome completo ou razão social"
                />
              </div>
              <div>
                <label htmlFor="campo-tipo" className="text-sm text-slate-400 mb-1 block">Tipo</label>
                <select
                  id="campo-tipo"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  value={form.tipo}
                  onChange={(e) => setForm((f) => ({ ...f, tipo: e.target.value as "FISICA" | "JURIDICA" }))}
                >
                  <option value="FISICA">Pessoa Física</option>
                  <option value="JURIDICA">Pessoa Jurídica</option>
                </select>
              </div>
              <div>
                <label htmlFor="campo-cpfcnpj" className="text-sm text-slate-400 mb-1 block">CPF / CNPJ</label>
                <input
                  id="campo-cpfcnpj"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  value={form.cpfCnpj}
                  onChange={(e) => setForm((f) => ({ ...f, cpfCnpj: e.target.value }))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <label htmlFor="campo-email" className="text-sm text-slate-400 mb-1 block">E-mail</label>
                <input
                  id="campo-email"
                  type="email"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <label htmlFor="campo-telefone" className="text-sm text-slate-400 mb-1 block">Telefone</label>
                <input
                  id="campo-telefone"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 transition-colors"
                  value={form.telefone}
                  onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
                  placeholder="(11) 99999-0000"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 border border-white/10 text-slate-400 rounded-lg text-sm hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={isSaving}
                className="flex-1 py-2 bg-orange-500 hover:bg-orange-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para fechar menu */}
      {menuAberto && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuAberto(null)} />
      )}
    </div>
  );
}
