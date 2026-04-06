export const dynamic = "force-dynamic";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@gastrosys/db";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { Modulo } from "@gastrosys/types";

/**
 * Layout protegido: envolve todas as rotas do app com Sidebar + Topbar.
 * Busca os módulos ativos do tenant para renderizar a sidebar corretamente.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId, orgId } = await auth();

  // Redireciona se não autenticado
  if (!userId) redirect("/sign-in");

  // Se não tem org selecionada, redireciona para criação/seleção
  if (!orgId) redirect("/onboarding");

  // Busca o tenant e seus módulos ativos
  let modulosAtivos: Modulo[] = [Modulo.CORE];

  try {
    const tenant = await prisma.tenant.findUnique({
      where: { clerkOrgId: orgId },
      include: { modulos: { where: { ativo: true } } },
    });

    if (tenant) {
      modulosAtivos = tenant.modulos.map((m) => m.modulo as Modulo);
      // Garante que CORE sempre está presente
      if (!modulosAtivos.includes(Modulo.CORE)) {
        modulosAtivos.unshift(Modulo.CORE);
      }
    }
  } catch {
    // Em caso de erro de DB (ex: primeira execução sem migration), usa apenas CORE
    modulosAtivos = [Modulo.CORE, Modulo.RESTAURANTE];
  }

  return (
    <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
      <Sidebar modulosAtivos={modulosAtivos} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

