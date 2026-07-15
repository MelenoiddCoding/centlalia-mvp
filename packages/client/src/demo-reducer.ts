import { GatewayError } from './gateway';
import type { Address, DemoState, EventRecord } from './types';

export const MAX_RESALE_MARKUP_BPS = 2_000;
export const CHECK_IN_TTL_MS = 5 * 60 * 1_000;

export const INITIAL_DEMO_STATE: DemoState = Object.freeze({
  events: [],
  tickets: [],
  listings: [],
  intents: [],
  sequence: 0,
  activity: [],
});

type DomainAction =
  | { type: 'reset' }
  | {
      type: 'createEvent';
      now: number;
      input: Omit<EventRecord, 'id' | 'createdAt' | 'sold' | 'status'>;
    }
  | { type: 'publishEvent'; now: number; eventId: string; organizer: Address }
  | { type: 'buyPrimary'; now: number; eventId: string; buyer: Address }
  | { type: 'giftTicket'; now: number; ticketId: string; owner: Address; recipient: Address }
  | { type: 'listTicket'; now: number; ticketId: string; seller: Address; priceLamports: bigint }
  | { type: 'cancelListing'; now: number; listingId: string; seller: Address }
  | { type: 'buyResale'; now: number; listingId: string; buyer: Address }
  | { type: 'presentCheckIn'; now: number; ticketId: string; holder: Address }
  | { type: 'cancelCheckIn'; now: number; intentId: string; holder: Address }
  | { type: 'expireCheckIn'; now: number; intentId: string }
  | { type: 'consumeCheckIn'; now: number; intentId: string; staff: Address };

function fail(code: string, message: string): never {
  throw new GatewayError(code, message);
}

function nextId(state: DemoState, prefix: string): string {
  return `${prefix}-${String(state.sequence + 1).padStart(3, '0')}`;
}

function record(state: DemoState, label: string, now: number): DemoState {
  const serial = String(state.sequence + 1).padStart(6, '0');
  return {
    ...state,
    sequence: state.sequence + 1,
    activity: [
      { id: `act-${serial}`, label, at: now, signature: `demo-${serial}` },
      ...state.activity,
    ].slice(0, 12),
  };
}

