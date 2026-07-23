'use client';

import Link from 'next/link';
import { useState } from 'react';
import { generated } from '@centlalia/client';
import { eventStatusLabel, formatDate, formatSol, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

export function EventDetailPage({ eventAddress }: { eventAddress: string }) {
  const { events, tiers, wallet, adapter, execute, pending, loading } = useSolanaApp();
  const [now] = useState(() => BigInt(Math.floor(Date.now() / 1_000)));
  const event = events.find((item) => item.address === eventAddress);

  if (loading) return <p className="product-empty page-enter">Leyendo evento en devnet…</p>;
  if (!event) {
    return (
      <div className="product-empty page-enter">
        <strong>Evento no encontrado.</strong>
        <Link href="/events">Volver al marketplace</Link>
      </div>
    );
  }

  const currentEvent = event;
  const eventTiers = tiers.filter((tier) => tier.data.event === currentEvent.address);
  const salesOpen =
    currentEvent.data.status === generated.EventStatus.Published &&
    now >= currentEvent.data.salesStartAt &&
    now < currentEvent.data.salesEndAt;

  async function purchase(tierAddress: string) {
    if (!wallet) throw new Error('Conecta una wallet para comprar.');
    const tier = eventTiers.find((item) => item.address === tierAddress);
    if (!tier) throw new Error('Tier no encontrado.');
    await execute('Compra y emisión Core', async () => {
      const ticketId = currentEvent.data.nextTicketId;
      const [ticketRecord] = await generated.findTicketRecordPda({
        event: currentEvent.address,
        ticketId,
      });
      const [coreAsset] = await generated.findCoreAssetPda({ ticketRecord });
      const instruction = await adapter.buildPrimaryPurchaseCore({
        event: currentEvent.address,
        tier: tier.address,
        organizer: currentEvent.data.organizer,
        treasury: currentEvent.data.platformTreasury,
        ticketId,
      });
      const signature = await adapter.sendInstructions([instruction]);
      await adapter.waitForAccount(coreAsset);
      return signature;
    });
  }

  return (
    <article className="event-detail page-enter">
      <header className="event-detail-hero">
        <div className="event-detail-poster" aria-hidden="true">
          <span>{currentEvent.data.title.slice(0, 1)}</span>
          <small>CENT · DEVNET</small>
        </div>
        <div>
          <p className="eyebrow">
            {eventStatusLabel(currentEvent.data.status)} · {shortAddress(currentEvent.address)}
          </p>
          <h1>{currentEvent.data.title}</h1>
          <dl className="event-facts">
            <div>
              <dt>Inicio</dt>
              <dd>{formatDate(currentEvent.data.startsAt)}</dd>
            </div>
            <div>
              <dt>Venta</dt>
              <dd>
                {formatDate(currentEvent.data.salesStartAt)} —{' '}
                {formatDate(currentEvent.data.salesEndAt)}
              </dd>
            </div>
            <div>
              <dt>Organizer</dt>
              <dd>{shortAddress(currentEvent.data.organizer)}</dd>
            </div>
            <div>
              <dt>Reventa</dt>
              <dd>
                {currentEvent.data.resaleEnabled
                  ? `Hasta ${currentEvent.data.maxResaleMarkupBps / 100}%`
                  : 'Deshabilitada'}
              </dd>
            </div>
          </dl>
          <a
            className="inline-link"
            href={`https://explorer.solana.com/address/${currentEvent.address}?cluster=devnet`}
            rel="noreferrer"
            target="_blank"
          >
            Ver cuenta en Explorer ↗
          </a>
        </div>
      </header>

      <section className="tier-section">
        <header>
          <p className="eyebrow">Inventario on-chain</p>
          <h2>Selecciona tu acceso</h2>
        </header>
        <div className="tier-list">
          {eventTiers.map((tier) => {
            const available = tier.data.supply - tier.data.sold;
            return (
              <div className="tier-line" key={tier.address}>
                <div>
                  <strong>{tier.data.name}</strong>
                  <span>
                    {available} de {tier.data.supply} disponibles
                  </span>
                </div>
                <strong>{formatSol(tier.data.priceLamports)}</strong>
                <button
                  disabled={!wallet || !salesOpen || available <= 0 || Boolean(pending)}
                  onClick={() => void purchase(tier.address)}
                  type="button"
                >
                  {!wallet ? 'Conecta wallet' : salesOpen ? 'Comprar' : 'Venta cerrada'}
                </button>
              </div>
            );
          })}
          {eventTiers.length === 0 ? (
            <p className="product-empty">Este evento no tiene tiers.</p>
          ) : null}
        </div>
      </section>
    </article>
  );
}
