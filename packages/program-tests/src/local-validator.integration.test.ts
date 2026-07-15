import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { isAbsolute, join, resolve } from 'node:path';

import { generated } from '@centlalia/client';
import {
  address,
  airdropFactory,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  devnet,
  generateKeyPairSigner,
  getAddressEncoder,
  getProgramDerivedAddress,
  getSignatureFromTransaction,
  lamports,
  pipe,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
  appendTransactionMessageInstruction,
  type Instruction,
  type InstructionWithSigners,
  type KeyPairSigner,
} from '@solana/kit';
import { expect, test } from 'vitest';

const UPGRADEABLE_LOADER_ADDRESS = address('BPFLoaderUpgradeab1e11111111111111111111111');
const PROGRAM_ADDRESS = generated.CENTLALIA_TICKETING_PROGRAM_ADDRESS;
const AIRDROP_LAMPORTS = lamports(5_000_000_000n);
const TICKET_PRICE_LAMPORTS = 1_000_000n;

type SignableInstruction = Instruction & InstructionWithSigners;

function requireEnvironment(name: 'ANCHOR_PROVIDER_URL' | 'ANCHOR_WALLET'): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `${name} is required. Run this harness through "anchor test" so the validator, deployment, and provider wallet exist.`,
    );
  }
  return value;
}

function assertLocalEndpoint(rawUrl: string): URL {
  let endpoint: URL;
  try {
    endpoint = new URL(rawUrl);
  } catch {
    throw new Error(`ANCHOR_PROVIDER_URL is not a valid URL: ${rawUrl}`);
  }
  if (!['127.0.0.1', 'localhost', '::1'].includes(endpoint.hostname)) {
    throw new Error(
      `Integration tests require a local validator, received host "${endpoint.hostname}".`,
    );
  }
  return endpoint;
}

function getWebsocketEndpoint(rpcEndpoint: URL): URL {
  const configured = process.env.ANCHOR_PROVIDER_WS_URL?.trim();
  if (configured) return assertLocalEndpoint(configured);

  const port = Number(rpcEndpoint.port);
  if (!Number.isInteger(port) || port <= 0) {
    throw new Error(
      'ANCHOR_PROVIDER_WS_URL is required when ANCHOR_PROVIDER_URL has no explicit port.',
    );
  }
  const websocketEndpoint = new URL(rpcEndpoint);
  websocketEndpoint.protocol = rpcEndpoint.protocol === 'https:' ? 'wss:' : 'ws:';
  websocketEndpoint.port = String(port + 1);
  return websocketEndpoint;
}

function resolveWalletPath(rawPath: string): string {
  if (/^~[\\/]/.test(rawPath)) return join(homedir(), rawPath.slice(2));
  return isAbsolute(rawPath) ? rawPath : resolve(rawPath);
}

async function loadAnchorWallet(rawPath: string): Promise<KeyPairSigner> {
  const walletPath = resolveWalletPath(rawPath);
  let parsed: unknown;
  try {
    parsed = JSON.parse(await readFile(walletPath, 'utf8')) as unknown;
  } catch (error) {
    throw new Error(`Unable to read ANCHOR_WALLET at "${walletPath}".`, { cause: error });
  }
  if (
    !Array.isArray(parsed) ||
    parsed.length !== 64 ||
    parsed.some((value) => !Number.isInteger(value) || value < 0 || value > 255)
  ) {
    throw new Error(`ANCHOR_WALLET at "${walletPath}" must contain a 64-byte keypair array.`);
  }
  return createKeyPairSignerFromBytes(new Uint8Array(parsed as number[]));
}

