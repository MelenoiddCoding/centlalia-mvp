import { describe, expect, it } from 'vitest';
import { describeSolanaError } from '../lib/solana-error';

describe('describeSolanaError', () => {
  it('translates a nested closed check-in program error', () => {
    const error = {
      message: 'Unexpected error',
      cause: { logs: ['Program failed: custom program error: 0x177d'] },
    };

    expect(describeSolanaError(error, 'Fallback')).toContain('ventana de check-in');
  });

  it('translates an invalid intent expiry', () => {
    expect(describeSolanaError(new Error('Error Code: InvalidIntentExpiry'), 'Fallback')).toContain(
      'No queda tiempo suficiente',
    );
  });

  it('replaces Phantom unexpected errors with an actionable message', () => {
    expect(describeSolanaError(new Error('Unexpected error'), 'Fallback')).toContain(
      'Phantom rechazó la simulación',
    );
  });

  it('preserves a useful wallet message', () => {
    expect(describeSolanaError(new Error('User rejected the request'), 'Fallback')).toBe(
      'User rejected the request',
    );
  });
});
