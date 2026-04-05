import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Criar Conta" };

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Nexo<span className="text-amber-400">Foods</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Crie sua conta e comece agora</p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: "shadow-2xl",
              card: "bg-slate-800 border border-slate-700 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              formFieldLabel: "text-slate-300",
              formFieldInput:
                "bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-amber-400",
              formButtonPrimary:
                "bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold",
              footerActionLink: "text-amber-400 hover:text-amber-300",
            },
          }}
        />
      </div>
    </div>
  );
}
