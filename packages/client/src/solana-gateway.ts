import {
  GatewayUnavailableError,
  type CreateEventInput,
  type TicketingGateway,
  type Unsubscribe,
} from './gateway';
import type { Address, CommandResult, DemoState } from './types';

/**
 * Boundary implemented by the generated Codama client plus wallet signer.
 * Every command must resolve only after a real signature is submitted.
 */
export interface SolanaProgramAdapter {
  getSnapshot(): DemoState;
  subscribe(listener: () => void): Unsubscribe;
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

const EMPTY_STATE: DemoState = {
  events: [],
  tickets: [],
  listings: [],
  intents: [],
  activity: [],
  sequence: 0,
};

export class SolanaGateway implements TicketingGateway {
  readonly mode = 'solana' as const;

  constructor(private readonly adapter?: SolanaProgramAdapter) {}

  private requireAdapter(): SolanaProgramAdapter {
    if (!this.adapter) throw new GatewayUnavailableError();
    return this.adapter;
  }

  getSnapshot = () => this.adapter?.getSnapshot() ?? EMPTY_STATE;
  subscribe = (listener: () => void) => this.adapter?.subscribe(listener) ?? (() => undefined);
  reset = async (): Promise<CommandResult> => {
    throw new GatewayUnavailableError();
  };
  createEvent = async (input: CreateEventInput) => this.requireAdapter().createEvent(input);
  publishEvent = async (eventId: string, organizer: Address) =>
    this.requireAdapter().publishEvent(eventId, organizer);
  buyPrimary = async (eventId: string, buyer: Address) =>
    this.requireAdapter().buyPrimary(eventId, buyer);
  giftTicket = async (ticketId: string, owner: Address, recipient: Address) =>
    this.requireAdapter().giftTicket(ticketId, owner, recipient);
  listTicket = async (ticketId: string, seller: Address, priceLamports: bigint) =>
    this.requireAdapter().listTicket(ticketId, seller, priceLamports);
  cancelListing = async (listingId: string, seller: Address) =>
    this.requireAdapter().cancelListing(listingId, seller);
  buyResale = async (listingId: string, buyer: Address) =>
    this.requireAdapter().buyResale(listingId, buyer);
  presentCheckIn = async (ticketId: string, holder: Address) =>
    this.requireAdapter().presentCheckIn(ticketId, holder);
  cancelCheckIn = async (intentId: string, holder: Address) =>
    this.requireAdapter().cancelCheckIn(intentId, holder);
  expireCheckIn = async (intentId: string) => this.requireAdapter().expireCheckIn(intentId);
  consumeCheckIn = async (intentId: string, staff: Address) =>
    this.requireAdapter().consumeCheckIn(intentId, staff);
}
