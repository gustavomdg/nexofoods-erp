"use client";

import { UserButton, OrganizationSwitcher } from "@clerk/nextjs";
import { Bell, Home, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";

// Mapa de segmentos de URL para labels legíveis
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  cadastros: "Cadastros",
  clientes: "Clientes",
  fornecedores: "Fornecedores",
  produtos: "Produtos",
  financeiro: "Financeiro",
  "contas-pagar": "Contas a Pagar",
  "contas-receber": "Contas a Receber",
  "fluxo-caixa": "Fluxo de Caixa",
  restaurante: "Restaurante",
  pdv: "PDV",
  salao: "Mesas e Salão",
  kds: "Cozinha (KDS)",
  estoque: "Estoque",
  usuarios: "Usuários",
  configuracoes: "Configurações",
};

export function Topbar() {
  const pathname = usePathname();

  // Gera breadcrumbs a partir do pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => ({
    label: SEGMENT_LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, idx + 1).join("/"),
    isLast: idx === segments.length - 1,
  }));

  return (
    <header
      role="banner"
      className="h-14 border-b border-white/5 bg-slate-900/70 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40"
    >
      {/* Breadcrumb */}
      <div className="lg:ml-0 ml-10 flex items-center gap-1.5 text-sm">
        <Home className="h-3.5 w-3.5 text-slate-500 flex-shrink-0" />
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-slate-600" />
            {crumb.isLast ? (
              <span className="font-semibold text-slate-200">{crumb.label}</span>
            ) : (
              <a
                href={crumb.href}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                {crumb.label}
              </a>
            )}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Org switcher (troca entre empresas/tenants) */}
        <OrganizationSwitcher
          hidePersonal
          appearance={{
            elements: {
              rootBox: "flex items-center",
              organizationSwitcherTrigger:
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:bg-white/5 border border-white/10 transition-colors",
              organizationSwitcherPopoverCard:
                "bg-slate-800 border border-white/10 shadow-2xl",
              organizationSwitcherPopoverActionButton:
                "text-slate-300 hover:bg-slate-700",
              organizationPreviewMainIdentifier: "text-white",
            },
          }}
        />

        {/* Notificações (placeholder) */}
        <button
          aria-label="Ver notificações"
          className="relative p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Bell className="h-5 w-5" />
        </button>

        {/* Avatar do usuário */}
        <UserButton
          appearance={{
            elements: {
              avatarBox: "h-8 w-8 ring-2 ring-white/10",
              userButtonPopoverCard: "bg-slate-800 border border-white/10 shadow-2xl",
              userButtonPopoverActionButton: "text-slate-300 hover:bg-slate-700",
            },
          }}
        />
      </div>
    </header>
  );
}
