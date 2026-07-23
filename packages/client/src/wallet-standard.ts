import { getBase58Decoder, address, type Address as KitAddress } from '@solana/kit';
import {
  SolanaSignAndSendTransaction,
  type SolanaSignAndSendTransactionFeature,
} from '@solana/wallet-standard-features';
import { getWallets } from '@wallet-standard/app';
import { StandardConnect, type StandardConnectFeature } from '@wallet-standard/features';
import { GatewayError } from './gateway';

export const SOLANA_DEVNET_CHAIN = 'solana:devnet';

type WalletRegistry = ReturnType<typeof getWallets>;
type RegisteredWallet = ReturnType<WalletRegistry['get']>[number];
type CompatibleWallet = RegisteredWallet & {
  features: RegisteredWallet['features'] &
    StandardConnectFeature &
    SolanaSignAndSendTransactionFeature;
};

export interface WalletDescriptor {
  name: string;
  icon: string;
}

export interface SolanaWalletBridge {
  readonly name: string;
  readonly address: KitAddress;
  signAndSendTransaction(
    transaction: Uint8Array,
    options?: { skipPreflight?: boolean },
  ): Promise<string>;
}

function isCompatibleWallet(wallet: RegisteredWallet): wallet is CompatibleWallet {
  const signAndSend = wallet.features[SolanaSignAndSendTransaction] as
    | SolanaSignAndSendTransactionFeature[typeof SolanaSignAndSendTransaction]
    | undefined;
  return (
    StandardConnect in wallet.features &&
    signAndSend !== undefined &&
    signAndSend.supportedTransactionVersions.includes(0)
  );
}

export function listCompatibleWallets(): WalletDescriptor[] {
  if (typeof window === 'undefined') return [];
  return getWallets()
    .get()
    .filter(isCompatibleWallet)
    .map((wallet) => ({ name: wallet.name, icon: wallet.icon }));
}

export function subscribeCompatibleWallets(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const registry = getWallets();
  const offRegister = registry.on('register', listener);
  const offUnregister = registry.on('unregister', listener);
  return () => {
    offRegister();
    offUnregister();
  };
}

export async function connectWalletStandard(walletName: string): Promise<SolanaWalletBridge> {
  const wallet = getWallets()
    .get()
    .find((candidate) => candidate.name === walletName);
  if (!wallet || !isCompatibleWallet(wallet)) {
    throw new GatewayError(
      'WALLET_UNAVAILABLE',
      'La wallet seleccionada no ofrece conexión y firma Solana compatibles.',
    );
  }

  const { accounts } = await wallet.features[StandardConnect].connect();
  const account = accounts.find(
    (candidate) =>
      candidate.chains.includes(SOLANA_DEVNET_CHAIN) &&
      candidate.features.includes(SolanaSignAndSendTransaction),
  );
  if (!account) {
    throw new GatewayError(
      'DEVNET_ACCOUNT_UNAVAILABLE',
      'La wallet no proporcionó una cuenta de Solana devnet habilitada para firmar y enviar.',
    );
  }

  let walletAddress: KitAddress;
  try {
    walletAddress = address(account.address);
  } catch {
    throw new GatewayError('INVALID_WALLET_ADDRESS', 'La wallet devolvió una dirección inválida.');
  }

  return {
    name: wallet.name,
    address: walletAddress,
    async signAndSendTransaction(transaction, options) {
      const [output] = await wallet.features[SolanaSignAndSendTransaction].signAndSendTransaction({
        account,
        transaction,
        chain: SOLANA_DEVNET_CHAIN,
        options: {
          preflightCommitment: 'confirmed',
          skipPreflight: options?.skipPreflight,
        },
      });
      if (!output) {
        throw new GatewayError(
          'WALLET_SEND_FAILED',
          'La wallet no devolvió una firma de transacción.',
        );
      }
      return getBase58Decoder().decode(output.signature);
    },
  };
}
