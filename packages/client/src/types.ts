export type Address = string;

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'closed';
export type TicketStatus = 'active' | 'listed' | 'used';
export type ListingStatus = 'open' | 'cancelled' | 'sold';
export type IntentStatus = 'active' | 'consumed' | 'expired' | 'cancelled';

export interface EventRecord {
  id: string;
  organizer: Address;
  title: string;
  venue: string;
  startsAt: string;
  capacity: number;
  priceLamports: bigint;
  checkInStartsAt: number;
  checkInEndsAt: number;
  status: EventStatus;
  sold: number;
  staff: Address[];
  createdAt: number;
}

export interface TicketRecord {
  id: string;
  eventId: string;
  owner: Address;
  originalOwner: Address;
  originalPriceLamports: bigint;
  assetId: string;
  status: TicketStatus;
  transferCount: number;
  usedAt?: number;
}

export interface ListingRecord {
  id: string;
  eventId: string;
  ticketId: string;
  seller: Address;
  priceLamports: bigint;
  status: ListingStatus;
  createdAt: number;
  buyer?: Address;
}

export interface CheckInIntent {
  id: string;
  eventId: string;
  ticketId: string;
  holder: Address;
  expiresAt: number;
  status: IntentStatus;
  createdAt: number;
  consumedAt?: number;
  consumedBy?: Address;
}

export interface DemoState {
  events: EventRecord[];
  tickets: TicketRecord[];
  listings: ListingRecord[];
  intents: CheckInIntent[];
  sequence: number;
  activity: ActivityRecord[];
}

export interface ActivityRecord {
  id: string;
  label: string;
  at: number;
  signature: string;
}

export interface CommandResult {
  signature: string;
  mode: 'demo' | 'solana';
}

export const LAMPORTS_PER_SOL = 1_000_000_000n;

export const DEMO_IDENTITIES = {
  organizer: 'Org1Centlalia1111111111111111111111111111',
  ana: 'Ana1Centlalia1111111111111111111111111111',
  bruno: 'Bru1Centlalia1111111111111111111111111111',
  staff: 'Stf1Centlalia1111111111111111111111111111',
} as const satisfies Record<string, Address>;

export type DemoIdentity = keyof typeof DEMO_IDENTITIES;
