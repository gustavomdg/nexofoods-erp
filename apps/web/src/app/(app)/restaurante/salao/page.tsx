import type { Metadata } from "next";
import { SalaoView } from "./salao-view";

export const metadata: Metadata = { title: "Mesas e Salão" };

export default function SalaoPage() {
  return <SalaoView />;
}
