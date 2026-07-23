import { address, type Blockhash } from '@solana/kit';
import { describe, expect, it, vi } from 'vitest';
import {
  AssetStandard,
  CENTLALIA_TICKETING_PROGRAM_ADDRESS,
  getCreateEventInstructionDataDecoder,
} from '../src/generated';
import { CodamaProgramAdapter, type RpcOverrides, type SolanaWalletBridge } from '../src';

const walletAddress = address('11111111111111111111111111111111');
const anotherAddress = address('SysvarRent111111111111111111111111111111111');
const blockhash = '11111111111111111111111111111111' as Blockhash;

function wallet() {
  const send = vi.fn(
    async (transaction: Uint8Array, options?: { skipPreflight?: boolean }): Promise<string> => {
      void options;
      void transaction;
      return 'wallet-standard-signature';
    },
  );
  return {
    bridge: {
      name: 'Wallet de prueba',
      address: walletAddress,
      signAndSendTransaction: send,
    },
    send,
  };
}

function readyAdapter(bridge: SolanaWalletBridge, overrides: Partial<RpcOverrides> = {}) {
  return new CodamaProgramAdapter({
    rpcUrl: 'https://api.devnet.solana.com',
    wallet: bridge,
    rpcOverrides: {
      getProgramAccount: async () => ({ executable: true }),
      getPlatformInitialized: async () => true,
      getLatestBlockhash: async () => ({ blockhash, lastValidBlockHeight: 10n }),
      ...overrides,
    },
  });
}

const details = {
  title: 'Encuentro Solana Centro',
  metadataUri: 'https://example.com/event.json',
  salesStartAt: 1_000n,
  salesEndAt: 2_000n,
  startsAt: 3_000n,
  endsAt: 5_000n,
  checkInStartAt: 2_500n,
  checkInEndAt: 4_500n,
  maxResaleMarkupBps: 2_000,
  organizerRoyaltyBps: 500,
  resaleEnabled: true,
};

