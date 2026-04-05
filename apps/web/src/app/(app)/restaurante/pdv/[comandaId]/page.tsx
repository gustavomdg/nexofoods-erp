import type { Metadata } from "next";
import { PDVView } from "./pdv-view";

export const metadata: Metadata = { title: "PDV — Comanda" };

export default function PDVPage({ params }: { params: { comandaId: string } }) {
  return <PDVView comandaId={params.comandaId} />;
}