export function demoReducer(state: DemoState, action: DomainAction): DemoState {
  if (action.type === 'reset') return INITIAL_DEMO_STATE;

  if (action.type === 'createEvent') {
    if (!action.input.title.trim() || !action.input.venue.trim()) {
      fail('INVALID_EVENT', 'Nombre y sede son obligatorios.');
    }
    if (
      !Number.isSafeInteger(action.input.capacity) ||
      action.input.capacity < 1 ||
      action.input.priceLamports < 0n ||
      !Number.isFinite(action.input.checkInStartsAt) ||
      !Number.isFinite(action.input.checkInEndsAt) ||
      action.input.checkInStartsAt >= action.input.checkInEndsAt
    ) {
      fail('INVALID_EVENT', 'Aforo y precio deben ser válidos.');
    }
    const withActivity = record(state, 'Evento creado en borrador', action.now);
    const event: EventRecord = {
      ...action.input,
      id: nextId(state, 'evt'),
      title: action.input.title.trim(),
      venue: action.input.venue.trim(),
      status: 'draft',
      sold: 0,
      createdAt: action.now,
    };
    return { ...withActivity, events: [...state.events, event] };
  }

  if (action.type === 'publishEvent') {
    const event = state.events.find((item) => item.id === action.eventId);
    if (!event) fail('EVENT_NOT_FOUND', 'No encontramos el evento.');
    if (event.organizer !== action.organizer)
      fail('UNAUTHORIZED', 'Solo el organizador puede publicar.');
    if (event.status !== 'draft') fail('INVALID_EVENT_STATUS', 'El evento ya no está en borrador.');
    const next = record(state, 'Evento publicado', action.now);
    return {
      ...next,
      events: state.events.map((item) =>
        item.id === event.id ? { ...item, status: 'published' } : item,
      ),
    };
  }

  if (action.type === 'buyPrimary') {
    const event = state.events.find((item) => item.id === action.eventId);
    if (!event || event.status !== 'published')
      fail('EVENT_NOT_ON_SALE', 'El evento no está a la venta.');
    if (event.sold >= event.capacity) fail('EVENT_SOLD_OUT', 'El evento agotó su aforo.');
    const id = nextId(state, 'tkt');
    const next = record(state, `Boleto ${id} comprado`, action.now);
    return {
      ...next,
      events: state.events.map((item) =>
        item.id === event.id ? { ...item, sold: item.sold + 1 } : item,
      ),
      tickets: [
        ...state.tickets,
        {
          id,
          eventId: event.id,
          owner: action.buyer,
          originalOwner: action.buyer,
          originalPriceLamports: event.priceLamports,
          assetId: `demo-asset-${id}`,
          status: 'active',
          transferCount: 0,
        },
      ],
    };
  }

  if (action.type === 'giftTicket') {
    const ticket = state.tickets.find((item) => item.id === action.ticketId);
    if (!ticket) fail('TICKET_NOT_FOUND', 'No encontramos el boleto.');
    if (ticket.owner !== action.owner) fail('UNAUTHORIZED', 'La wallet no es titular del boleto.');
    if (ticket.status !== 'active')
      fail('TICKET_UNAVAILABLE', 'El boleto no puede transferirse ahora.');
    if (action.owner === action.recipient)
      fail('INVALID_RECIPIENT', 'El destinatario debe ser otra wallet.');
    const next = record(state, `Boleto ${ticket.id} regalado`, action.now);
    return {
      ...next,
      tickets: state.tickets.map((item) =>
        item.id === ticket.id
          ? { ...item, owner: action.recipient, transferCount: item.transferCount + 1 }
          : item,
      ),
    };
  }

  if (action.type === 'listTicket') {
    const ticket = state.tickets.find((item) => item.id === action.ticketId);
    if (!ticket) fail('TICKET_NOT_FOUND', 'No encontramos el boleto.');
    if (ticket.owner !== action.seller)
      fail('UNAUTHORIZED', 'Solo el titular puede publicar el boleto.');
    if (ticket.status !== 'active') fail('TICKET_UNAVAILABLE', 'El boleto no está disponible.');
    const maximum =
      ticket.originalPriceLamports +
      (ticket.originalPriceLamports * BigInt(MAX_RESALE_MARKUP_BPS)) / 10_000n;
    if (action.priceLamports < 1n || action.priceLamports > maximum) {
      fail('INVALID_RESALE_PRICE', 'El precio excede el máximo de reventa del 20%.');
    }
    const id = nextId(state, 'lst');
    const next = record(state, `Boleto ${ticket.id} publicado en reventa`, action.now);
    return {
      ...next,
      tickets: state.tickets.map((item) =>
        item.id === ticket.id ? { ...item, status: 'listed' } : item,
      ),
      listings: [
        ...state.listings,
        {
          id,
          eventId: ticket.eventId,
          ticketId: ticket.id,
          seller: action.seller,
          priceLamports: action.priceLamports,
          status: 'open',
          createdAt: action.now,
        },
      ],
    };
  }

  if (action.type === 'cancelListing') {
    const listing = state.listings.find((item) => item.id === action.listingId);
    if (!listing) fail('LISTING_NOT_FOUND', 'No encontramos la publicación.');
    if (listing.seller !== action.seller) fail('UNAUTHORIZED', 'Solo el vendedor puede cancelar.');
    if (listing.status !== 'open') fail('LISTING_CLOSED', 'La publicación ya está cerrada.');
    const next = record(state, `Reventa de ${listing.ticketId} cancelada`, action.now);
    return {
      ...next,
      listings: state.listings.map((item) =>
        item.id === listing.id ? { ...item, status: 'cancelled' } : item,
      ),
      tickets: state.tickets.map((item) =>
        item.id === listing.ticketId ? { ...item, status: 'active' } : item,
      ),
    };
  }

  if (action.type === 'buyResale') {
    const listing = state.listings.find((item) => item.id === action.listingId);
    if (!listing || listing.status !== 'open')
      fail('LISTING_CLOSED', 'La publicación ya no está disponible.');
    if (listing.seller === action.buyer)
      fail('INVALID_BUYER', 'El vendedor no puede comprar su publicación.');
    const ticket = state.tickets.find((item) => item.id === listing.ticketId);
    if (!ticket || ticket.owner !== listing.seller || ticket.status !== 'listed') {
      fail('OWNERSHIP_MISMATCH', 'La propiedad del boleto no coincide con la publicación.');
    }
    const next = record(state, `Boleto ${ticket.id} revendido`, action.now);
    return {
      ...next,
      listings: state.listings.map((item) =>
        item.id === listing.id ? { ...item, status: 'sold', buyer: action.buyer } : item,
      ),
      tickets: state.tickets.map((item) =>
        item.id === ticket.id
          ? {
              ...item,
              owner: action.buyer,
              status: 'active',
              transferCount: item.transferCount + 1,
            }
          : item,
      ),
    };
  }

  if (action.type === 'presentCheckIn') {
    const ticket = state.tickets.find((item) => item.id === action.ticketId);
    if (!ticket) fail('TICKET_NOT_FOUND', 'No encontramos el boleto.');
    if (ticket.owner !== action.holder)
      fail('UNAUTHORIZED', 'Solo el titular puede presentar el boleto.');
    if (ticket.status === 'used') fail('TICKET_ALREADY_USED', 'Este boleto ya fue utilizado.');
    if (ticket.status !== 'active')
      fail('TICKET_UNAVAILABLE', 'Retira el boleto de reventa antes de presentarlo.');
    const event = state.events.find((item) => item.id === ticket.eventId);
    if (
      !event ||
      event.status !== 'published' ||
      action.now < event.checkInStartsAt ||
      action.now > event.checkInEndsAt
    ) {
      fail('CHECK_IN_CLOSED', 'La ventana de acceso no está abierta.');
    }
    const active = state.intents.find(
      (intent) => intent.ticketId === ticket.id && intent.status === 'active',
    );
    if (active)
      fail('INTENT_ALREADY_ACTIVE', 'Ya existe una presentación activa para este boleto.');
    const id = nextId(state, 'int');
    const next = record(state, `Acceso ${ticket.id} presentado por 5 minutos`, action.now);
    return {
      ...next,
      intents: [
        ...state.intents,
        {
          id,
          eventId: ticket.eventId,
          ticketId: ticket.id,
          holder: action.holder,
          createdAt: action.now,
          expiresAt: action.now + CHECK_IN_TTL_MS,
          status: 'active',
        },
      ],
    };
  }

  if (action.type === 'cancelCheckIn') {
    const intent = state.intents.find((item) => item.id === action.intentId);
    if (!intent) fail('INTENT_NOT_FOUND', 'No encontramos la presentación de acceso.');
    if (intent.holder !== action.holder)
      fail('UNAUTHORIZED', 'Solo el titular puede cancelar su presentación.');
    if (intent.status !== 'active') fail('INTENT_NOT_ACTIVE', 'La presentación ya no está activa.');
    const next = record(state, `Presentación ${intent.ticketId} cancelada`, action.now);
    return {
      ...next,
      intents: state.intents.map((item) =>
        item.id === intent.id ? { ...item, status: 'cancelled' } : item,
      ),
    };
  }

  if (action.type === 'expireCheckIn') {
    const intent = state.intents.find((item) => item.id === action.intentId);
    if (!intent) fail('INTENT_NOT_FOUND', 'No encontramos la presentación de acceso.');
    if (intent.status !== 'active') fail('INTENT_NOT_ACTIVE', 'La presentación ya no está activa.');
    if (intent.expiresAt > action.now)
      fail('INTENT_NOT_EXPIRED', 'La presentación todavía no expira.');
    const next = record(state, `Presentación ${intent.ticketId} expirada`, action.now);
    return {
      ...next,
      intents: state.intents.map((item) =>
        item.id === intent.id ? { ...item, status: 'expired' } : item,
      ),
    };
  }

  const intent = state.intents.find((item) => item.id === action.intentId);
  if (!intent) fail('INTENT_NOT_FOUND', 'No encontramos la presentación de acceso.');
  const event = state.events.find((item) => item.id === intent.eventId);
  if (!event?.staff.includes(action.staff))
    fail('UNAUTHORIZED_STAFF', 'La wallet no está autorizada como staff.');
  const ticket = state.tickets.find((item) => item.id === intent.ticketId);
  if (!ticket) fail('TICKET_NOT_FOUND', 'No encontramos el boleto.');
  if (ticket.status === 'used' || intent.status === 'consumed') {
    fail('TICKET_ALREADY_USED', 'Acceso rechazado: este boleto ya fue utilizado.');
  }
  if (intent.status !== 'active' || intent.expiresAt <= action.now) {
    fail('INTENT_EXPIRED', 'La presentación expiró; el titular debe generar una nueva.');
  }
  if (ticket.owner !== intent.holder)
    fail('OWNERSHIP_MISMATCH', 'El titular actual ya no coincide.');
  const next = record(state, `Acceso ${ticket.id} validado`, action.now);
  return {
    ...next,
    tickets: state.tickets.map((item) =>
      item.id === ticket.id ? { ...item, status: 'used', usedAt: action.now } : item,
    ),
    intents: state.intents.map((item) =>
      item.id === intent.id
        ? { ...item, status: 'consumed', consumedAt: action.now, consumedBy: action.staff }
        : item,
    ),
  };
}

export type { DomainAction };
