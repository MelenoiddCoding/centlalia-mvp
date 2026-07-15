'use client';

import {
  DEMO_IDENTITIES,
  LAMPORTS_PER_SOL,
  type Address,
  type TicketRecord,
} from '@centlalia/client';
import { useState } from 'react';
import { identityName, sol } from '@/lib/format';
import { useGateway } from '@/providers/gateway-provider';
import { TicketPass } from '@/components/ticket-pass';

const attendees = [DEMO_IDENTITIES.ana, DEMO_IDENTITIES.bruno] as const;

function TicketActions({ ticket, wallet }: { ticket: TicketRecord; wallet: Address }) {
  const { gateway, state, pending, execute } = useGateway();
  const [resalePrice, setResalePrice] = useState(
    (Number((ticket.originalPriceLamports * 11n) / 10n) / Number(LAMPORTS_PER_SOL)).toFixed(2),
  );
  const recipient = wallet === DEMO_IDENTITIES.ana ? DEMO_IDENTITIES.bruno : DEMO_IDENTITIES.ana;
  const listing = state.listings.find(
    (item) => item.ticketId === ticket.id && item.status === 'open',
  );
  const activeIntent = state.intents.find(
    (intent) => intent.ticketId === ticket.id && intent.status === 'active',
  );

  if (ticket.status === 'used') {
    return <p className="used-note">Este acceso ya fue consumido y no puede volver a circular.</p>;
  }

  if (activeIntent) {
    return (
      <div className="ticket-actions">
        <p>
          Presentación activa durante cinco minutos. Cancélala si no vas a entrar por esta puerta.
        </p>
        <button
          className="secondary-action"
          disabled={pending}
          onClick={() =>
            void execute(
              () => gateway.cancelCheckIn(activeIntent.id, wallet),
              'Presentación cancelada por el titular.',
            )
          }
          type="button"
        >
          Cancelar presentación
        </button>
      </div>
    );
  }

  if (listing) {
    return (
      <div className="ticket-actions">
        <p>
          Publicado por {sol(listing.priceLamports)}. El boleto queda inmovilizado hasta vender o
          cancelar.
        </p>
        <button
          className="secondary-action"
          disabled={pending}
          onClick={() =>
            void execute(
              () => gateway.cancelListing(listing.id, wallet),
              'Publicación cancelada; el boleto vuelve a estar vigente.',
            )
          }
          type="button"
        >
          Cancelar reventa
        </button>
      </div>
    );
  }

  return (
    <div className="ticket-actions">
      <div>
        <span className="action-label">Acceso</span>
        <button
          className="primary-action compact"
          disabled={pending}
          onClick={() =>
            void execute(
              () => gateway.presentCheckIn(ticket.id, wallet),
              'Boleto presentado. Staff tiene cinco minutos para validarlo.',
            )
          }
          type="button"
        >
          Presentar para acceso
        </button>
      </div>
      <div>
        <span className="action-label">Regalo</span>
        <button
          className="secondary-action"
          disabled={pending}
          onClick={() =>
            void execute(
              () => gateway.giftTicket(ticket.id, wallet, recipient),
              `Propiedad transferida a ${identityName(recipient)}.`,
            )
          }
          type="button"
        >
          Regalar a {identityName(recipient)}
        </button>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void execute(
            () =>
              gateway.listTicket(
                ticket.id,
                wallet,
                BigInt(Math.round(Number(resalePrice) * Number(LAMPORTS_PER_SOL))),
              ),
            'Boleto publicado en la mesa de reventa.',
          );
        }}
      >
        <label className="action-label" htmlFor={`resale-${ticket.id}`}>
          Reventa · máximo 20%
        </label>
        <span className="inline-price">
          <input
            id={`resale-${ticket.id}`}
            min="0.01"
            onChange={(event) => setResalePrice(event.target.value)}
            step="0.01"
            type="number"
            value={resalePrice}
          />
          <b>SOL</b>
          <button className="secondary-action" disabled={pending} type="submit">
            Publicar
          </button>
        </span>
      </form>
    </div>
  );
}

