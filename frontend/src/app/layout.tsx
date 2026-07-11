import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ContractProvider } from "@/context/ContractContext";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Midnight Vault | Privacy Lives Here",
  description: "Privacy-preserving identity verification platform using Midnight Compact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AnimatedBackground />
        <WalletProvider>
          <ContractProvider>
            {children}
          </ContractProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
