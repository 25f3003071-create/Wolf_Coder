'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldCheck, Wallet, LogOut, User } from 'lucide-react';
import { Button } from './Button';
import { WalletConnectModal } from '@/components/web3/WalletConnect';
import { getSession, clearSession, ClientSession } from '@/lib/auth/client-session';

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [session, setSession] = useState<ClientSession | null>(null);

  useEffect(() => {
    setSession(getSession());
  }, [pathname]);

  const handleLogout = () => {
    clearSession();
    setSession(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('relieftrack_target_role');
    }
    router.push('/');
  };

  // Hide top header entirely on root role selection, login, and register screens
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return null;
  }

  // Determine active brand redirect based on session role
  const getBrandHome = () => {
    if (!session) return '/';
    if (session.role === 'DONOR') return '/donor';
    if (session.role === 'NGO') return '/ngo';
    if (session.role === 'MANAGER') return '/manager';
    return '/';
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href={getBrandHome()} className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-900/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">
                Relief<span className="text-emerald-400">Track</span>
              </span>
              <span className="block text-[10px] text-emerald-400/90 tracking-wider uppercase font-semibold">Web3 Relief Protocol</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            {session && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <strong className="text-slate-200">{session.role}</strong>
                </span>

                <Button variant="outline" size="sm" icon={<LogOut className="w-3.5 h-3.5" />} onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            )}

            <Button
              variant={connectedWallet ? 'secondary' : 'primary'}
              size="sm"
              icon={<Wallet className="w-4 h-4 text-emerald-400" />}
              onClick={() => setIsWalletOpen(true)}
            >
              {connectedWallet
                ? `${connectedWallet.substring(0, 6)}...${connectedWallet.substring(connectedWallet.length - 4)}`
                : 'Connect Wallet'}
            </Button>
          </div>
        </div>
      </header>

      <WalletConnectModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        onConnect={(addr: any) => {
          setConnectedWallet(addr);
          setIsWalletOpen(false);
        }}
      />
    </>
  );
};
