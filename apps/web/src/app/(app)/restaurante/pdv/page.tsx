import { redirect } from "next/navigation";

// O PDV acessa uma comanda específica via /restaurante/pdv/[comandaId]
// Esta página redireciona para o salão onde as comandas são abertas
export default function PDVIndexPage() {
  redirect("/restaurante/salao");
}
