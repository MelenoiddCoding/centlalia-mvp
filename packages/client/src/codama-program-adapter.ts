import {
  appendTransactionMessageInstructions,
  compileTransaction,
  createSolanaRpc,
  createTransactionMessage,
  getTransactionEncoder,
  pipe,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  type Address,
  type Blockhash,
  type Instruction,
  type TransactionSigner,
} from '@solana/kit';
import {
  CENTLALIA_TICKETING_PROGRAM_ADDRESS,
  fetchMaybeEvent,
  fetchMaybePlatformConfig,
  findPlatformConfigPda,
  getAddTierInstructionAsync,
  getAuthorizeStaffInstructionAsync,
  getConsumeCheckInInstructionAsync,
  getCreateEventInstructionAsync,
  getInitializePlatformInstructionAsync,
  getPresentCheckInInstructionAsync,
  getPrimaryPurchaseInstructionAsync,
  getPublishEventInstructionAsync,
  type AddTierAsyncInput,
  type AuthorizeStaffAsyncInput,
  type ConsumeCheckInAsyncInput,
  type CreateEventAsyncInput,
  type InitializePlatformAsyncInput,
  type PresentCheckInAsyncInput,
  type PrimaryPurchaseAsyncInput,
  type PublishEventAsyncInput,
} from './generated';
import { GatewayError } from './gateway';
import type { SolanaWalletBridge } from './wallet-standard';

export type ProgramAvailability = 'ready' | 'missing' | 'not-executable' | 'rpc-error';

export interface ProgramDiagnostic {
  availability: ProgramAvailability;
  programAddress: typeof CENTLALIA_TICKETING_PROGRAM_ADDRESS;
  rpcUrl: string;
  executable: boolean;
  platformInitialized?: boolean;
  checkedAt: number;
  detail: string;
}

export interface RpcOverrides {
  getProgramAccount?: () => Promise<{ executable: boolean } | null>;
  getPlatformInitialized?: () => Promise<boolean>;
  getLatestBlockhash?: () => Promise<{
    blockhash: Blockhash;
    lastValidBlockHeight: bigint;
  }>;
}

export interface CodamaProgramAdapterOptions {
  rpcUrl: string;
  wallet?: SolanaWalletBridge;
  rpcOverrides?: RpcOverrides;
}

export type InitializePlatformOperation = Omit<InitializePlatformAsyncInput, 'admin'>;
export type CreateEventOperation = Omit<CreateEventAsyncInput, 'organizer'>;
export type AddTierOperation = Omit<AddTierAsyncInput, 'organizer'>;
export type PublishEventOperation = Omit<PublishEventAsyncInput, 'organizer'>;
export type AuthorizeStaffOperation = Omit<AuthorizeStaffAsyncInput, 'organizer'>;
export type PrimaryPurchaseOperation = Omit<PrimaryPurchaseAsyncInput, 'buyer'>;
export type PresentCheckInOperation = Omit<PresentCheckInAsyncInput, 'holder'>;
export type ConsumeCheckInOperation = Omit<ConsumeCheckInAsyncInput, 'staff'>;

function validatedRpcUrl(rpcUrl: string): string {
  try {
    const endpoint = new URL(rpcUrl);
    if (
      endpoint.protocol !== 'https:' &&
      endpoint.hostname !== '127.0.0.1' &&
      endpoint.hostname !== 'localhost'
    ) {
      throw new Error('RPC must use HTTPS');
    }
    return endpoint.toString();
  } catch {
    throw new GatewayError('INVALID_RPC_URL', 'El endpoint RPC de Solana no es válido.');
  }
}

function instructionSigner(wallet: SolanaWalletBridge): TransactionSigner {
  return Object.freeze({
    address: wallet.address,
    async signTransactions() {
      throw new GatewayError(
        'SIGNER_BOUNDARY_VIOLATION',
        'La wallet debe firmar la transacción serializada mediante Wallet Standard.',
      );
    },
  });
}

export class CodamaProgramAdapter {
  readonly programAddress = CENTLALIA_TICKETING_PROGRAM_ADDRESS;
  readonly rpcUrl: string;
  private readonly rpc;
  private wallet?: SolanaWalletBridge;
  private readonly overrides?: RpcOverrides;

  constructor(options: CodamaProgramAdapterOptions) {
    this.rpcUrl = validatedRpcUrl(options.rpcUrl);
    this.rpc = createSolanaRpc(this.rpcUrl);
    this.wallet = options.wallet;
    this.overrides = options.rpcOverrides;
  }

  setWallet(wallet: SolanaWalletBridge | undefined): void {
    this.wallet = wallet;
  }

  private requireWallet(): SolanaWalletBridge {
    if (!this.wallet) {
      throw new GatewayError(
        'WALLET_NOT_CONNECTED',
        'Conecta una wallet compatible antes de construir una operación real.',
      );
    }
    return this.wallet;
  }

  private async getProgramAccount(): Promise<{ executable: boolean } | null> {
    if (this.overrides?.getProgramAccount) return this.overrides.getProgramAccount();
    const response = await this.rpc
      .getAccountInfo(this.programAddress, { commitment: 'confirmed', encoding: 'base64' })
      .send();
    return response.value ? { executable: response.value.executable } : null;
  }

