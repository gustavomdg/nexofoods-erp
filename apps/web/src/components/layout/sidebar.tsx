"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, Database, Users, Building2, Package,
  Wallet, TrendingDown, TrendingUp, BarChart3,
  UtensilsCrossed, ShoppingCart, LayoutGrid, ChefHat,
  PackageSearch, UserCog, Settings, ChevronDown, ChevronRight,
  Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, Modulo } from "@gastrosys/types";
import type { NavItem } from "@gastrosys/types";

// Map de ícones Lucide por nome string
const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Database, Users, Building2, Package,
  Wallet, TrendingDown, TrendingUp, BarChart3,
  UtensilsCrossed, ShoppingCart, LayoutGrid, ChefHat,
  PackageSearch, UserCog, Settings,
};

// Agrupamento de itens de navegação por seção
const NAV_SECTIONS = [
  {
    label: "Principal",
    moduloMatch: [Modulo.CORE],
    hrefPrefixes: ["/dashboard"],
  },
  {
    label: "Restaurante",
    moduloMatch: [Modulo.RESTAURANTE],
    hrefPrefixes: ["/restaurante"],
  },
  {
    label: "Cadastros",
    moduloMatch: [Modulo.CORE],
    hrefPrefixes: ["/cadastros"],
  },
  {
    label: "Financeiro",
    moduloMatch: [Modulo.CORE],
    hrefPrefixes: ["/financeiro"],
  },
  {
    label: "Administração",
    moduloMatch: [Modulo.CORE],
    hrefPrefixes: ["/usuarios", "/configuracoes"],
  },
];

interface SidebarProps {
  /** Módulos ativos para o tenant atual */
  modulosAtivos: Modulo[];
}

function NavLink({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const Icon = iconMap[item.icon] ?? Package;
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          aria-label={`${item.label} — expandir submenu`}
          aria-expanded={expanded}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
            "text-slate-400 hover:text-white hover:bg-white/5",
            isActive && "text-white bg-white/5",
            depth > 0 && "pl-8"
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {expanded ? (
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
          )}
        </button>
        {expanded && (
          <div className="mt-0.5 space-y-0.5">
            {item.children!.map((child) => (
              <NavLink key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
        "text-slate-400 hover:text-white hover:bg-white/5",
        isActive && "text-white bg-orange-500/15 border border-orange-500/25 !text-orange-400",
        depth > 0 && "pl-8"
      )}
    >
      <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-orange-400")} />
      <span>{item.label}</span>
    </Link>
  );
}

export function Sidebar({ modulosAtivos }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) =>
    modulosAtivos.includes(item.modulo)
  );

  // Agrupa itens por seção de acordo com o prefixo do href
  function getItemsForSection(hrefPrefixes: string[]) {
    return visibleItems.filter((item) =>
      hrefPrefixes.some((prefix) => item.href.startsWith(prefix))
    );
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <UtensilsCrossed className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-lg leading-none">Nexo</span>
            <span className="text-orange-400 font-bold text-lg leading-none">Foods</span>
          </div>
        </Link>
      </div>

      {/* Navegação agrupada por seção */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {NAV_SECTIONS.map((section) => {
          const items = getItemsForSection(section.hrefPrefixes);
          // Só renderiza a seção se tiver itens visíveis
          if (items.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-600 select-none">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {items.map((item) => (
                  <NavLink key={item.href} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Versão */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-xs text-slate-700">NexoFoods v1.0</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-slate-800/50 border-r border-white/5 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile: botão flutuante */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu de navegação"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-800 border border-white/10 text-white shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile Overlay com animação */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-60 bg-slate-800 border-r border-white/5 h-full z-10 sidebar-slide-in">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Fechar menu de navegação"
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
