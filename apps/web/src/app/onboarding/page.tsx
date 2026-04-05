import type { Metadata } from "next";
import { OnboardingView } from "./onboarding-view";

export const metadata: Metadata = { title: "Configurar Empresa — NexoFoods" };

export default function OnboardingPage() {
  return <OnboardingView />;
}
