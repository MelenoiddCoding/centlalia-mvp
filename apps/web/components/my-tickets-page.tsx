'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { generated } from '@centlalia/client';
import { CheckInEvidenceList } from '@/components/check-in-evidence-list';
import { useCheckInEvidence } from '@/hooks/use-check-in-evidence';
import {
  parseCheckInPayload,
  serializeCheckInPayload,
  type CheckInPayload,
} from '@/lib/check-in-flow';
import { formatDate, formatSol, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

const ACTIVE_PAYLOAD_KEY = 'centlalia-active-check-in-v1';

function timestampNow(): number {
  return new Date().getTime();
}

function statusLabel(status: generated.TicketStatus): string {
  const labels: Record<generated.TicketStatus, string> = {
    [generated.TicketStatus.Active]: 'Activo',
    [generated.TicketStatus.Listed]: 'En reventa',
    [generated.TicketStatus.Used]: 'Utilizado',
    [generated.TicketStatus.Cancelled]: 'Cancelado',
  };
  return labels[status];
}

interface DasAsset {
  id: string;
  content?: { metadata?: { name?: string } };
}

export function MyTicketsPage() {
  const { wallet, tickets, events, tiers, adapter, execute, pending, loading } = useSolanaApp();
  const { evidence, recordEvidence } = useCheckInEvidence();
  const [payload, setPayload] = useState<CheckInPayload>();
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [dasAssets, setDasAssets] = useState<Map<string, DasAsset>>(new Map());
  const ownedTickets = wallet
    ? tickets.filter((ticket) => ticket.data.owner === wallet.address)
    : [];

  useEffect(() => {
    if (!wallet || loading) return;
    const stored = window.localStorage.getItem(ACTIVE_PAYLOAD_KEY);
    if (stored) {
      void QRCode.toDataURL(stored, { margin: 2, width: 420, errorCorrectionLevel: 'M' }).then(
        (image) => {
          try {
            const candidate = parseCheckInPayload(stored);
            const ticket = tickets.find(
              (item) =>
                item.address === candidate.ticketRecord && item.data.owner === wallet.address,
            );
            if (
              !ticket ||
              ticket.data.status !== generated.TicketStatus.Active ||
              candidate.expiresAt <= Math.floor(timestampNow() / 1_000)
            ) {
              window.localStorage.removeItem(ACTIVE_PAYLOAD_KEY);
              setPayload(undefined);
              setQrDataUrl('');
              return;
            }
            setPayload(candidate);
            setQrDataUrl(image);
          } catch {
            window.localStorage.removeItem(ACTIVE_PAYLOAD_KEY);
          }
        },
      );
    }

    void fetch('/api/das', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        method: 'searchAssets',
        params: { ownerAddress: wallet.address, page: 1, limit: 100 },
      }),
    })
      .then((response) => (response.ok ? response.json() : undefined))
      .then((body: { result?: { items?: DasAsset[] } } | undefined) => {
        const items = body?.result?.items ?? [];
        setDasAssets(new Map(items.map((asset) => [asset.id, asset])));
      })
      .catch(() => undefined);
  }, [loading, tickets, wallet]);

  async function present(ticketAddress: string) {
    if (!wallet) return;
    const ticket = ownedTickets.find((item) => item.address === ticketAddress);
    if (!ticket) return;
    const intentNonce = ticket.data.nextIntentNonce;
    const expiresAt = BigInt(Math.floor(timestampNow() / 1_000) + 240);
    const [checkInIntent] = await generated.findCheckInIntentPda({
      ticketRecord: ticket.address,
      intentNonce,
    });
    const signature = await execute('Presentación de acceso', async () => {
      const instruction = await adapter.buildPresentCheckInCore({
        event: ticket.data.event,
        ticketRecord: ticket.address,
        coreAsset: ticket.data.assetId,
        intentNonce,
        expiresAt,
      });
      const result = await adapter.sendInstructions([instruction]);
      await adapter.waitForAccount(checkInIntent);
      return result;
    });
    if (!signature) return;

    const nextPayload: CheckInPayload = {
      kind: 'centlalia-check-in',
      version: 1,
      network: 'devnet',
      event: ticket.data.event,
      ticketRecord: ticket.address,
      coreAsset: ticket.data.assetId,
      checkInIntent,
      expiresAt: Number(expiresAt),
      presentSignature: signature,
    };
    const serialized = serializeCheckInPayload(nextPayload);
    window.localStorage.setItem(ACTIVE_PAYLOAD_KEY, serialized);
    setPayload(nextPayload);
    setQrDataUrl(
      await QRCode.toDataURL(serialized, { margin: 2, width: 420, errorCorrectionLevel: 'M' }),
    );
    recordEvidence({
      id: signature,
      action: 'present',
      actor: wallet.address,
      event: ticket.data.event,
      ticketRecord: ticket.address,
      coreAsset: ticket.data.assetId,
      checkInIntent,
      signature,
      recordedAt: timestampNow(),
    });
  }

  return (
    <div className="tickets-page page-enter">
      <header className="page-heading ticket-heading">
        <div>
          <p className="eyebrow">Holder workspace</p>
          <h1>Mis boletos</h1>
        </div>
        <p>Propiedad, estado y acceso temporal verificados contra el registro on-chain.</p>
      </header>

      {!wallet ? (
        <div className="product-empty">
          <strong>Conecta la wallet que compró el acceso.</strong>
        </div>
      ) : null}
      {wallet && loading ? <p className="product-empty">Leyendo TicketRecord en devnet…</p> : null}
      {wallet && !loading && ownedTickets.length === 0 ? (
        <div className="product-empty">
          <strong>Esta wallet todavía no tiene boletos Centlalia.</strong>
          <Link href="/events">Explorar eventos</Link>
        </div>
      ) : null}

      <div className="ticket-registry">
        {ownedTickets.map((ticket) => {
          const event = events.find((item) => item.address === ticket.data.event);
          const tier = tiers.find((item) => item.address === ticket.data.tier);
          const dasAsset = dasAssets.get(ticket.data.assetId);
          return (
            <article key={ticket.address}>
              <div className="ticket-stub" aria-hidden="true">
                <span>{event?.data.title.slice(0, 1) ?? 'C'}</span>
                <small>#{ticket.data.serial.toString().padStart(4, '0')}</small>
              </div>
              <div className="ticket-body">
                <span className={`ticket-status status-${ticket.data.status}`}>
                  {statusLabel(ticket.data.status)}
                </span>
                <h2>
                  {event?.data.title ?? dasAsset?.content?.metadata?.name ?? 'Evento Centlalia'}
                </h2>
                <p>
                  {tier?.data.name ?? 'Acceso'} · {formatSol(ticket.data.originalPriceLamports)}
                </p>
                {event ? <time>{formatDate(event.data.startsAt)}</time> : null}
                <dl>
                  <div>
                    <dt>Core asset</dt>
                    <dd>{shortAddress(ticket.data.assetId)}</dd>
                  </div>
                  <div>
                    <dt>Registro</dt>
                    <dd>{shortAddress(ticket.address)}</dd>
                  </div>
                  <div>
                    <dt>Índice</dt>
                    <dd>{dasAsset ? 'DAS + programa' : 'Programa'}</dd>
                  </div>
                </dl>
              </div>
              <div className="ticket-actions">
                <a
                  href={`https://explorer.solana.com/address/${ticket.data.assetId}?cluster=devnet`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Ver asset ↗
                </a>
                <button
                  disabled={
                    ticket.data.status !== generated.TicketStatus.Active ||
                    ticket.data.activeIntent.__option === 'Some' ||
                    Boolean(pending)
                  }
                  onClick={() => void present(ticket.address)}
                  type="button"
                >
                  {ticket.data.activeIntent.__option === 'Some'
                    ? 'Intent pendiente'
                    : 'Presentar acceso'}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {payload && qrDataUrl ? (
        <section className="access-pass" aria-labelledby="access-pass-heading">
          <div>
            <p className="eyebrow">Intent pendiente · 4 minutos</p>
            <h2 id="access-pass-heading">Presenta este QR al staff</h2>
            <p>
              Expira {formatDate(BigInt(payload.expiresAt))}. El programa rechazará reuso,
              expiración o una wallet staff no autorizada.
            </p>
            <code>{payload.checkInIntent}</code>
            <a
              href={`https://explorer.solana.com/tx/${payload.presentSignature}?cluster=devnet`}
              rel="noreferrer"
              target="_blank"
            >
              Ver presentación en Explorer ↗
            </a>
          </div>
          <div className="access-qr">
            <Image
              alt="QR temporal para check-in"
              height={420}
              src={qrDataUrl}
              unoptimized
              width={420}
            />
            <button
              onClick={() => void navigator.clipboard.writeText(serializeCheckInPayload(payload))}
              type="button"
            >
              Copiar contenido QR
            </button>
          </div>
        </section>
      ) : null}

      <CheckInEvidenceList evidence={evidence} />
    </div>
  );
}
