'use client';

import {
  CodamaProgramAdapter,
  connectWalletStandard,
  listCompatibleWallets,
  subscribeCompatibleWallets,
  type ProgramDiagnostic,
  type WalletDescriptor,
} from '@centlalia/client';
import { useEffect, useState } from 'react';

const DEVNET_RPC = 'https://api.devnet.solana.com';

const statusCopy: Record<ProgramDiagnostic['availability'], string> = {
  ready: 'Programa ejecutable',
  missing: 'Programa no desplegado',
  'not-executable': 'Cuenta no ejecutable',
  'rpc-error': 'RPC no disponible',
};

export function SolanaDiagnostic() {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEVNET_RPC;
  const [adapter] = useState(() => new CodamaProgramAdapter({ rpcUrl }));
  const [diagnostic, setDiagnostic] = useState<ProgramDiagnostic>();
  const [wallets, setWallets] = useState<WalletDescriptor[]>([]);
  const [selectedWallet, setSelectedWallet] = useState('');
  const [connected, setConnected] = useState<{ name: string; address: string }>();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string>();

  async function checkProgram() {
    setPending(true);
    const result = await adapter.diagnose();
    setDiagnostic(result);
    setPending(false);
  }

  useEffect(() => {
    let active = true;
    const refreshWallets = () => {
      if (!active) return;
      const next = listCompatibleWallets();
      setWallets(next);
    };
    const unsubscribe = subscribeCompatibleWallets(() => queueMicrotask(refreshWallets));
    queueMicrotask(refreshWallets);
    void adapter.diagnose().then((result) => {
      if (active) setDiagnostic(result);
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [adapter]);

  const walletName = selectedWallet || wallets[0]?.name || '';
  async function connect() {
    if (!walletName) return;
    setPending(true);
    setError(undefined);
    try {
      const wallet = await connectWalletStandard(walletName);
      adapter.setWallet(wallet);
      setConnected({ name: wallet.name, address: wallet.address });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible conectar la wallet.');
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="solana-diagnostic" aria-labelledby="solana-diagnostic-heading">
      <div className="section-kicker">
        <span id="solana-diagnostic-heading">Conexión real · devnet</span>
        <span>Modo activo: Demo local</span>
      </div>
      <div className="diagnostic-grid">
        <div className="diagnostic-program">
          <p className="diagnostic-label">Programa Codama</p>
          <code>{adapter.programAddress}</code>
          <strong
            className={diagnostic?.availability === 'ready' ? 'status-ready' : 'status-blocked'}
          >
            {diagnostic ? statusCopy[diagnostic.availability] : 'Comprobando RPC…'}
          </strong>
          <p>{diagnostic?.detail ?? 'Consultando el program account en Solana devnet.'}</p>
          <button
            className="text-button dark-text"
            disabled={pending}
            onClick={() => void checkProgram()}
            type="button"
          >
            Volver a comprobar
          </button>
        </div>

        <div className="diagnostic-wallet">
          <p className="diagnostic-label">Wallet Standard</p>
          {connected ? (
            <>
              <strong>{connected.name}</strong>
              <code>{connected.address}</code>
            </>
          ) : wallets.length > 0 ? (
            <>
              <label htmlFor="wallet-select">Wallet detectada</label>
              <select
                id="wallet-select"
                onChange={(event) => setSelectedWallet(event.target.value)}
                value={walletName}
              >
                {wallets.map((wallet) => (
                  <option key={wallet.name} value={wallet.name}>
                    {wallet.name}
                  </option>
                ))}
              </select>
              <button
                className="secondary-action"
                disabled={pending}
                onClick={() => void connect()}
                type="button"
              >
                Conectar wallet
              </button>
            </>
          ) : (
            <p>No se detectó una wallet con firma de transacciones Solana v0.</p>
          )}
          {error ? (
            <p className="diagnostic-error" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <dl className="diagnostic-checklist">
          <div>
            <dt>Lectura RPC</dt>
            <dd>{diagnostic ? 'Real' : 'Pendiente'}</dd>
          </div>
          <div>
            <dt>Builders Codama</dt>
            <dd>11 operaciones</dd>
          </div>
          <div>
            <dt>Firma y envío</dt>
            <dd>Expuesto en la vertical</dd>
          </div>
        </dl>
      </div>
      <p className="diagnostic-disclaimer">
        La consola superior envía transacciones reales. La mesa de roles permanece como simulación
        local y no se considera evidencia on-chain.
      </p>
    </section>
  );
}
