import { describe, expect, it } from 'vitest';
import {
  appendCheckInEvidence,
  parseCheckInPayload,
  readCheckInEvidence,
  serializeCheckInPayload,
  type CheckInEvidence,
  type CheckInPayload,
} from '../lib/check-in-flow';

const key = '11111111111111111111111111111111';
const payload: CheckInPayload = {
  kind: 'centlalia-check-in',
  version: 1,
  network: 'devnet',
  event: key,
  ticketRecord: key,
  coreAsset: key,
  checkInIntent: key,
  expiresAt: 2_000_000_000,
  presentSignature: 'signature',
};

describe('check-in payload', () => {
  it('round-trips the canonical payload', () => {
    expect(parseCheckInPayload(serializeCheckInPayload(payload))).toEqual(payload);
  });

  it('rejects payloads from another flow', () => {
    expect(() => parseCheckInPayload(JSON.stringify({ ...payload, network: 'mainnet' }))).toThrow(
      'Centlalia devnet',
    );
  });

  it('keeps the newest evidence first without duplicates', () => {
    let value: string | null = null;
    const storage = {
      getItem: () => value,
      setItem: (_key: string, next: string) => {
        value = next;
      },
    };
    const first: CheckInEvidence = {
      id: 'present-signature',
      action: 'present',
      actor: key,
      event: key,
      ticketRecord: key,
      coreAsset: key,
      checkInIntent: key,
      signature: 'present-signature',
      recordedAt: 1,
    };
    appendCheckInEvidence(storage, first);
    appendCheckInEvidence(storage, { ...first, id: 'consume-signature', recordedAt: 2 });

    expect(readCheckInEvidence(storage).map((item) => item.id)).toEqual([
      'consume-signature',
      'present-signature',
    ]);
  });
});
