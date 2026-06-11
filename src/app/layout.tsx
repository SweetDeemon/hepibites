import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HepiBites - Manajemen Penjualan Snack",
  description: "Sistem manajemen penjualan snack HepiBites — Kelola mitra, transaksi, stok, dan laporan dengan mudah.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased scrollbar-thin">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
