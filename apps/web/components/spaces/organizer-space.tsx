'use client';

import { DEMO_IDENTITIES, LAMPORTS_PER_SOL } from '@centlalia/client';
import { useState, type FormEvent } from 'react';
import { dateTime, shortAddress, sol } from '@/lib/format';
import { useGateway } from '@/providers/gateway-provider';

export function OrganizerSpace() {
  const { gateway, state, pending, execute } = useGateway();
  const event = state.events[0];
  const [title, setTitle] = useState('Encuentro Solana Centro');
  const [venue, setVenue] = useState('Laboratorio Nodo · CDMX');
  const [startsAt, setStartsAt] = useState('2026-08-08T18:00');
  const [capacity, setCapacity] = useState('40');
  const [price, setPrice] = useState('0.10');

  function createEvent(formEvent: FormEvent<HTMLFormElement>) {
    formEvent.preventDefault();
    void execute(
      () =>
        gateway.createEvent({
          organizer: DEMO_IDENTITIES.organizer,
          title,
          venue,
          startsAt,
          capacity: Number(capacity),
          priceLamports: BigInt(Math.round(Number(price) * Number(LAMPORTS_PER_SOL))),
          staff: DEMO_IDENTITIES.staff,
        }),
      'Evento creado como borrador.',
    );
  }

  return (
    <section aria-labelledby="organizer-heading">
      <header className="role-heading">
        <div>
          <p>01 / Organizador</p>
          <h1 id="organizer-heading">Preparar el acceso</h1>
        </div>
        <p>Define una edición mínima, publícala y entrega al staff una regla clara de entrada.</p>
      </header>

      {!event ? (
        <form className="editorial-form entrance-sequence" onSubmit={createEvent}>
          <div className="form-intro">
            <span>Nueva edición</span>
            <p>Los datos se guardan en memoria. No se firma ni se envía una transacción real.</p>
          </div>
          <label className="field field-wide">
            <span>Nombre del evento</span>
            <input
              autoComplete="off"
              onChange={(e) => setTitle(e.target.value)}
              required
              value={title}
            />
          </label>
          <label className="field field-wide">
            <span>Sede</span>
            <input
              autoComplete="off"
              onChange={(e) => setVenue(e.target.value)}
              required
              value={venue}
            />
          </label>
          <label className="field">
            <span>Inicio</span>
            <input
              onChange={(e) => setStartsAt(e.target.value)}
              required
              type="datetime-local"
              value={startsAt}
            />
          </label>
          <label className="field">
            <span>Aforo</span>
            <input
              min="1"
              onChange={(e) => setCapacity(e.target.value)}
              required
              type="number"
              value={capacity}
            />
          </label>
          <label className="field">
            <span>Precio demo</span>
            <span className="input-suffix">
              <input
                min="0"
                onChange={(e) => setPrice(e.target.value)}
                required
                step="0.01"
                type="number"
                value={price}
              />
              <b>SOL</b>
            </span>
          </label>
          <div className="field staff-field">
            <span>Staff autorizado</span>
            <strong>Staff puerta</strong>
            <code>{shortAddress(DEMO_IDENTITIES.staff)}</code>
          </div>
          <button className="primary-action field-wide" disabled={pending} type="submit">
            <span>Crear borrador</span>
            <span aria-hidden="true">↗</span>
          </button>
        </form>
      ) : (
        <div className="event-proof entrance-sequence">
          <div className="event-edition">
            <span>ED. 001</span>
            <span>{event.status === 'draft' ? 'BORRADOR' : 'PUBLICADO'}</span>
          </div>
          <div className="event-title-block">
            <p>{dateTime(event.startsAt)}</p>
            <h2>{event.title}</h2>
            <p>{event.venue}</p>
          </div>
          <dl className="event-metrics">
            <div>
              <dt>Precio</dt>
              <dd>{sol(event.priceLamports)}</dd>
            </div>
            <div>
              <dt>Aforo</dt>
              <dd>{event.capacity}</dd>
            </div>
            <div>
              <dt>Emitidos</dt>
              <dd>{event.sold}</dd>
            </div>
            <div>
              <dt>Staff</dt>
              <dd>{event.staff.length}</dd>
            </div>
          </dl>
          <div className="event-controls">
            <div>
              <span>Regla de circulación</span>
              <p>Reventa hasta 20% sobre precio original. Check-in de un solo uso.</p>
            </div>
            {event.status === 'draft' ? (
              <button
                className="primary-action"
                disabled={pending}
                onClick={() =>
                  void execute(
                    () => gateway.publishEvent(event.id, DEMO_IDENTITIES.organizer),
                    'Evento publicado; la venta primaria está abierta.',
                  )
                }
                type="button"
              >
                <span>Publicar evento</span>
                <span aria-hidden="true">↗</span>
              </button>
            ) : (
              <p className="published-mark">
                <i aria-hidden="true" /> Venta demo abierta
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