test('local validator completes purchase and exactly-once check-in', async () => {
  const rpcEndpoint = assertLocalEndpoint(requireEnvironment('ANCHOR_PROVIDER_URL'));
  const websocketEndpoint = getWebsocketEndpoint(rpcEndpoint);
  const rpc = createSolanaRpc(devnet(rpcEndpoint.toString()));
  const rpcSubscriptions = createSolanaRpcSubscriptions(devnet(websocketEndpoint.toString()));
  const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });
  const airdrop = airdropFactory({ rpc, rpcSubscriptions });

  const [admin, organizer, attendee, staff] = await Promise.all([
    loadAnchorWallet(requireEnvironment('ANCHOR_WALLET')),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
    generateKeyPairSigner(),
  ]);
  const roleAddresses = [admin.address, organizer.address, attendee.address, staff.address];
  if (new Set(roleAddresses).size !== roleAddresses.length) {
    throw new Error('Admin, organizer, attendee, and staff must use distinct keypairs.');
  }

  const programAccount = await rpc
    .getAccountInfo(PROGRAM_ADDRESS, { commitment: 'confirmed', encoding: 'base64' })
    .send();
  if (!programAccount.value?.executable) {
    throw new Error(
      `Program ${PROGRAM_ADDRESS} is not deployed and executable. "anchor test" must deploy it before this harness runs.`,
    );
  }

  const [platformConfig] = await generated.findPlatformConfigPda();
  const existingPlatform = await rpc
    .getAccountInfo(platformConfig, { commitment: 'confirmed', encoding: 'base64' })
    .send();
  if (existingPlatform.value) {
    throw new Error(
      `PlatformConfig ${platformConfig} already exists. The integration harness requires a fresh test ledger.`,
    );
  }

  const [programData] = await getProgramDerivedAddress({
    programAddress: UPGRADEABLE_LOADER_ADDRESS,
    seeds: [getAddressEncoder().encode(PROGRAM_ADDRESS)],
  });
  const programDataAccount = await rpc
    .getAccountInfo(programData, { commitment: 'confirmed', encoding: 'base64' })
    .send();
  if (!programDataAccount.value) {
    throw new Error(
      `ProgramData ${programData} is missing. Deploy the program with the upgradeable loader before running tests.`,
    );
  }

  await Promise.all(
    roleAddresses.map((recipientAddress) =>
      airdrop({
        commitment: 'confirmed',
        lamports: AIRDROP_LAMPORTS,
        recipientAddress,
      }),
    ),
  );

  const signatures: Record<string, string> = {};
  const buildTransaction = async (feePayer: KeyPairSigner, instruction: SignableInstruction) => {
    const { value: latestBlockhash } = await rpc
      .getLatestBlockhash({ commitment: 'confirmed' })
      .send();
    const message = pipe(
      createTransactionMessage({ version: 0 }),
      (current) => setTransactionMessageFeePayerSigner(feePayer, current),
      (current) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, current),
      (current) => appendTransactionMessageInstruction(instruction, current),
    );
    const transaction = await signTransactionMessageWithSigners(message);
    assertIsTransactionWithBlockhashLifetime(transaction);
    return { message, transaction };
  };
  const submit = async (
    label: string,
    feePayer: KeyPairSigner,
    instruction: SignableInstruction,
  ) => {
    const built = await buildTransaction(feePayer, instruction);
    await sendAndConfirm(built.transaction, {
      commitment: 'confirmed',
      skipPreflight: false,
    });
    const signature = getSignatureFromTransaction(built.transaction);
    signatures[label] = signature;
    return built;
  };

  await submit(
    'initializePlatform',
    admin,
    await generated.getInitializePlatformInstructionAsync({
      admin,
      assetStandard: generated.AssetStandard.Managed,
      platformFeeBps: 0,
      program: PROGRAM_ADDRESS,
      programData,
      treasury: admin.address,
    }),
  );

  const now = BigInt(Math.floor(Date.now() / 1_000));
  const eventId = BigInt(Date.now());
  const tierId = 0;
  const ticketId = 0n;
  const intentNonce = 0n;
  const [event] = await generated.findEventPda({ eventId, organizer: organizer.address });
  const [tier] = await generated.findTierPda({ event, tierId });
  const [ticketRecord] = await generated.findTicketRecordPda({ event, ticketId });
  const [managedAsset] = await generated.findManagedAssetPda({ ticketRecord });
  const [staffAuthorization] = await generated.findStaffAuthorizationPda({
    event,
    staff: staff.address,
  });
  const [checkInIntent] = await generated.findCheckInIntentPda({
    intentNonce,
    ticketRecord,
  });

  await submit(
    'createEvent',
    organizer,
    await generated.getCreateEventInstructionAsync({
      details: {
        checkInEndAt: now + 600n,
        checkInStartAt: now - 30n,
        endsAt: now + 900n,
        maxResaleMarkupBps: 2_000,
        metadataUri: 'https://example.test/events/local-validator.json',
        organizerRoyaltyBps: 500,
        resaleEnabled: true,
        salesEndAt: now + 180n,
        salesStartAt: now - 30n,
        startsAt: now + 300n,
        title: 'Centlalia Local Validator',
      },
      event,
      eventId,
      organizer,
    }),
  );
  await submit(
    'addTier',
    organizer,
    await generated.getAddTierInstructionAsync({
      event,
      name: 'General',
      organizer,
      priceLamports: TICKET_PRICE_LAMPORTS,
      supply: 10,
      tier,
      tierId,
    }),
  );
  await submit(
    'publishEvent',
    organizer,
    await generated.getPublishEventInstructionAsync({ event, organizer }),
  );
  await submit(
    'primaryPurchase',
    attendee,
    await generated.getPrimaryPurchaseInstructionAsync({
      assetAuthority: (await generated.findAssetAuthorityPda({ platformConfig }))[0],
      buyer: attendee,
      event,
      managedAsset,
      organizer: organizer.address,
      platformConfig,
      ticketId,
      ticketRecord,
      tier,
      treasury: admin.address,
    }),
  );
  await submit(
    'authorizeStaff',
    organizer,
    await generated.getAuthorizeStaffInstructionAsync({
      event,
      organizer,
      staff: staff.address,
      staffAuthorization,
    }),
  );

  const expiresAt = BigInt(Math.floor(Date.now() / 1_000) + 240);
  await submit(
    'presentCheckIn',
    attendee,
    await generated.getPresentCheckInInstructionAsync({
      checkInIntent,
      event,
      expiresAt,
      holder: attendee,
      intentNonce,
      managedAsset,
      ticketRecord,
    }),
  );
  const consumeInstruction = await generated.getConsumeCheckInInstructionAsync({
    checkInIntent,
    event,
    managedAsset,
    staff,
    staffAuthorization,
    ticketRecord,
  });
  await submit('consumeCheckIn', staff, consumeInstruction);

  const duplicate = await buildTransaction(staff, consumeInstruction);
  let duplicateError: unknown;
  try {
    await sendAndConfirm(duplicate.transaction, {
      commitment: 'confirmed',
      // Confirmation exposes InstructionError.Custom(6036); preflight wraps it as an RPC error.
      skipPreflight: true,
    });
  } catch (error) {
    duplicateError = error;
  }
  expect(
    duplicateError,
    'The second consume_check_in transaction unexpectedly succeeded.',
  ).toBeDefined();
  expect(
    generated.isCentlaliaTicketingError(
      duplicateError,
      duplicate.message,
      generated.CENTLALIA_TICKETING_ERROR__INTENT_NOT_PENDING,
    ),
    'The second consume_check_in must fail specifically with IntentNotPending (6036).',
  ).toBe(true);

  const [ticketAccount, intentAccount] = await Promise.all([
    generated.fetchTicketRecord(rpc, ticketRecord, { commitment: 'confirmed' }),
    generated.fetchCheckInIntent(rpc, checkInIntent, { commitment: 'confirmed' }),
  ]);
  expect(ticketAccount.data.owner).toBe(attendee.address);
  expect(ticketAccount.data.status).toBe(generated.TicketStatus.Used);
  expect(ticketAccount.data.usedBy).toEqual({ __option: 'Some', value: staff.address });
  expect(ticketAccount.data.activeIntent).toEqual({ __option: 'None' });
  expect(intentAccount.data.holder).toBe(attendee.address);
  expect(intentAccount.data.status).toBe(generated.CheckInIntentStatus.Consumed);
  expect(intentAccount.data.staff).toEqual({ __option: 'Some', value: staff.address });

  console.info(
    JSON.stringify(
      {
        accounts: {
          admin: admin.address,
          attendee: attendee.address,
          checkInIntent,
          event,
          managedAsset,
          organizer: organizer.address,
          platformConfig,
          staff: staff.address,
          staffAuthorization,
          ticketRecord,
          tier,
        },
        signatures,
      },
      null,
      2,
    ),
  );
});
