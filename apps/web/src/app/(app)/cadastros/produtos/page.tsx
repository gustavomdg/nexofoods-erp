import type { Metadata } from "next";
import { ProdutosView } from "./produtos-view";

export const metadata: Metadata = { title: "Produtos" };

export default function ProdutosPage() {
  return <ProdutosView />;
}
