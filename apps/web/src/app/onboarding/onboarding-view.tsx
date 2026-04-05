"use client";

import { OrganizationList } from "@clerk/nextjs";
import { UtensilsCrossed } from "lucide-react";

export function OnboardingView() {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center">
          <UtensilsCrossed className="h-5 w-5 text-slate-900" />
        </div>
        <div>
          <span className="text-white font-bold text-2xl leading-none">Nexo</span>
          <span className="text-amber-400 font-bold text-2xl leading-none">Foods</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-white">Selecione ou crie sua empresa</h1>
        <p className="text-slate-400 text-sm mt-2">
          Cada empresa é um ambiente isolado com seus próprios dados.
        </p>
      </div>

      <OrganizationList
        hidePersonal
        afterCreateOrganizationUrl="/dashboard"
        afterSelectOrganizationUrl="/dashboard"
      />
    </div>
  );
}
