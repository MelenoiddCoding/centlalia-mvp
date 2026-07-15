import { DEMO_IDENTITIES, LAMPORTS_PER_SOL, type Address } from '@centlalia/client';

const names = new Map<Address, string>([
  [DEMO_IDENTITIES.organizer, 'Comunidad Nodo'],
  [DEMO_IDENTITIES.ana, 'Ana'],
  [DEMO_IDENTITIES.bruno, 'Bruno'],
  [DEMO_IDENTITIES.staff, 'Staff puerta'],
]);

export function identityName(address: Address): string {
  return names.get(address) ?? `${address.slice(0, 4)}…${address.slice(-4)}`;
}

export function shortAddress(address: Address): string {
  return `${address.slice(0, 5)}…${address.slice(-4)}`;
}

export function sol(lamports: bigint): string {
  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 3 }).format(
    Number(lamports) / Number(LAMPORTS_PER_SOL),
  )} SOL`;
}

export function dateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function clock(value: number): string {
  return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(value);
}
