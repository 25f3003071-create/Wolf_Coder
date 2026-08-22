import './globals.css';
import type { Metadata } from 'next';
import { Navbar } from '@/components/ui/Navbar';
import { Footer } from '@/components/ui/Footer';

export const metadata: Metadata = {
  title: 'ReliefTrack — Blockchain Emergency Relief & Donation Tracking',
  description: 'Track the complete real-time journey of every emergency relief donation on public blockchains.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
