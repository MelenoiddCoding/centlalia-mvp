'use client';

import Link from 'next/link';
import { eventStatusLabel, formatDate, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

export function MyEventsPage() {
  const { events, tiers, wallet, loading } = useSolanaApp();
  const mine = wallet ? events.filter((event) => event.data.organizer === wallet.address) : [];

  return (
    <div className="my-events-page page-enter">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Organizer workspace</p>
          <h1>Mis eventos</h1>
        </div>
        <Link className="primary-link" href="/organizer/events/new">
          Crear evento
        </Link>
      </header>
      {!wallet ? (
        <div className="product-empty">
          <strong>Conecta la wallet organizer para ver sus eventos.</strong>
        </div>
      ) : null}
      {wallet && loading ? <p className="product-empty">Leyendo eventos…</p> : null}
      {wallet && !loading && mine.length === 0 ? (
        <div className="product-empty">
          <strong>Esta wallet todavía no creó eventos.</strong>
          <Link href="/organizer/events/new">Crear el primero</Link>
        </div>
      ) : null}
      <div className="organizer-event-list">
        {mine.map((event) => {
          const eventTiers = tiers.filter((tier) => tier.data.event === event.address);
          const sold = eventTiers.reduce((total, tier) => total + tier.data.sold, 0);
          const supply = eventTiers.reduce((total, tier) => total + tier.data.supply, 0);
          return (
            <Link href={`/organizer/events/${event.address}`} key={event.address}>
              <span className="status-word">{eventStatusLabel(event.data.status)}</span>
              <div>
                <h2>{event.data.title}</h2>
                <p>{formatDate(event.data.startsAt)}</p>
              </div>
              <dl>
                <div>
                  <dt>Tiers</dt>
                  <dd>{eventTiers.length}</dd>
                </div>
                <div>
                  <dt>Vendidos</dt>
                  <dd>
                    {sold}/{supply}
                  </dd>
                </div>
                <div>
                  <dt>Cuenta</dt>
                  <dd>{shortAddress(event.address)}</dd>
                </div>
              </dl>
              <span aria-hidden="true">→</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
