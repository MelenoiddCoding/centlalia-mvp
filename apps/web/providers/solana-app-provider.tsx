'use client';

import {
  CodamaProgramAdapter,
  connectWalletStandard,
  listCompatibleWallets,
  subscribeCompatibleWallets,
  type SolanaWalletBridge,
  type WalletDescriptor,
} from '@centlalia/client';
import { useCallback, createContext, useContext, useEffect, useState, type ReactNode } from 'react';

const DEVNET_RPC = 'https://api.devnet.solana.com';

export type CatalogEvent = Awaited<ReturnType<CodamaProgramAdapter['listEvents']>>[number];
export type CatalogTier = Awaited<ReturnType<CodamaProgramAdapter['listTiers']>>[number];
export type CatalogTicket = Awaited<ReturnType<CodamaProgramAdapter['listTicketRecords']>>[number];

interface AppNotice {
  kind: 'success' | 'error';
  text: string;
  signature?: string;
}

interface SolanaAppContextValue {
  adapter: CodamaProgramAdapter;
  events: CatalogEvent[];
  tiers: CatalogTier[];
  tickets: CatalogTicket[];
  loading: boolean;
  pending?: string;
  notice?: AppNotice;
  wallets: WalletDescriptor[];
  wallet?: SolanaWalletBridge;
  connect(walletName: string): Promise<void>;
  changeWallet(): void;
  refresh(): Promise<void>;
  execute(label: string, operation: () => Promise<string>): Promise<string | undefined>;
}

const SolanaAppContext = createContext<SolanaAppContextValue | null>(null);

export function SolanaAppProvider({ children }: { children: ReactNode }) {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEVNET_RPC;
  const [adapter] = useState(() => new CodamaProgramAdapter({ rpcUrl }));
  const [events, setEvents] = useState<CatalogEvent[]>([]);
  const [tiers, setTiers] = useState<CatalogTier[]>([]);
  const [tickets, setTickets] = useState<CatalogTicket[]>([]);
  const [wallets, setWallets] = useState<WalletDescriptor[]>([]);
  const [wallet, setWallet] = useState<SolanaWalletBridge>();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string>();
  const [notice, setNotice] = useState<AppNotice>();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [nextEvents, nextTiers, nextTickets] = await Promise.all([
        adapter.listEvents(),
        adapter.listTiers(),
        adapter.listTicketRecords(),
      ]);
      setEvents(nextEvents.sort((a, b) => Number(b.data.startsAt - a.data.startsAt)));
      setTiers(nextTiers);
      setTickets(nextTickets.sort((a, b) => Number(b.data.createdAt - a.data.createdAt)));
    } catch (error) {
      setNotice({
        kind: 'error',
        text: error instanceof Error ? error.message : 'No fue posible leer Solana devnet.',
      });
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    let active = true;
    const updateWallets = () => {
      if (active) setWallets(listCompatibleWallets());
    };
    const unsubscribe = subscribeCompatibleWallets(() => queueMicrotask(updateWallets));
    queueMicrotask(updateWallets);
    queueMicrotask(() => {
      if (active) void refresh();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [refresh]);

  async function connect(walletName: string) {
    setPending('Conectando wallet');
    setNotice(undefined);
    try {
      const next = await connectWalletStandard(walletName);
      adapter.setWallet(next);
      setWallet(next);
    } catch (error) {
      setNotice({
        kind: 'error',
        text: error instanceof Error ? error.message : 'No fue posible conectar la wallet.',
      });
    } finally {
      setPending(undefined);
    }
  }

  function changeWallet() {
    adapter.setWallet(undefined);
    setWallet(undefined);
  }

  async function execute(label: string, operation: () => Promise<string>) {
    if (pending) return undefined;
    setPending(label);
    setNotice(undefined);
    try {
      const signature = await operation();
      setNotice({ kind: 'success', text: `${label} confirmado en devnet.`, signature });
      await refresh();
      return signature;
    } catch (error) {
      setNotice({
        kind: 'error',
        text: error instanceof Error ? error.message : 'La operación fue rechazada.',
      });
      return undefined;
    } finally {
      setPending(undefined);
    }
  }

  return (
    <SolanaAppContext.Provider
      value={{
        adapter,
        events,
        tiers,
        tickets,
        loading,
        pending,
        notice,
        wallets,
        wallet,
        connect,
        changeWallet,
        refresh,
        execute,
      }}
    >
      {children}
    </SolanaAppContext.Provider>
  );
}

export function useSolanaApp(): SolanaAppContextValue {
  const value = useContext(SolanaAppContext);
  if (!value) throw new Error('useSolanaApp must be used inside SolanaAppProvider');
  return value;
}
