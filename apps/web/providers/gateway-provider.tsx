'use client';

import {
  DemoGateway,
  GatewayError,
  INITIAL_DEMO_STATE,
  type TicketingGateway,
} from '@centlalia/client';
import { createContext, useContext, useState, useSyncExternalStore, type ReactNode } from 'react';

interface Notice {
  kind: 'success' | 'error';
  text: string;
  signature?: string;
  nonce: number;
}

interface GatewayContextValue {
  gateway: TicketingGateway;
  state: ReturnType<TicketingGateway['getSnapshot']>;
  notice?: Notice;
  pending: boolean;
  execute(
    operation: () => ReturnType<TicketingGateway['reset']>,
    success: string,
  ): Promise<boolean>;
}

const GatewayContext = createContext<GatewayContextValue | null>(null);

function describeError(error: unknown): string {
  if (error instanceof GatewayError) return error.message;
  if (error instanceof Error) return error.message;
  return 'No pudimos completar la operación.';
}

export function GatewayProvider({ children }: { children: ReactNode }) {
  const [gateway] = useState(() => new DemoGateway());
  const state = useSyncExternalStore(
    gateway.subscribe,
    gateway.getSnapshot,
    () => INITIAL_DEMO_STATE,
  );
  const [notice, setNotice] = useState<Notice>();
  const [pending, setPending] = useState(false);

  async function execute(
    operation: () => ReturnType<TicketingGateway['reset']>,
    success: string,
  ): Promise<boolean> {
    if (pending) return false;
    setPending(true);
    try {
      const result = await operation();
      setNotice({ kind: 'success', text: success, signature: result.signature, nonce: Date.now() });
      return true;
    } catch (error) {
      setNotice({ kind: 'error', text: describeError(error), nonce: Date.now() });
      return false;
    } finally {
      setPending(false);
    }
  }

  return (
    <GatewayContext.Provider value={{ gateway, state, notice, pending, execute }}>
      {children}
    </GatewayContext.Provider>
  );
}

export function useGateway(): GatewayContextValue {
  const value = useContext(GatewayContext);
  if (!value) throw new Error('useGateway must be used inside GatewayProvider');
  return value;
}
