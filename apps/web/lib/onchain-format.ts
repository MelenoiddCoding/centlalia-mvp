import { generated } from '@centlalia/client';

export function formatDate(value: bigint): string {
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(Number(value) * 1_000));
}

export function formatSol(value: bigint): string {
  return `${new Intl.NumberFormat('es-MX', { maximumFractionDigits: 4 }).format(Number(value) / 1_000_000_000)} SOL`;
}

export function eventStatusLabel(status: generated.EventStatus): string {
  const labels: Record<generated.EventStatus, string> = {
    [generated.EventStatus.Draft]: 'Borrador',
    [generated.EventStatus.Published]: 'Publicado',
    [generated.EventStatus.Cancelled]: 'Cancelado',
    [generated.EventStatus.Closed]: 'Cerrado',
  };
  return labels[status];
}

export function shortAddress(value: string): string {
  return `${value.slice(0, 5)}...${value.slice(-5)}`;
}

export function toUnix(value: string): bigint {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) throw new Error('La fecha no es válida.');
  return BigInt(Math.floor(timestamp / 1_000));
}

export function toDateTimeLocal(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
