'use client';

import Link from 'next/link';
import { useState } from 'react';
import { address } from '@solana/kit';
import { generated } from '@centlalia/client';
import { eventStatusLabel, formatDate, formatSol, shortAddress } from '@/lib/onchain-format';
import { useSolanaApp } from '@/providers/solana-app-provider';

export function ManageEventPage({ eventAddress }: { eventAddress: string }) {
  const { events, tiers, wallet, adapter, execute, pending, loading } = useSolanaApp();
  const [tierName, setTierName] = useState('');
  const [tierPrice, setTierPrice] = useState('0.01');
  const [tierSupply, setTierSupply] = useState('20');
  const [staff, setStaff] = useState('');
  const event = events.find((item) => item.address === eventAddress);

  if (loading) return <p className="product-empty">Leyendo cuenta Event…</p>;
  if (!event)
    return (
      <div className="product-empty">
        <strong>Evento no encontrado.</strong>
        <Link href="/organizer/events">Volver</Link>
      </div>
    );
  const currentEvent = event;
  const isOwner = wallet?.address === currentEvent.data.organizer;
  const eventTiers = tiers.filter((tier) => tier.data.event === currentEvent.address);

  async function publish() {
    await execute('Publicación', async () => {
      const instruction = await adapter.buildPublishEvent({ event: currentEvent.address });
      return adapter.sendInstructions([instruction]);
    });
  }

  async function addTier(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    await execute('Nuevo tier', async () => {
      const instruction = await adapter.buildAddTier({
        event: currentEvent.address,
        tierId: currentEvent.data.nextTierId,
        name: tierName,
        priceLamports: BigInt(Math.round(Number(tierPrice) * 1_000_000_000)),
        supply: Number(tierSupply),
      });
      return adapter.sendInstructions([instruction]);
    });
  }

  async function authorize(submitEvent: React.FormEvent) {
    submitEvent.preventDefault();
    await execute('Autorización de staff', async () => {
      const instruction = await adapter.buildAuthorizeStaff({
        event: currentEvent.address,
        staff: address(staff.trim()),
      });
      return adapter.sendInstructions([instruction]);
    });
  }

  return (
    <div className="manage-event-page page-enter">
      <header className="page-heading">
        <div>
          <p className="eyebrow">
            {eventStatusLabel(currentEvent.data.status)} · {shortAddress(currentEvent.address)}
          </p>
          <h1>{currentEvent.data.title}</h1>
          <p>{formatDate(currentEvent.data.startsAt)}</p>
        </div>
        <a
          className="inline-link"
          href={`https://explorer.solana.com/address/${currentEvent.address}?cluster=devnet`}
          rel="noreferrer"
          target="_blank"
        >
          Explorer ↗
        </a>
      </header>
      {!isOwner ? (
        <div className="product-empty">
          <strong>Conecta la wallet organizer de este evento para administrarlo.</strong>
        </div>
      ) : null}
      <section className="management-ledger">
        <header>
          <h2>Inventario</h2>
          {isOwner && currentEvent.data.status === generated.EventStatus.Draft ? (
            <button disabled={Boolean(pending)} onClick={() => void publish()} type="button">
              Publicar evento
            </button>
          ) : null}
        </header>
        {eventTiers.map((tier) => (
          <div className="management-row" key={tier.address}>
            <strong>{tier.data.name}</strong>
            <span>{formatSol(tier.data.priceLamports)}</span>
            <span>
              {tier.data.sold}/{tier.data.supply} vendidos
            </span>
          </div>
        ))}
      </section>
      {isOwner && currentEvent.data.status === generated.EventStatus.Draft ? (
        <form className="compact-operation" onSubmit={(event) => void addTier(event)}>
          <h2>Añadir tier</h2>
          <input
            required
            maxLength={48}
            value={tierName}
            onChange={(event) => setTierName(event.target.value)}
            placeholder="Nombre"
          />
          <input
            required
            min="0"
            step="0.001"
            type="number"
            value={tierPrice}
            onChange={(event) => setTierPrice(event.target.value)}
          />
          <input
            required
            min="1"
            type="number"
            value={tierSupply}
            onChange={(event) => setTierSupply(event.target.value)}
          />
          <button disabled={Boolean(pending)} type="submit">
            Añadir
          </button>
        </form>
      ) : null}
      {isOwner ? (
        <form className="compact-operation" onSubmit={(event) => void authorize(event)}>
          <h2>Autorizar staff</h2>
          <input
            required
            value={staff}
            onChange={(event) => setStaff(event.target.value)}
            placeholder="Wallet pública"
          />
          <button disabled={Boolean(pending)} type="submit">
            Autorizar
          </button>
        </form>
      ) : null}
    </div>
  );
}
