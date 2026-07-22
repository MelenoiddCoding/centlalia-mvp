'use client';

import {
  CodamaProgramAdapter,
  connectWalletStandard,
  generated,
  listCompatibleWallets,
  subscribeCompatibleWallets,
  type SolanaWalletBridge,
  type WalletDescriptor,
} from '@centlalia/client';
import { address, type Address } from '@solana/kit';
import { useEffect, useState } from 'react';

const DEVNET_RPC = 'https://api.devnet.solana.com';
const STORAGE_KEY = 'centlalia-onchain-proof-v1';
const TICKET_PRICE = 10_000_000n;

interface VerticalProof {
  organizer?: string;
  holder?: string;
  staff?: string;
  treasury?: string;
  event?: string;
  tier?: string;
  ticket?: string;
  asset?: string;
  intent?: string;
  setupSignature?: string;
  purchaseSignature?: string;
  presentSignature?: string;
  consumeSignature?: string;
  duplicateRejected?: boolean;
}

function explorer(value: string, kind: 'address' | 'tx' = 'address') {
  return `https://explorer.solana.com/${kind}/${value}?cluster=devnet`;
}

function parseAddress(value: string, label: string): Address {
  try {
    return address(value.trim());
  } catch {
    throw new Error(`${label} no es una direccion Solana valida.`);
  }
}

function short(value?: string) {
  return value ? `${value.slice(0, 5)}...${value.slice(-5)}` : 'Pendiente';
}

