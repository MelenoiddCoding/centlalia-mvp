import { address } from '@solana/kit';

export const CHECK_IN_EVIDENCE_KEY = 'centlalia-check-in-evidence-v1';

export interface CheckInPayload {
  kind: 'centlalia-check-in';
  version: 1;
  network: 'devnet';
  event: string;
  ticketRecord: string;
  coreAsset: string;
  checkInIntent: string;
  expiresAt: number;
  presentSignature: string;
}

export interface CheckInEvidence {
  id: string;
  action: 'present' | 'consume';
  actor: string;
  event: string;
  ticketRecord: string;
  coreAsset: string;
  checkInIntent: string;
  signature: string;
  recordedAt: number;
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${label} inválido.`);
  return value;
}

function requiredAddress(value: unknown, label: string): string {
  const candidate = requiredString(value, label);
  try {
    return address(candidate);
  } catch {
    throw new Error(`${label} no es una dirección Solana válida.`);
  }
}

export function serializeCheckInPayload(payload: CheckInPayload): string {
  return JSON.stringify(payload);
}

export function parseCheckInPayload(value: string): CheckInPayload {
  if (value.length > 4_096) throw new Error('El contenido QR es demasiado grande.');
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error('El QR no contiene JSON válido.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('El QR no contiene un acceso Centlalia.');
  }
  const candidate = parsed as Record<string, unknown>;
  if (
    candidate.kind !== 'centlalia-check-in' ||
    candidate.version !== 1 ||
    candidate.network !== 'devnet'
  ) {
    throw new Error('El QR no pertenece al flujo Centlalia devnet.');
  }
  if (!Number.isInteger(candidate.expiresAt) || Number(candidate.expiresAt) <= 0) {
    throw new Error('La expiración del intent es inválida.');
  }
  return {
    kind: 'centlalia-check-in',
    version: 1,
    network: 'devnet',
    event: requiredAddress(candidate.event, 'Evento'),
    ticketRecord: requiredAddress(candidate.ticketRecord, 'TicketRecord'),
    coreAsset: requiredAddress(candidate.coreAsset, 'Core asset'),
    checkInIntent: requiredAddress(candidate.checkInIntent, 'CheckInIntent'),
    expiresAt: Number(candidate.expiresAt),
    presentSignature: requiredString(candidate.presentSignature, 'Firma de presentación'),
  };
}

export function readCheckInEvidence(storage: Pick<Storage, 'getItem'>): CheckInEvidence[] {
  try {
    const raw = storage.getItem(CHECK_IN_EVIDENCE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CheckInEvidence[]).slice(0, 20) : [];
  } catch {
    return [];
  }
}

export function appendCheckInEvidence(
  storage: Pick<Storage, 'getItem' | 'setItem'>,
  evidence: CheckInEvidence,
): CheckInEvidence[] {
  const next = [evidence, ...readCheckInEvidence(storage).filter((item) => item.id !== evidence.id)]
    .sort((a, b) => b.recordedAt - a.recordedAt)
    .slice(0, 20);
  storage.setItem(CHECK_IN_EVIDENCE_KEY, JSON.stringify(next));
  return next;
}
