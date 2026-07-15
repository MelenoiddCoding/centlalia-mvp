import type {
  Address,
  CheckInIntent,
  CommandResult,
  DemoState,
  EventRecord,
  ListingRecord,
  TicketRecord,
} from './types';

export type Unsubscribe = () => void;

export interface CreateEventInput {
  organizer: Address;
  title: string;
  venue: string;
  startsAt: string;
  capacity: number;
  priceLamports: bigint;
  staff: Address;
}

export interface TicketingGateway {
  readonly mode: 'demo' | 'solana';
  getSnapshot(): DemoState;
  subscribe(listener: () => void): Unsubscribe;
  reset(): Promise<CommandResult>;
  createEvent(input: CreateEventInput): Promise<CommandResult>;
  publishEvent(eventId: string, organizer: Address): Promise<CommandResult>;
  buyPrimary(eventId: string, buyer: Address): Promise<CommandResult>;
  giftTicket(ticketId: string, owner: Address, recipient: Address): Promise<CommandResult>;
  listTicket(ticketId: string, seller: Address, priceLamports: bigint): Promise<CommandResult>;
  cancelListing(listingId: string, seller: Address): Promise<CommandResult>;
  buyResale(listingId: string, buyer: Address): Promise<CommandResult>;
  presentCheckIn(ticketId: string, holder: Address): Promise<CommandResult>;
  cancelCheckIn(intentId: string, holder: Address): Promise<CommandResult>;
  expireCheckIn(intentId: string): Promise<CommandResult>;
  consumeCheckIn(intentId: string, staff: Address): Promise<CommandResult>;
}

export class GatewayError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

export class GatewayUnavailableError extends GatewayError {
  constructor() {
    super(
      'SOLANA_GATEWAY_UNAVAILABLE',
      'La conexión Solana aún no está configurada. Usa el modo demo o proporciona el adaptador Anchor/Codama.',
    );
  }
}

export interface SolanaReadModel {
  events: EventRecord[];
  tickets: TicketRecord[];
  listings: ListingRecord[];
  intents: CheckInIntent[];
  activity: DemoState['activity'];
}
