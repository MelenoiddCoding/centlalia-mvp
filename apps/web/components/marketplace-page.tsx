'use client';

import Link from 'next/link';
import { useState } from 'react';
import { generated } from '@centlalia/client';
import { eventStatusLabel, formatDate, formatSol, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

export function MarketplacePage() {
  const { adapter, events, execute, listings, loading, pending, refresh, tickets, tiers, wallet } =
    useSolanaApp();
  const published = events.filter((event) => event.data.status === generated.EventStatus.Published);
  const [now] = useState(() => BigInt(Math.floor(Date.now() / 1_000)));
  const activeListings = listings.filter((listing) => {
    const ticket = tickets.find((item) => item.address === listing.data.ticket);
    const event = events.find((item) => item.address === listing.data.event);
    return (
      listing.data.status === generated.ListingStatus.Active &&
      listing.data.expiresAt.__option === 'Some' &&
      listing.data.expiresAt.value > now &&
      ticket?.data.status === generated.TicketStatus.Listed &&
      event?.data.status === generated.EventStatus.Published &&
      now < event.data.checkInStartAt
    );
  });

  async function buyResale(listingAddress: string) {
    if (!wallet) return;
    const listing = activeListings.find((item) => item.address === listingAddress);
    if (!listing) return;
    const ticket = tickets.find((item) => item.address === listing.data.ticket);
    const event = events.find((item) => item.address === listing.data.event);
    if (!ticket || !event) return;
    await execute('Compra de reventa Core', async () => {
      const instruction = await adapter.buildBuyResaleCore({
        event: event.address,
        ticketRecord: ticket.address,
        listing: listing.address,
        seller: listing.data.seller,
        organizer: event.data.organizer,
        treasury: event.data.platformTreasury,
        coreAsset: ticket.data.assetId,
      });
      const signature = await adapter.sendInstructions([instruction]);
      await adapter.waitForTicketOwner(ticket.address, wallet.address);
      return signature;
    });
  }

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

      <section className="resale-ledger" aria-labelledby="resale-heading">
        <header>
          <div>
            <p className="eyebrow">Mercado secundario · MPL Core</p>
            <h2 id="resale-heading">Reventa con precio limitado</h2>
          </div>
          <span>{String(activeListings.length).padStart(2, '0')} listings activos</span>
        </header>
        {activeListings.length === 0 ? (
          <p className="product-empty">
            No hay boletos en reventa. Los listings aparecen aquí directamente desde el programa.
          </p>
        ) : (
          <div className="resale-rows">
            {activeListings.map((listing) => {
              const ticket = tickets.find((item) => item.address === listing.data.ticket);
              const event = events.find((item) => item.address === listing.data.event);
              const tier = ticket
                ? tiers.find((item) => item.address === ticket.data.tier)
                : undefined;
              if (!ticket || !event) return null;
              const ownListing = wallet?.address === listing.data.seller;
              return (
                <article className="resale-row" key={listing.address}>
                  <span className="resale-mark" aria-hidden="true">
                    {event.data.title.slice(0, 1)}
                  </span>
                  <div>
                    <span className="status-word live">Delegación verificada</span>
                    <h3>{event.data.title}</h3>
                    <p>
                      {tier?.data.name ?? 'Acceso'} · #
                      {ticket.data.serial.toString().padStart(4, '0')}
                    </p>
                    <small>Vende {shortAddress(listing.data.seller)}</small>
                  </div>
                  <div className="resale-price">
                    <span>Precio protegido</span>
                    <strong>{formatSol(listing.data.priceLamports)}</strong>
                    {listing.data.expiresAt.__option === 'Some' ? (
                      <small>Expira {formatDate(listing.data.expiresAt.value)}</small>
                    ) : null}
                  </div>
                  <button
                    disabled={!wallet || ownListing || Boolean(pending)}
                    onClick={() => void buyResale(listing.address)}
                    type="button"
                  >
                    {!wallet ? 'Conecta wallet' : ownListing ? 'Tu listing' : 'Comprar reventa'}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
