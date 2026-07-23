'use client';

import Link from 'next/link';
import { generated } from '@centlalia/client';
import { eventStatusLabel, formatDate, formatSol, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

export function LandingPage() {
  const { events, tiers, loading } = useSolanaApp();
  const latestEvents = events
    .filter((event) => event.data.status === generated.EventStatus.Published)
    .sort((a, b) => Number(b.data.createdAt - a.data.createdAt))
    .slice(0, 5);

  return (
    <div className="landing-page page-enter">
      <section className="home-hero" aria-labelledby="featured-event-title">
        <div className="home-hero-copy">
          <p className="home-kicker">Evento destacado · Próximamente</p>
          <h1 id="featured-event-title">Noche Solar</h1>
          <p className="home-hero-lede">
            Música, comunidad y una noche que existe tanto en la ciudad como en Solana.
          </p>
          <dl className="home-hero-facts">
            <div>
              <dt>Fecha</dt>
              <dd>12 SEP 2026</dd>
            </div>
            <div>
              <dt>Lugar</dt>
              <dd>Guadalajara, MX</dd>
            </div>
          </dl>
          <div className="home-hero-actions">
            <Link href="/events">Explorar cartelera</Link>
            <Link href="/organizer/events/new">Publicar un evento</Link>
          </div>
        </div>
        <div className="home-hero-art" aria-hidden="true">
          <span className="home-hero-sun" />
          <strong>SOLAR</strong>
          <small>CENTLALIA PRESENTA · 001</small>
        </div>
      </section>

      <section className="home-latest" aria-labelledby="latest-events-heading">
        <header>
          <div>
            <p className="eyebrow">Actividad reciente · Devnet</p>
            <h2 id="latest-events-heading">Últimos eventos</h2>
          </div>
          <Link href="/events">Ver cartelera completa ↗</Link>
        </header>

        {loading ? <p className="product-empty">Leyendo cuentas en Solana…</p> : null}
        {!loading && latestEvents.length === 0 ? (
          <div className="product-empty">
            <strong>Todavía no hay eventos publicados.</strong>
            <Link href="/organizer/events/new">Publicar el primero</Link>
          </div>
        ) : null}

        <div className="home-event-list">
          {latestEvents.map((event, index) => {
            const eventTiers = tiers.filter((tier) => tier.data.event === event.address);
            const lowestPrice = eventTiers.reduce<bigint | undefined>(
              (lowest, tier) =>
                lowest === undefined || tier.data.priceLamports < lowest
                  ? tier.data.priceLamports
                  : lowest,
              undefined,
            );

            return (
              <Link href={`/events/${event.address}`} key={event.address}>
                <span className="home-event-index">0{index + 1}</span>
                <div className="home-event-mark" aria-hidden="true">
                  {event.data.title.slice(0, 1)}
                </div>
                <div className="home-event-main">
                  <span>{eventStatusLabel(event.data.status)}</span>
                  <h3>{event.data.title}</h3>
                  <p>{formatDate(event.data.startsAt)}</p>
                </div>
                <div className="home-event-price">
                  <small>Desde</small>
                  <strong>
                    {lowestPrice === undefined ? 'Sin tiers' : formatSol(lowestPrice)}
                  </strong>
                  <span>{shortAddress(event.data.organizer)}</span>
                </div>
                <span className="home-event-arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-organizer-cta">
        <p>Para quienes hacen que la noche suceda.</p>
        <h2>Emite. Vende. Valida.</h2>
        <Link href="/organizer/events/new">Crear evento en devnet ↗</Link>
      </section>
    </div>
  );
}
