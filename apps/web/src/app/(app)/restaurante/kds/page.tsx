import type { Metadata } from "next";
import { KDSView } from "./kds-view";

export const metadata: Metadata = { title: "Cozinha — KDS" };

export default function KDSPage() {
  return <KDSView />;
}
