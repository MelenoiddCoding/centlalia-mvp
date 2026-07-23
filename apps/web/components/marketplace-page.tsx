'use client';

import Link from 'next/link';
import { useState } from 'react';
import { generated } from '@centlalia/client';
import { eventStatusLabel, formatDate, formatSol, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

export function MarketplacePage() {
  const { events, tiers, loading, refresh } = useSolanaApp();
  const published = events.filter((event) => event.data.status === generated.EventStatus.Published);
  const [now] = useState(() => BigInt(Math.floor(Date.now() / 1_000)));

  return (
    <div className="marketplace-page page-enter">
      <section className="market-hero">
        <div>
          <p className="eyebrow">Cartelera on-chain · Devnet</p>
          <h1>Eventos que se pueden verificar.</h1>
          <p>Descubre, compra y presenta accesos emitidos directamente en Solana.</p>
        </div>
        <div className="market-index" aria-label="Resumen de cartelera">
          <strong>{String(published.length).padStart(2, '0')}</strong>
          <span>eventos publicados</span>
          <button onClick={() => void refresh()} type="button">
            Actualizar RPC
          </button>
        </div>
      </section>

      <section className="event-ledger" aria-labelledby="events-heading">
        <header>
          <h2 id="events-heading">Próximos eventos</h2>
          <span>Fuente: programa Centlalia</span>
        </header>
        {loading ? <p className="product-empty">Leyendo cuentas en devnet…</p> : null}
        {!loading && published.length === 0 ? (
          <div className="product-empty">
            <strong>No hay eventos publicados.</strong>
            <p>Conecta una wallet organizer y crea el primero.</p>
            <Link href="/organizer/events/new">Crear evento</Link>
          </div>
        ) : null}
        <div className="event-rows">
          {published.map((event, index) => {
            const eventTiers = tiers.filter((tier) => tier.data.event === event.address);
            const lowestPrice = eventTiers.reduce<bigint | undefined>(
              (lowest, tier) =>
                lowest === undefined || tier.data.priceLamports < lowest
                  ? tier.data.priceLamports
                  : lowest,
              undefined,
            );
            const salesOpen = now >= event.data.salesStartAt && now < event.data.salesEndAt;
            return (
              <Link className="event-row" href={`/events/${event.address}`} key={event.address}>
                <span className="event-number">{String(index + 1).padStart(2, '0')}</span>
                <div className="event-poster" aria-hidden="true">
                  <span>{event.data.title.slice(0, 1)}</span>
                </div>
                <div className="event-row-main">
                  <span className={`status-word ${salesOpen ? 'live' : ''}`}>
                    {salesOpen ? 'Venta abierta' : eventStatusLabel(event.data.status)}
                  </span>
                  <h3>{event.data.title}</h3>
                  <p>{formatDate(event.data.startsAt)}</p>
                </div>
                <div className="event-row-meta">
                  <span>Desde</span>
                  <strong>
                    {lowestPrice === undefined ? 'Sin tiers' : formatSol(lowestPrice)}
                  </strong>
                  <small>{shortAddress(event.data.organizer)}</small>
                </div>
                <span className="event-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
