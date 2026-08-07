import { describe, expect, it } from 'vitest';
import { parseSolInput } from '../lib/sol-input';

describe('parseSolInput', () => {
  it('converts SOL without floating point rounding', () => {
    expect(parseSolInput('1.000000001')).toBe(1_000_000_001n);
    expect(parseSolInput('0.01')).toBe(10_000_000n);
  });

  it('rejects zero, negative and excessive precision', () => {
    expect(() => parseSolInput('0')).toThrow('mayor que cero');
    expect(() => parseSolInput('-1')).toThrow('monto válido');
    expect(() => parseSolInput('0.0000000001')).toThrow('monto válido');
  });
});