describe('CodamaProgramAdapter', () => {
  it('construye con Codama las operaciones Managed y Core del vertical real', async () => {
    const { bridge } = wallet();
    const adapter = readyAdapter(bridge);
    const event = anotherAddress;
    const tier = walletAddress;
    const ticketRecord = anotherAddress;
    const checkInIntent = walletAddress;

    const instructions = await Promise.all([
      adapter.buildInitializePlatform({
        programData: anotherAddress,
        treasury: anotherAddress,
        platformFeeBps: 0,
        assetStandard: AssetStandard.Managed,
      }),
      adapter.buildCreateEvent({ eventId: 7n, details }),
      adapter.buildAddTier({
        event,
        tierId: 0,
        name: 'General',
        priceLamports: 100_000_000n,
        supply: 40,
      }),
      adapter.buildPublishEvent({ event }),
      adapter.buildAuthorizeStaff({ event, staff: anotherAddress }),
      adapter.buildPrimaryPurchase({
        event,
        tier,
        organizer: anotherAddress,
        treasury: anotherAddress,
        ticketId: 0n,
      }),
      adapter.buildPresentCheckIn({
        event,
        ticketRecord,
        intentNonce: 0n,
        expiresAt: 3_300n,
      }),
      adapter.buildConsumeCheckIn({
        event,
        ticketRecord,
        checkInIntent,
      }),
      adapter.buildPrimaryPurchaseCore({
        event,
        tier,
        organizer: anotherAddress,
        treasury: anotherAddress,
        ticketId: 0n,
      }),
      adapter.buildPresentCheckInCore({
        event,
        ticketRecord,
        coreAsset: anotherAddress,
        intentNonce: 0n,
        expiresAt: 3_300n,
      }),
      adapter.buildConsumeCheckInCore({
        event,
        ticketRecord,
        coreAsset: anotherAddress,
        checkInIntent,
      }),
    ]);

    expect(instructions).toHaveLength(11);
    expect(
      instructions.every(
        (instruction) => instruction.programAddress === CENTLALIA_TICKETING_PROGRAM_ADDRESS,
      ),
    ).toBe(true);
    const createData = getCreateEventInstructionDataDecoder().decode(instructions[1].data!);
    expect(createData).toMatchObject({ eventId: 7n, details: { title: details.title } });
  });

  it('serializa v0 y entrega a Wallet Standard solo si el programa es ejecutable', async () => {
    const currentWallet = wallet();
    const adapter = readyAdapter(currentWallet.bridge);
    const instruction = await adapter.buildCreateEvent({ eventId: 8n, details });

    await expect(adapter.sendInstructions([instruction])).resolves.toBe(
      'wallet-standard-signature',
    );
    expect(currentWallet.send).toHaveBeenCalledOnce();
    expect(currentWallet.send.mock.calls[0]?.[0]).toBeInstanceOf(Uint8Array);
    expect(currentWallet.send.mock.calls[0]?.[0].byteLength).toBeGreaterThan(100);
  });

  it('propaga skipPreflight a Wallet Standard para registrar una falla on-chain', async () => {
    const currentWallet = wallet();
    const adapter = readyAdapter(currentWallet.bridge);
    const instruction = await adapter.buildCreateEvent({ eventId: 12n, details });

    await adapter.sendInstructions([instruction], { skipPreflight: true });

    expect(currentWallet.send).toHaveBeenCalledWith(expect.any(Uint8Array), {
      skipPreflight: true,
    });
  });

  it('acepta solo la transaccion fallida con el custom error esperado', async () => {
    const currentWallet = wallet();
    const adapter = readyAdapter(currentWallet.bridge, {
      getSignatureStatus: async () => ({
        err: { InstructionError: [0, { Custom: 6036 }] },
        confirmationStatus: 'confirmed',
      }),
    });

    await expect(adapter.waitForCustomTransactionError('failed-signature', 6036, 1)).resolves.toBe(
      undefined,
    );
    await expect(adapter.signatureFailedWithCustomError('failed-signature', 6036)).resolves.toBe(
      true,
    );
  });

  it('rechaza como critica una segunda transaccion que finaliza con exito', async () => {
    const currentWallet = wallet();
    const adapter = readyAdapter(currentWallet.bridge, {
      getSignatureStatus: async () => ({ err: null, confirmationStatus: 'finalized' }),
    });

    await expect(
      adapter.waitForCustomTransactionError('unexpected-success', 6036, 1),
    ).rejects.toMatchObject({ code: 'TRANSACTION_UNEXPECTEDLY_SUCCEEDED' });
  });

  it('bloquea el envío antes de pedir firma cuando el programa no está desplegado', async () => {
    const currentWallet = wallet();
    const adapter = new CodamaProgramAdapter({
      rpcUrl: 'https://api.devnet.solana.com',
      wallet: currentWallet.bridge,
      rpcOverrides: { getProgramAccount: async () => null },
    });
    const instruction = await adapter.buildCreateEvent({ eventId: 9n, details });

    await expect(adapter.sendInstructions([instruction])).rejects.toMatchObject({
      code: 'PROGRAM_NOT_DEPLOYED',
    });
    expect(currentWallet.send).not.toHaveBeenCalled();
  });

  it('reporta por separado ejecutabilidad e inicialización de plataforma', async () => {
    const { bridge } = wallet();
    const adapter = new CodamaProgramAdapter({
      rpcUrl: 'https://api.devnet.solana.com',
      wallet: bridge,
      rpcOverrides: {
        getProgramAccount: async () => ({ executable: true }),
        getPlatformInitialized: async () => false,
      },
    });
    await expect(adapter.diagnose()).resolves.toMatchObject({
      availability: 'ready',
      executable: true,
      platformInitialized: false,
    });
  });

  it('bloquea operaciones normales si la plataforma no está inicializada', async () => {
    const currentWallet = wallet();
    const adapter = new CodamaProgramAdapter({
      rpcUrl: 'https://api.devnet.solana.com',
      wallet: currentWallet.bridge,
      rpcOverrides: {
        getProgramAccount: async () => ({ executable: true }),
        getPlatformInitialized: async () => false,
        getLatestBlockhash: async () => ({ blockhash, lastValidBlockHeight: 10n }),
      },
    });
    const instruction = await adapter.buildCreateEvent({ eventId: 10n, details });

    await expect(adapter.sendInstructions([instruction])).rejects.toMatchObject({
      code: 'PLATFORM_NOT_INITIALIZED',
    });
    expect(currentWallet.send).not.toHaveBeenCalled();
  });

  it('permite enviar la inicialización explícita cuando falta PlatformConfig', async () => {
    const currentWallet = wallet();
    const adapter = new CodamaProgramAdapter({
      rpcUrl: 'https://api.devnet.solana.com',
      wallet: currentWallet.bridge,
      rpcOverrides: {
        getProgramAccount: async () => ({ executable: true }),
        getPlatformInitialized: async () => false,
        getLatestBlockhash: async () => ({ blockhash, lastValidBlockHeight: 10n }),
      },
    });
    const instruction = await adapter.buildInitializePlatform({
      programData: anotherAddress,
      treasury: anotherAddress,
      platformFeeBps: 0,
      assetStandard: AssetStandard.Managed,
    });

    await expect(
      adapter.sendInstructions([instruction], { allowUninitializedPlatform: true }),
    ).resolves.toBe('wallet-standard-signature');
    expect(currentWallet.send).toHaveBeenCalledOnce();
  });

  it('bloquea el envío si falla la lectura de PlatformConfig', async () => {
    const currentWallet = wallet();
    const adapter = new CodamaProgramAdapter({
      rpcUrl: 'https://api.devnet.solana.com',
      wallet: currentWallet.bridge,
      rpcOverrides: {
        getProgramAccount: async () => ({ executable: true }),
        getPlatformInitialized: async () => {
          throw new Error('rpc read failed');
        },
      },
    });
    const instruction = await adapter.buildCreateEvent({ eventId: 11n, details });

    await expect(adapter.sendInstructions([instruction])).rejects.toMatchObject({
      code: 'PROGRAM_NOT_DEPLOYED',
    });
    expect(currentWallet.send).not.toHaveBeenCalled();
  });
});