export function AttendeeSpace() {
  const { gateway, state, pending, execute } = useGateway();
  const [wallet, setWallet] = useState<Address>(DEMO_IDENTITIES.ana);
  const event = state.events[0];
  const tickets = state.tickets.filter((ticket) => ticket.owner === wallet);
  const listings = state.listings.filter(
    (listing) => listing.status === 'open' && listing.seller !== wallet,
  );

  return (
    <section aria-labelledby="attendee-heading">
      <header className="role-heading">
        <div>
          <p>02 / Asistente</p>
          <h1 id="attendee-heading">Custodiar y circular</h1>
        </div>
        <p>Compra, transfiere o presenta un boleto usando dos identidades locales de prueba.</p>
      </header>

      <div className="identity-switch" role="group" aria-label="Wallet de asistente">
        <span>Wallet activa</span>
        {attendees.map((attendee) => (
          <button
            aria-pressed={wallet === attendee}
            className={wallet === attendee ? 'is-active' : ''}
            key={attendee}
            onClick={() => setWallet(attendee)}
            type="button"
          >
            <i aria-hidden="true">{identityName(attendee).slice(0, 1)}</i>
            {identityName(attendee)}
          </button>
        ))}
      </div>

      {!event ? (
        <div className="empty-state">
          <span>Venta cerrada</span>
          <h2>Primero crea el evento</h2>
          <p>Ve al espacio Organizador para abrir una edición.</p>
        </div>
      ) : event.status !== 'published' ? (
        <div className="empty-state">
          <span>Borrador detectado</span>
          <h2>Falta publicar</h2>
          <p>La compra se habilita solamente cuando el organizador abre la edición.</p>
        </div>
      ) : (
        <>
          <div className="sale-line entrance-sequence">
            <div>
              <span>Edición disponible</span>
              <strong>{event.title}</strong>
              <small>
                {event.sold}/{event.capacity} emitidos
              </small>
            </div>
            <div>
              <span>Precio primario</span>
              <strong>{sol(event.priceLamports)}</strong>
            </div>
            <button
              className="primary-action"
              disabled={pending}
              onClick={() =>
                void execute(
                  () => gateway.buyPrimary(event.id, wallet),
                  `Boleto emitido a ${identityName(wallet)}.`,
                )
              }
              type="button"
            >
              <span>Comprar boleto demo</span>
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          <div className="ticket-section">
            <div className="section-kicker">
              <span>Mis boletos · {identityName(wallet)}</span>
              <span>{String(tickets.length).padStart(2, '0')}</span>
            </div>
            {tickets.length === 0 ? (
              <p className="empty-copy">Esta wallet aún no tiene boletos.</p>
            ) : (
              tickets.map((ticket) => (
                <div className="ticket-row" key={ticket.id}>
                  <TicketPass event={event} ticket={ticket} />
                  <TicketActions ticket={ticket} wallet={wallet} />
                </div>
              ))
            )}
          </div>

          <div className="market-line">
            <div className="section-kicker">
              <span>Mesa de reventa</span>
              <span>{String(listings.length).padStart(2, '0')}</span>
            </div>
            {listings.length === 0 ? (
              <p className="empty-copy">No hay boletos de otra wallet disponibles.</p>
            ) : (
              <ul>
                {listings.map((listing) => (
                  <li key={listing.id}>
                    <div>
                      <span>{listing.ticketId}</span>
                      <strong>{sol(listing.priceLamports)}</strong>
                      <small>Vende {identityName(listing.seller)}</small>
                    </div>
                    <button
                      className="secondary-action"
                      disabled={pending}
                      onClick={() =>
                        void execute(
                          () => gateway.buyResale(listing.id, wallet),
                          `Reventa completada; ${identityName(wallet)} es el nuevo titular.`,
                        )
                      }
                      type="button"
                    >
                      Comprar reventa
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  );
}
