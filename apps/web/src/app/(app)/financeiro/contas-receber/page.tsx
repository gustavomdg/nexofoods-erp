import type { Metadata } from "next";
import { ContasReceberView } from "./contas-receber-view";

export const metadata: Metadata = { title: "Contas a Receber" };

export default function ContasReceberPage() {
  return <ContasReceberView />;
}
