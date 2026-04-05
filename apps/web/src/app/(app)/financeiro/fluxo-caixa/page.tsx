import type { Metadata } from "next";
import { FluxoCaixaView } from "./fluxo-caixa-view";

export const metadata: Metadata = { title: "Fluxo de Caixa" };

export default function FluxoCaixaPage() {
  return <FluxoCaixaView />;
}
