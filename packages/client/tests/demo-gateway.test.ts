import { describe, expect, it } from 'vitest';
import {
  CHECK_IN_TTL_MS,
  DEMO_IDENTITIES,
  DemoGateway,
  GatewayError,
  LAMPORTS_PER_SOL,
  SolanaGateway,
} from '../src';

const eventInput = {
  organizer: DEMO_IDENTITIES.organizer,
  title: 'Taller de wallets',
  venue: 'Nodo CDMX',
  startsAt: '2026-08-08T18:00',
  capacity: 40,
  priceLamports: LAMPORTS_PER_SOL / 10n,
  staff: DEMO_IDENTITIES.staff,
};

describe('DemoGateway', () => {
  it('completa compra, presentación y check-in exactamente una vez', async () => {
    const now = 1_000;
    const gateway = new DemoGateway({ now: () => now });
    await gateway.createEvent(eventInput);
    await gateway.publishEvent('evt-001', DEMO_IDENTITIES.organizer);
    await gateway.buyPrimary('evt-001', DEMO_IDENTITIES.ana);
    await gateway.presentCheckIn('tkt-003', DEMO_IDENTITIES.ana);

    const intent = gateway.getSnapshot().intents[0];
    expect(intent.expiresAt).toBe(now + CHECK_IN_TTL_MS);
    await gateway.consumeCheckIn(intent.id, DEMO_IDENTITIES.staff);
    expect(gateway.getSnapshot().tickets[0].status).toBe('used');

    await expect(gateway.consumeCheckIn(intent.id, DEMO_IDENTITIES.staff)).rejects.toMatchObject({
      code: 'TICKET_ALREADY_USED',
    });
  });

  it('mantiene la propiedad sincronizada al regalar y revender', async () => {
    const gateway = new DemoGateway({ now: () => 2_000 });
    await gateway.createEvent(eventInput);
    await gateway.publishEvent('evt-001', DEMO_IDENTITIES.organizer);
    await gateway.buyPrimary('evt-001', DEMO_IDENTITIES.ana);
    await gateway.giftTicket('tkt-003', DEMO_IDENTITIES.ana, DEMO_IDENTITIES.bruno);
    expect(gateway.getSnapshot().tickets[0]).toMatchObject({
      owner: DEMO_IDENTITIES.bruno,
      transferCount: 1,
    });

    await gateway.buyPrimary('evt-001', DEMO_IDENTITIES.ana);
    await gateway.listTicket('tkt-005', DEMO_IDENTITIES.ana, 110_000_000n);
    await gateway.buyResale('lst-006', DEMO_IDENTITIES.bruno);
    expect(gateway.getSnapshot().tickets[1]).toMatchObject({
      owner: DEMO_IDENTITIES.bruno,
      status: 'active',
      transferCount: 1,
    });
  });

  it('rechaza reventa por encima del límite y presentaciones expiradas', async () => {
    let now = 5_000;
    const gateway = new DemoGateway({ now: () => now });
    await gateway.createEvent(eventInput);
    await gateway.publishEvent('evt-001', DEMO_IDENTITIES.organizer);
    await gateway.buyPrimary('evt-001', DEMO_IDENTITIES.ana);
    await expect(
      gateway.listTicket('tkt-003', DEMO_IDENTITIES.ana, 130_000_000n),
    ).rejects.toBeInstanceOf(GatewayError);
    await gateway.presentCheckIn('tkt-003', DEMO_IDENTITIES.ana);
    now += CHECK_IN_TTL_MS + 1;
    await expect(gateway.consumeCheckIn('int-004', DEMO_IDENTITIES.staff)).rejects.toMatchObject({
      code: 'INTENT_EXPIRED',
    });
  });
});

describe('SolanaGateway', () => {
  it('no fabrica firmas cuando falta el adaptador real', async () => {
    const gateway = new SolanaGateway();
    await expect(gateway.buyPrimary('evt-1', DEMO_IDENTITIES.ana)).rejects.toMatchObject({
      code: 'SOLANA_GATEWAY_UNAVAILABLE',
    });
  });
});
