import type { CreateEventInput, TicketingGateway, Unsubscribe } from './gateway';
import { demoReducer, INITIAL_DEMO_STATE } from './demo-reducer';
import type { Address, CommandResult, DemoState } from './types';

export interface DemoGatewayOptions {
  now?: () => number;
  initialState?: DemoState;
}

export class DemoGateway implements TicketingGateway {
  readonly mode = 'demo' as const;
  private state: DemoState;
  private readonly listeners = new Set<() => void>();
  private readonly now: () => number;

  constructor(options: DemoGatewayOptions = {}) {
    this.state = options.initialState ?? INITIAL_DEMO_STATE;
    this.now = options.now ?? Date.now;
  }

  getSnapshot = (): DemoState => this.state;

  subscribe = (listener: () => void): Unsubscribe => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private commit(action: Parameters<typeof demoReducer>[1]): Promise<CommandResult> {
    try {
      this.state = demoReducer(this.state, action);
      this.listeners.forEach((listener) => listener());
      const signature = this.state.activity[0]?.signature ?? 'demo-reset';
      return Promise.resolve({ signature, mode: 'demo' });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  reset = () => this.commit({ type: 'reset' });

  createEvent = (input: CreateEventInput) => {
    const now = this.now();
    return this.commit({
      type: 'createEvent',
      now,
      input: {
        ...input,
        staff: [input.staff],
        checkInStartsAt: now - 60_000,
        checkInEndsAt: now + 24 * 60 * 60 * 1_000,
      },
    });
  };

  publishEvent = (eventId: string, organizer: Address) =>
    this.commit({ type: 'publishEvent', now: this.now(), eventId, organizer });

  buyPrimary = (eventId: string, buyer: Address) =>
    this.commit({ type: 'buyPrimary', now: this.now(), eventId, buyer });

  giftTicket = (ticketId: string, owner: Address, recipient: Address) =>
    this.commit({ type: 'giftTicket', now: this.now(), ticketId, owner, recipient });

  listTicket = (ticketId: string, seller: Address, priceLamports: bigint) =>
    this.commit({ type: 'listTicket', now: this.now(), ticketId, seller, priceLamports });

  cancelListing = (listingId: string, seller: Address) =>
    this.commit({ type: 'cancelListing', now: this.now(), listingId, seller });

  buyResale = (listingId: string, buyer: Address) =>
    this.commit({ type: 'buyResale', now: this.now(), listingId, buyer });

  presentCheckIn = (ticketId: string, holder: Address) =>
    this.commit({ type: 'presentCheckIn', now: this.now(), ticketId, holder });

  cancelCheckIn = (intentId: string, holder: Address) =>
    this.commit({ type: 'cancelCheckIn', now: this.now(), intentId, holder });

  expireCheckIn = (intentId: string) =>
    this.commit({ type: 'expireCheckIn', now: this.now(), intentId });

  consumeCheckIn = (intentId: string, staff: Address) =>
    this.commit({ type: 'consumeCheckIn', now: this.now(), intentId, staff });
}