  async diagnose(): Promise<ProgramDiagnostic> {
    const base = {
      programAddress: this.programAddress,
      rpcUrl: this.rpcUrl,
      checkedAt: Date.now(),
    } as const;
    try {
      const account = await this.getProgramAccount();
      if (!account) {
        return {
          ...base,
          availability: 'missing',
          executable: false,
          detail: 'El program account no existe en este RPC.',
        };
      }
      if (!account.executable) {
        return {
          ...base,
          availability: 'not-executable',
          executable: false,
          detail: 'La cuenta existe, pero no está marcada como programa ejecutable.',
        };
      }

      let platformInitialized: boolean;
      if (this.overrides?.getPlatformInitialized) {
        platformInitialized = await this.overrides.getPlatformInitialized();
      } else {
        const [platformConfig] = await findPlatformConfigPda();
        const account = await fetchMaybePlatformConfig(this.rpc, platformConfig, {
          commitment: 'confirmed',
        });
        platformInitialized = account.exists;
      }
      return {
        ...base,
        availability: 'ready',
        executable: true,
        platformInitialized,
        detail: platformInitialized
          ? 'Programa ejecutable y configuración de plataforma encontrada.'
          : 'Programa ejecutable; la plataforma todavía requiere inicialización.',
      };
    } catch (error) {
      return {
        ...base,
        availability: 'rpc-error',
        executable: false,
        detail: error instanceof Error ? error.message : 'El RPC no respondió.',
      };
    }
  }

  async fetchEvent(event: Address) {
    return fetchMaybeEvent(this.rpc, event, { commitment: 'confirmed' });
  }

  async buildInitializePlatform(input: InitializePlatformOperation): Promise<Instruction> {
    return getInitializePlatformInstructionAsync({
      ...input,
      admin: instructionSigner(this.requireWallet()),
    });
  }

  async buildCreateEvent(input: CreateEventOperation): Promise<Instruction> {
    return getCreateEventInstructionAsync({
      ...input,
      organizer: instructionSigner(this.requireWallet()),
    });
  }

  async buildAddTier(input: AddTierOperation): Promise<Instruction> {
    return getAddTierInstructionAsync({
      ...input,
      organizer: instructionSigner(this.requireWallet()),
    });
  }

  async buildPublishEvent(input: PublishEventOperation): Promise<Instruction> {
    return getPublishEventInstructionAsync({
      ...input,
      organizer: instructionSigner(this.requireWallet()),
    });
  }

  async buildAuthorizeStaff(input: AuthorizeStaffOperation): Promise<Instruction> {
    return getAuthorizeStaffInstructionAsync({
      ...input,
      organizer: instructionSigner(this.requireWallet()),
    });
  }

  async buildPrimaryPurchase(input: PrimaryPurchaseOperation): Promise<Instruction> {
    return getPrimaryPurchaseInstructionAsync({
      ...input,
      buyer: instructionSigner(this.requireWallet()),
    });
  }

  async buildPresentCheckIn(input: PresentCheckInOperation): Promise<Instruction> {
    return getPresentCheckInInstructionAsync({
      ...input,
      holder: instructionSigner(this.requireWallet()),
    });
  }

  async buildConsumeCheckIn(input: ConsumeCheckInOperation): Promise<Instruction> {
    return getConsumeCheckInInstructionAsync({
      ...input,
      staff: instructionSigner(this.requireWallet()),
    });
  }

  private async getLatestBlockhash() {
    if (this.overrides?.getLatestBlockhash) return this.overrides.getLatestBlockhash();
    const response = await this.rpc.getLatestBlockhash({ commitment: 'confirmed' }).send();
    return response.value;
  }

  async sendInstructions(
    instructions: readonly Instruction[],
    options: { allowUninitializedPlatform?: boolean } = {},
  ): Promise<string> {
    if (instructions.length === 0) {
      throw new GatewayError('EMPTY_TRANSACTION', 'La transacción no contiene instrucciones.');
    }
    const diagnostic = await this.diagnose();
    if (diagnostic.availability !== 'ready') {
      throw new GatewayError('PROGRAM_NOT_DEPLOYED', `Envío bloqueado: ${diagnostic.detail}`);
    }
    if (!diagnostic.platformInitialized && !options.allowUninitializedPlatform) {
      throw new GatewayError(
        'PLATFORM_NOT_INITIALIZED',
        'Envío bloqueado: la configuración de plataforma todavía no existe.',
      );
    }
    const wallet = this.requireWallet();
    const lifetime = await this.getLatestBlockhash();
    const message = pipe(
      createTransactionMessage({ version: 0 }),
      (value) => setTransactionMessageFeePayer(wallet.address, value),
      (value) => setTransactionMessageLifetimeUsingBlockhash(lifetime, value),
      (value) => appendTransactionMessageInstructions(instructions, value),
    );
    const transaction = compileTransaction(message);
    const wireTransaction = new Uint8Array(getTransactionEncoder().encode(transaction));
    return wallet.signAndSendTransaction(wireTransaction);
  }
}
