import { address, createSolanaRpc, type Address as KitAddress } from '@solana/kit';
import { GatewayUnavailableError } from './gateway';

export interface SolanaKitBoundary {
  readonly programAddress: KitAddress;
  readonly rpcUrl: string;
  assertProgramDeployed(): Promise<void>;
}

/**
 * Real read boundary for devnet. Transaction instructions are intentionally not
 * fabricated here: the SolanaProgramAdapter must be generated from the Anchor IDL.
 */
export function createSolanaKitBoundary(input: {
  rpcUrl: string;
  programId: string;
}): SolanaKitBoundary {
  let endpoint: URL;
  try {
    endpoint = new URL(input.rpcUrl);
    if (
      endpoint.protocol !== 'https:' &&
      endpoint.hostname !== '127.0.0.1' &&
      endpoint.hostname !== 'localhost'
    ) {
      throw new Error('invalid protocol');
    }
  } catch {
    throw new GatewayUnavailableError();
  }

  let programAddress: KitAddress;
  try {
    programAddress = address(input.programId);
  } catch {
    throw new GatewayUnavailableError();
  }
  const rpc = createSolanaRpc(endpoint.toString());

  return {
    programAddress,
    rpcUrl: endpoint.toString(),
    async assertProgramDeployed() {
      const response = await rpc.getAccountInfo(programAddress, { encoding: 'base64' }).send();
      if (!response.value?.executable) throw new GatewayUnavailableError();
    },
  };
}
