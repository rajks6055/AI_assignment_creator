import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VedaAI",
  description: "AI Assessment Creator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Ensure no extra divs or Sidebars are wrapping {children} here! */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}