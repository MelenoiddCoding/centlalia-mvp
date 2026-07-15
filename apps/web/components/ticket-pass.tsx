import type { EventRecord, TicketRecord } from '@centlalia/client';
import { dateTime, identityName, sol } from '@/lib/format';

const status = {
  active: 'Vigente',
  listed: 'En reventa',
  used: 'Utilizado',
} as const;

export function TicketPass({ event, ticket }: { event: EventRecord; ticket: TicketRecord }) {
  return (
    <article className={`ticket-pass ticket-${ticket.status}`} data-testid={`ticket-${ticket.id}`}>
      <div className="ticket-main">
        <div className="ticket-brand">
          <span>C</span> Centlalia / acceso
        </div>
        <p>{dateTime(event.startsAt)}</p>
        <h3>{event.title}</h3>
        <p>{event.venue}</p>
        <div className="ticket-owner">
          <span>Titular</span>
          <strong>{identityName(ticket.owner)}</strong>
        </div>
      </div>
      <div className="ticket-stub">
        <span className="vertical-label">ADMISIÓN</span>
        <strong>{ticket.id.replace('tkt-', '#')}</strong>
        <span>{sol(ticket.originalPriceLamports)}</span>
        <mark>{status[ticket.status]}</mark>
      </div>
    </article>
  );
}
