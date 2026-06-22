import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@/styles/receipt.css'; // ← TAMBAHKAN INI


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cafe POS System',
  description: 'Point of Sale System untuk Cafe dan Resto',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>{children}</body>
    </html>
  );
}