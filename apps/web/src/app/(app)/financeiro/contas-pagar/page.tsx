import type { Metadata } from "next";
import { ContasPagarView } from "./contas-pagar-view";

export const metadata: Metadata = { title: "Contas a Pagar" };

export default function ContasPagarPage() {
  return <ContasPagarView />;
}
