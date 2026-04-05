import type { Metadata } from "next";
import { FornecedoresView } from "./fornecedores-view";

export const metadata: Metadata = { title: "Fornecedores" };

export default function FornecedoresPage() {
  return <FornecedoresView />;
}
