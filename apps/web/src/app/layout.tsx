import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCReactProvider } from "@/components/providers/trpc-provider";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "NexoFoods",
    template: "%s | NexoFoods",
  },
  description: "NexoFoods — ERP completo para Restaurantes e Food Service. Gestão de mesas, PDV, KDS, estoque e financeiro em um só lugar.",
  keywords: ["ERP", "restaurante", "PDV", "gestão", "food service", "comanda"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" suppressHydrationWarning className={cn("font-sans", geist.variable)}>
        <body className={`${inter.variable} font-sans antialiased`}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
