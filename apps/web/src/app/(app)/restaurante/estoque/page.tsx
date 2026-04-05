import type { Metadata } from "next";
import { EstoqueView } from "./estoque-view";

export const metadata: Metadata = { title: "Estoque" };

export default function EstoquePage() {
  return <EstoqueView />;
}
