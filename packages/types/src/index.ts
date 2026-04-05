/**
 * Enum de módulos do sistema.
 * Espelha o enum `Modulo` do Prisma para uso no front-end sem importar @prisma/client.
 */
export enum Modulo {
  CORE = "CORE",
  RESTAURANTE = "RESTAURANTE",
  DEPOSITO_GAS = "DEPOSITO_GAS",
  AUTOPECAS = "AUTOPECAS",
  ESTETICA = "ESTETICA",
}

/**
 * Permissões disponíveis no sistema (RBAC).
 * Complementa os papéis do Clerk com controle granular de funcionalidades.
 */
export enum Permissao {
  // Core
  VISUALIZAR_DASHBOARD = "VISUALIZAR_DASHBOARD",
  GERENCIAR_CLIENTES = "GERENCIAR_CLIENTES",
  GERENCIAR_FORNECEDORES = "GERENCIAR_FORNECEDORES",
  GERENCIAR_PRODUTOS = "GERENCIAR_PRODUTOS",
  VISUALIZAR_FINANCEIRO = "VISUALIZAR_FINANCEIRO",
  GERENCIAR_FINANCEIRO = "GERENCIAR_FINANCEIRO",
  GERENCIAR_USUARIOS = "GERENCIAR_USUARIOS",
  CONFIGURAR_TENANT = "CONFIGURAR_TENANT",

  // Restaurante
  OPERAR_PDV = "OPERAR_PDV",
  GERENCIAR_MESAS = "GERENCIAR_MESAS",
  VISUALIZAR_KDS = "VISUALIZAR_KDS",
  GERENCIAR_ESTOQUE = "GERENCIAR_ESTOQUE",
}

/**
 * Papéis padrão mapeados para permissões.
 * No Clerk, papéis são definidos por organização.
 */
export const PERMISSOES_POR_PAPEL: Record<string, Permissao[]> = {
  admin: Object.values(Permissao), // Admin tem tudo
  gerente: [
    Permissao.VISUALIZAR_DASHBOARD,
    Permissao.GERENCIAR_CLIENTES,
    Permissao.GERENCIAR_FORNECEDORES,
    Permissao.GERENCIAR_PRODUTOS,
    Permissao.VISUALIZAR_FINANCEIRO,
    Permissao.GERENCIAR_FINANCEIRO,
    Permissao.GERENCIAR_MESAS,
    Permissao.OPERAR_PDV,
    Permissao.GERENCIAR_ESTOQUE,
  ],
  operador: [
    Permissao.VISUALIZAR_DASHBOARD,
    Permissao.OPERAR_PDV,
    Permissao.GERENCIAR_MESAS,
    Permissao.VISUALIZAR_KDS,
  ],
  cozinheiro: [
    Permissao.VISUALIZAR_KDS,
  ],
};

/**
 * Configuração de navegação por módulo.
 * A sidebar usa isso para renderizar apenas as seções ativas para o tenant.
 */
export interface NavItem {
  label: string;
  href: string;
  icon: string; // nome do ícone Lucide
  modulo: Modulo;
  permissao?: Permissao;
  children?: NavItem[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: "LayoutDashboard",
    modulo: Modulo.CORE,
    permissao: Permissao.VISUALIZAR_DASHBOARD,
  },
  {
    label: "Cadastros",
    href: "/cadastros",
    icon: "Database",
    modulo: Modulo.CORE,
    children: [
      { label: "Clientes", href: "/cadastros/clientes", icon: "Users", modulo: Modulo.CORE, permissao: Permissao.GERENCIAR_CLIENTES },
      { label: "Fornecedores", href: "/cadastros/fornecedores", icon: "Building2", modulo: Modulo.CORE, permissao: Permissao.GERENCIAR_FORNECEDORES },
      { label: "Produtos", href: "/cadastros/produtos", icon: "Package", modulo: Modulo.CORE, permissao: Permissao.GERENCIAR_PRODUTOS },
    ],
  },
  {
    label: "Financeiro",
    href: "/financeiro",
    icon: "Wallet",
    modulo: Modulo.CORE,
    permissao: Permissao.VISUALIZAR_FINANCEIRO,
    children: [
      { label: "Contas a Pagar", href: "/financeiro/contas-pagar", icon: "TrendingDown", modulo: Modulo.CORE },
      { label: "Contas a Receber", href: "/financeiro/contas-receber", icon: "TrendingUp", modulo: Modulo.CORE },
      { label: "Fluxo de Caixa", href: "/financeiro/fluxo-caixa", icon: "BarChart3", modulo: Modulo.CORE },
    ],
  },
  {
    label: "Restaurante",
    href: "/restaurante",
    icon: "UtensilsCrossed",
    modulo: Modulo.RESTAURANTE,
    children: [
      { label: "PDV", href: "/restaurante/pdv", icon: "ShoppingCart", modulo: Modulo.RESTAURANTE, permissao: Permissao.OPERAR_PDV },
      { label: "Mesas e Salão", href: "/restaurante/salao", icon: "LayoutGrid", modulo: Modulo.RESTAURANTE, permissao: Permissao.GERENCIAR_MESAS },
      { label: "Cozinha (KDS)", href: "/restaurante/kds", icon: "ChefHat", modulo: Modulo.RESTAURANTE, permissao: Permissao.VISUALIZAR_KDS },
      { label: "Estoque", href: "/restaurante/estoque", icon: "PackageSearch", modulo: Modulo.RESTAURANTE, permissao: Permissao.GERENCIAR_ESTOQUE },
    ],
  },
  {
    label: "Usuários",
    href: "/usuarios",
    icon: "UserCog",
    modulo: Modulo.CORE,
    permissao: Permissao.GERENCIAR_USUARIOS,
  },
  {
    label: "Configurações",
    href: "/configuracoes",
    icon: "Settings",
    modulo: Modulo.CORE,
    permissao: Permissao.CONFIGURAR_TENANT,
  },
];
