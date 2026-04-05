"use client";

import { OrganizationProfile } from "@clerk/nextjs";
import { UserCog } from "lucide-react";

export function UsuariosView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <UserCog className="h-6 w-6 text-amber-400" /> Usuários
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie os membros e papéis da sua organização
        </p>
      </div>

      <div className="[&_.cl-card]:bg-slate-800 [&_.cl-card]:border-slate-700 [&_.cl-rootBox]:w-full">
        <OrganizationProfile
          appearance={{
            variables: {
              colorBackground: "#1e293b",
              colorInputBackground: "#0f172a",
              colorText: "#f8fafc",
              colorTextSecondary: "#94a3b8",
              colorPrimary: "#f59e0b",
              borderRadius: "0.75rem",
            },
            elements: {
              card: "bg-slate-800 border-slate-700 shadow-none",
              navbar: "bg-slate-800/50 border-slate-700",
              navbarButton: "text-slate-400 hover:text-white",
              navbarButtonActive: "text-white bg-slate-700",
            },
          }}
        />
      </div>
    </div>
  );
}
