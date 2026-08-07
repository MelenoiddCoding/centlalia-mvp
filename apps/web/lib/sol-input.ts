export function parseSolInput(value: string): bigint {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d{1,9})?$/.test(normalized)) {
    throw new Error('Ingresa un monto válido con hasta 9 decimales.');
  }
  const [whole, fraction = ''] = normalized.split('.');
  const lamports = BigInt(whole) * 1_000_000_000n + BigInt(fraction.padEnd(9, '0'));
  if (lamports <= 0n) throw new Error('El precio debe ser mayor que cero.');
  return lamports;
}
