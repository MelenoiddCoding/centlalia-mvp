'use client';

import { useState, type FormEvent } from 'react';
import { address } from '@solana/kit';
import { generated } from '@centlalia/client';
import { formatDate, formatSol } from '@/lib/onchain-format';
import { parseSolInput } from '@/lib/sol-input';
import {
  type CatalogEvent,
  type CatalogListing,
  type CatalogTicket,
  useSolanaApp,
} from '@/providers/solana-app-provider';

interface TicketCirculationActionsProps {
  event?: CatalogEvent;
  listing?: CatalogListing;
  ticket: CatalogTicket;
}

function timestampNow(): number {
  return new Date().getTime();
}

export function TicketCirculationActions({
  event,
  listing,
  ticket,
}: TicketCirculationActionsProps) {
  const { adapter, execute, pending } = useSolanaApp();
  const [mode, setMode] = useState<'gift' | 'list'>();
  const [recipient, setRecipient] = useState('');
  const [priceSol, setPriceSol] = useState('');
  const [now] = useState(() => BigInt(Math.floor(timestampNow() / 1_000)));
  const transferOpen = event
    ? event.data.status === generated.EventStatus.Published && now < event.data.checkInStartAt
    : false;
  const blocked = Boolean(pending) || ticket.data.activeIntent.__option === 'Some';

  async function gift(submission: FormEvent<HTMLFormElement>) {
    submission.preventDefault();
    if (!event) return;
    const signature = await execute('Regalo Core', async () => {
      const nextOwner = address(recipient.trim());
      const instruction = await adapter.buildGiftTicketCore({
        recipient: nextOwner,
        event: event.address,
        ticketRecord: ticket.address,
        coreAsset: ticket.data.assetId,
      });
      const result = await adapter.sendInstructions([instruction]);
      await adapter.waitForTicketOwner(ticket.address, nextOwner);
      return result;
    });
    if (signature) {
      setRecipient('');
      setMode(undefined);
    }
  }

  async function list(submission: FormEvent<HTMLFormElement>) {
    submission.preventDefault();
    if (!event) return;
    const listingId = ticket.data.nextListingId;
    const [listingAddress] = await generated.findListingPda({
      ticketRecord: ticket.address,
      listingId,
    });
    const signature = await execute('Publicación en reventa', async () => {
      const priceLamports = parseSolInput(priceSol);
      const instruction = await adapter.buildListTicketCore({
        event: event.address,
        ticketRecord: ticket.address,
        coreAsset: ticket.data.assetId,
        listingId,
        priceLamports,
        expiresAt: event.data.checkInStartAt,
      });
      const result = await adapter.sendInstructions([instruction]);
      await adapter.waitForAccount(listingAddress);
      await adapter.waitForTicketStatus(ticket.address, generated.TicketStatus.Listed);
      return result;
    });
    if (signature) {
      setPriceSol('');
      setMode(undefined);
    }
  }

  async function cancelListing() {
    if (!listing) return;
    await execute('Cancelación de reventa', async () => {
      const instruction = await adapter.buildCancelListingCore({
        ticketRecord: ticket.address,
        listing: listing.address,
        coreAsset: ticket.data.assetId,
      });
      const result = await adapter.sendInstructions([instruction]);
      await adapter.waitForTicketStatus(ticket.address, generated.TicketStatus.Active);
      return result;
    });
  }

  if (ticket.data.status === generated.TicketStatus.Listed) {
    return (
      <div className="circulation-panel listed">
        <span>Delegación Core activa</span>
        <strong>{listing ? formatSol(listing.data.priceLamports) : 'Leyendo listing…'}</strong>
        {listing?.data.expiresAt.__option === 'Some' ? (
          <small>Hasta {formatDate(listing.data.expiresAt.value)}</small>
        ) : null}
        <button
          disabled={!listing || Boolean(pending)}
          onClick={() => void cancelListing()}
          type="button"
        >
          Cancelar reventa
        </button>
      </div>
    );
  }

  if (ticket.data.status !== generated.TicketStatus.Active) return null;
  if (!transferOpen) return <p>La circulación cerró al comenzar el check-in.</p>;

  return (
    <div className="circulation-panel">
      <div className="circulation-switcher">
        <button
          disabled={blocked}
          onClick={() => setMode(mode === 'gift' ? undefined : 'gift')}
          type="button"
        >
          Regalar
        </button>
        <button
          disabled={blocked || !event?.data.resaleEnabled}
          onClick={() => setMode(mode === 'list' ? undefined : 'list')}
          type="button"
        >
          Revender
        </button>
      </div>

      {mode === 'gift' ? (
        <form onSubmit={(submission) => void gift(submission)}>
          <label>
            <span>Wallet destinataria</span>
            <input
              onChange={(input) => setRecipient(input.target.value)}
              placeholder="Dirección Solana"
              required
              value={recipient}
            />
          </label>
          <button disabled={blocked} type="submit">
            Transferir Core
          </button>
        </form>
      ) : null}

      {mode === 'list' && event ? (
        <form onSubmit={(submission) => void list(submission)}>
          <label>
            <span>Precio en SOL</span>
            <input
              inputMode="decimal"
              onChange={(input) => setPriceSol(input.target.value)}
              placeholder="0.01"
              required
              value={priceSol}
            />
          </label>
          <small>
            Máximo{' '}
            {formatSol(
              (ticket.data.originalPriceLamports * BigInt(10_000 + event.data.maxResaleMarkupBps)) /
                10_000n,
            )}
            . Expira al abrir check-in.
          </small>
          <button disabled={blocked} type="submit">
            Publicar listing
          </button>
        </form>
      ) : null}
    </div>
  );
}
