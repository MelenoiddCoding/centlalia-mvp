'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

const navigation = [
  { href: '/events', label: 'Marketplace' },
  { href: '/tickets', label: 'Mis boletos' },
  { href: '/organizer/events', label: 'Mis eventos' },
  { href: '/organizer/events/new', label: 'Crear evento' },
  { href: '/staff', label: 'Staff' },
  { href: '/validation', label: 'Validación' },
] as const;

function isActiveNavigation(pathname: string, href: (typeof navigation)[number]['href']) {
  if (href === '/events') return pathname.startsWith('/events');
  if (href === '/organizer/events') {
    return pathname.startsWith('/organizer/events') && pathname !== '/organizer/events/new';
  }
  return pathname === href;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { wallets, wallet, connect, changeWallet, pending, notice } = useSolanaApp();
  const [walletName, setWalletName] = useState('');

  if (pathname === '/demo') return children;

  const selectedWallet = walletName || wallets[0]?.name || '';

  return (
    <div className="product-shell">
      <header className="product-header">
        <Link className="wordmark" href="/" aria-label="Centlalia, inicio">
          <span aria-hidden="true">C</span>
          <strong>Centlalia</strong>
        </Link>
        <nav aria-label="Navegación principal">
          {navigation.map((item) => (
            <Link
              aria-current={isActiveNavigation(pathname, item.href) ? 'page' : undefined}
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="header-wallet">
          {wallet ? (
            <button onClick={changeWallet} type="button">
              <i aria-hidden="true" />
              {shortAddress(wallet.address)}
            </button>
          ) : wallets.length ? (
            <>
              <select
                aria-label="Wallet detectada"
                onChange={(event) => setWalletName(event.target.value)}
                value={selectedWallet}
              >
                {wallets.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
              <button
                disabled={Boolean(pending)}
                onClick={() => void connect(selectedWallet)}
                type="button"
              >
                Conectar
              </button>
            </>
          ) : (
            <span>Wallet no detectada</span>
          )}
        </div>
      </header>
      {notice ? (
        <div
          className={`product-notice ${notice.kind}`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          <span>{notice.text}</span>
          {notice.signature ? (
            <a
              href={`https://explorer.solana.com/tx/${notice.signature}?cluster=devnet`}
              rel="noreferrer"
              target="_blank"
            >
              Ver transacción
            </a>
          ) : null}
        </div>
      ) : null}
      <main className="product-main">{children}</main>
      <footer className="product-footer">
        <span>Centlalia · Solana devnet</span>
        <span>MVP técnico, sin fondos reales</span>
      </footer>
    </div>
  );
}