export function OnchainVertical() {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEVNET_RPC;
  const [adapter] = useState(() => new CodamaProgramAdapter({ rpcUrl }));
  const [wallets, setWallets] = useState<WalletDescriptor[]>([]);
  const [walletName, setWalletName] = useState('');
  const [wallet, setWallet] = useState<SolanaWalletBridge>();
  const [staffInput, setStaffInput] = useState('');
  const [proof, setProof] = useState<VerticalProof>({});
  const [pending, setPending] = useState<string>();
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string }>();

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      try {
        const next = JSON.parse(saved) as VerticalProof;
        setProof(next);
        setStaffInput(next.staff ?? '');
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    });
    const refresh = () => setWallets(listCompatibleWallets());
    const unsubscribe = subscribeCompatibleWallets(() => queueMicrotask(refresh));
    queueMicrotask(refresh);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  function save(next: VerticalProof) {
    setProof(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function run(label: string, operation: () => Promise<void>) {
    setPending(label);
    setMessage(undefined);
    try {
      await operation();
      setMessage({ kind: 'ok', text: `${label}: evidencia confirmada en devnet.` });
    } catch (error) {
      setMessage({
        kind: 'error',
        text: error instanceof Error ? error.message : 'La operacion fue rechazada.',
      });
    } finally {
      setPending(undefined);
    }
  }

  async function connect() {
    const selected = walletName || wallets[0]?.name;
    if (!selected) return;
    await run('Conexion', async () => {
      const next = await connectWalletStandard(selected);
      adapter.setWallet(next);
      setWallet(next);
    });
  }

  function changeWallet() {
    adapter.setWallet(undefined);
    setWallet(undefined);
    setMessage(undefined);
  }

  async function setup() {
    await run('Emision', async () => {
      if (!wallet) throw new Error('Conecta la wallet del organizador.');
      const staff = parseAddress(staffInput, 'Staff');
      if (staff === wallet.address) throw new Error('Staff debe usar una wallet distinta.');
      const platform = await adapter.fetchPlatformConfig();
      if (!platform.exists) throw new Error('PlatformConfig no existe en devnet.');
      if (platform.data.assetStandard !== generated.AssetStandard.MplCore) {
        throw new Error('El programa desplegado aun no esta habilitado para MPL Core.');
      }

      const now = BigInt(Math.floor(Date.now() / 1000));
      const eventId = BigInt(Date.now());
      const [event] = await generated.findEventPda({ organizer: wallet.address, eventId });
      const [tier] = await generated.findTierPda({ event, tierId: 0 });
      const metadataUri = `${window.location.origin}/api/metadata/event`;
      const create = await adapter.buildCreateEvent({
        eventId,
        details: {
          title: 'Validacion Centlalia',
          metadataUri,
          salesStartAt: now - 60n,
          salesEndAt: now + 3_600n,
          startsAt: now + 3_600n,
          endsAt: now + 7_200n,
          checkInStartAt: now - 60n,
          checkInEndAt: now + 3_600n,
          maxResaleMarkupBps: 0,
          organizerRoyaltyBps: 0,
          resaleEnabled: false,
        },
      });
      const addTier = await adapter.buildAddTier({
        event,
        tierId: 0,
        name: 'Acceso general',
        priceLamports: TICKET_PRICE,
        supply: 20,
      });
      const publish = await adapter.buildPublishEvent({ event });
      const authorize = await adapter.buildAuthorizeStaff({ event, staff });
      const signature = await adapter.sendInstructions([create, addTier, publish, authorize]);
      await adapter.waitForAccount(event);
      save({
        organizer: wallet.address,
        staff,
        treasury: platform.data.treasury,
        event,
        tier,
        setupSignature: signature,
      });
    });
  }

  async function purchase() {
    await run('Compra', async () => {
      if (!wallet) throw new Error('Conecta la wallet del asistente.');
      if (!proof.event || !proof.tier || !proof.organizer || !proof.treasury) {
        throw new Error('Primero crea y publica el evento.');
      }
      if (wallet.address === proof.organizer || wallet.address === proof.staff) {
        throw new Error('El holder debe ser una tercera wallet independiente.');
      }
      const event = parseAddress(proof.event, 'Evento');
      const [ticket] = await generated.findTicketRecordPda({ event, ticketId: 0n });
      const [asset] = await generated.findCoreAssetPda({ ticketRecord: ticket });
      const instruction = await adapter.buildPrimaryPurchaseCore({
        event,
        tier: parseAddress(proof.tier, 'Tier'),
        organizer: parseAddress(proof.organizer, 'Organizador'),
        treasury: parseAddress(proof.treasury, 'Tesoreria'),
        ticketId: 0n,
      });
      const signature = await adapter.sendInstructions([instruction]);
      await adapter.waitForAccount(asset);
      save({ ...proof, holder: wallet.address, ticket, asset, purchaseSignature: signature });
    });
  }

  async function present() {
    await run('Presentacion', async () => {
      if (!wallet || wallet.address !== proof.holder) {
        throw new Error('Conecta la misma wallet holder que compro el activo.');
      }
      if (!proof.event || !proof.ticket || !proof.asset)
        throw new Error('No existe ticket comprado.');
      const ticket = parseAddress(proof.ticket, 'Ticket');
      const [intent] = await generated.findCheckInIntentPda({
        ticketRecord: ticket,
        intentNonce: 0n,
      });
      const instruction = await adapter.buildPresentCheckInCore({
        event: parseAddress(proof.event, 'Evento'),
        ticketRecord: ticket,
        coreAsset: parseAddress(proof.asset, 'Activo'),
        intentNonce: 0n,
        expiresAt: BigInt(Math.floor(Date.now() / 1000) + 240),
      });
      const signature = await adapter.sendInstructions([instruction]);
      await adapter.waitForAccount(intent);
      save({ ...proof, intent, presentSignature: signature });
    });
  }

  async function consume(duplicate = false) {
    await run(duplicate ? 'Segundo check-in rechazado' : 'Check-in', async () => {
      if (!wallet || wallet.address !== proof.staff) {
        throw new Error('Conecta la wallet de staff autorizada.');
      }
      if (!proof.event || !proof.ticket || !proof.asset || !proof.intent) {
        throw new Error('El holder aun no presenta un intent valido.');
      }
      const instruction = await adapter.buildConsumeCheckInCore({
        event: parseAddress(proof.event, 'Evento'),
        ticketRecord: parseAddress(proof.ticket, 'Ticket'),
        coreAsset: parseAddress(proof.asset, 'Activo'),
        checkInIntent: parseAddress(proof.intent, 'Intent'),
      });
      try {
        const signature = await adapter.sendInstructions([instruction]);
        if (duplicate) {
          throw new Error('Fallo critico: el segundo check-in fue aceptado.');
        }
        await adapter.waitForTicketStatus(
          parseAddress(proof.ticket, 'Ticket'),
          generated.TicketStatus.Used,
        );
        save({ ...proof, consumeSignature: signature });
      } catch (error) {
        if (!duplicate) throw error;
        if (error instanceof Error && error.message.startsWith('Fallo critico')) throw error;
        save({ ...proof, duplicateRejected: true });
      }
    });
  }

  function reset() {
    window.localStorage.removeItem(STORAGE_KEY);
    setProof({});
    setStaffInput('');
    setMessage(undefined);
  }

  const selected = walletName || wallets[0]?.name || '';
  const steps = [
    ['Emision', proof.event, proof.setupSignature],
    ['Compra + Core', proof.asset, proof.purchaseSignature],
    ['Presentacion', proof.intent, proof.presentSignature],
    ['Consumo', proof.ticket, proof.consumeSignature],
  ] as const;

  return (
    <section className="onchain-vertical" aria-labelledby="vertical-title">
      <div className="section-kicker">
        <span id="vertical-title">Vertical verificable</span>
        <span>Solana devnet · MPL Core</span>
      </div>
      <div className="vertical-intro">
        <div>
          <p className="diagnostic-label">Prueba, no promesa</p>
          <h2>Tres wallets. Un activo. Un acceso.</h2>
          <p>
            La interfaz avanza solo cuando existe una cuenta confirmada. Usa organizador, holder y
            staff distintos para producir evidencia valida.
          </p>
        </div>
        <div className="vertical-wallet">
          {wallet ? (
            <>
              <strong>{wallet.name}</strong>
              <code>{wallet.address}</code>
              <button className="text-button dark-text" onClick={changeWallet} type="button">
                Cambiar wallet
              </button>
            </>
          ) : wallets.length ? (
            <>
              <select value={selected} onChange={(event) => setWalletName(event.target.value)}>
                {wallets.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
              <button className="secondary-action" onClick={() => void connect()} type="button">
                Conectar wallet
              </button>
            </>
          ) : (
            <p>Instala o habilita una wallet compatible con Wallet Standard v0.</p>
          )}
        </div>
      </div>

      {message ? (
        <p
          className={`vertical-message ${message.kind}`}
          role={message.kind === 'error' ? 'alert' : 'status'}
        >
          {message.text}
        </p>
      ) : null}

      <ol className="vertical-steps">
        <li>
          <span>01 · Issuer</span>
          <strong>Emitir y publicar</strong>
          <label>
            Wallet publica del staff
            <input
              value={staffInput}
              onChange={(event) => setStaffInput(event.target.value)}
              placeholder="Direccion de la segunda wallet"
            />
          </label>
          <button
            disabled={!wallet || Boolean(pending) || Boolean(proof.event)}
            onClick={() => void setup()}
            type="button"
          >
            Crear evento verificable
          </button>
        </li>
        <li>
          <span>02 · Holder</span>
          <strong>Comprar activo Core</strong>
          <p>Cambia a una tercera wallet. Precio de prueba: 0.01 SOL devnet.</p>
          <button
            disabled={!wallet || Boolean(pending) || !proof.event || Boolean(proof.asset)}
            onClick={() => void purchase()}
            type="button"
          >
            Comprar y emitir
          </button>
        </li>
        <li>
          <span>03 · Validation</span>
          <strong>Presentar acceso</strong>
          <p>La wallet holder firma un intent temporal de cuatro minutos.</p>
          <button
            disabled={!wallet || Boolean(pending) || !proof.asset || Boolean(proof.intent)}
            onClick={() => void present()}
            type="button"
          >
            Presentar intent
          </button>
        </li>
        <li>
          <span>04 · Policy</span>
          <strong>Consumir una sola vez</strong>
          <p>Cambia a staff, consume y repite para documentar el rechazo.</p>
          <button
            disabled={
              !wallet || Boolean(pending) || !proof.intent || Boolean(proof.consumeSignature)
            }
            onClick={() => void consume()}
            type="button"
          >
            Consumir acceso
          </button>
          <button
            className="text-button dark-text"
            disabled={!proof.consumeSignature || Boolean(pending) || proof.duplicateRejected}
            onClick={() => void consume(true)}
            type="button"
          >
            Probar segundo uso
          </button>
        </li>
      </ol>

      <div className="vertical-proof">
        {steps.map(([label, account, signature]) => (
          <div key={label}>
            <span>{label}</span>
            {account ? (
              <a href={explorer(account)} rel="noreferrer" target="_blank">
                {short(account)}
              </a>
            ) : (
              <small>Pendiente</small>
            )}
            {signature ? (
              <a href={explorer(signature, 'tx')} rel="noreferrer" target="_blank">
                Transaccion
              </a>
            ) : null}
          </div>
        ))}
        <div>
          <span>Doble uso</span>
          <strong>{proof.duplicateRejected ? 'Rechazado' : 'Pendiente'}</strong>
        </div>
      </div>
      <button
        className="text-button dark-text"
        disabled={Boolean(pending)}
        onClick={reset}
        type="button"
      >
        Limpiar evidencia local
      </button>
    </section>
  );
}
