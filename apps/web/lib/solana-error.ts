const PROGRAM_ERRORS: Array<[RegExp, string]> = [
  [
    /\b(?:6013|0x177d|CheckInClosed)\b/i,
    'La ventana de check-in de este evento está cerrada. Revisa el horario del evento o crea uno nuevo con check-in vigente.',
  ],
  [
    /\b(?:6035|0x1793|InvalidIntentExpiry)\b/i,
    'No queda tiempo suficiente en la ventana de check-in para presentar este acceso.',
  ],
  [
    /\b(?:6036|0x1794|IntentNotPending)\b/i,
    'Este acceso ya no tiene una presentación pendiente. Actualiza los datos e inténtalo de nuevo.',
  ],
  [/\b(?:6023|0x1787|TicketNotActive)\b/i, 'El boleto ya no está activo y no puede presentarse.'],
  [/\b(?:6024|0x1788|TicketAlreadyUsed)\b/i, 'Este boleto ya fue utilizado.'],
  [
    /\b(?:6025|0x1789|NotTicketOwner)\b/i,
    'La wallet conectada ya no es la propietaria de este boleto.',
  ],
  [
    /\b(?:6034|0x1792|StaffNotAuthorized)\b/i,
    'La wallet de staff no está autorizada para este evento.',
  ],
  [
    /\b(?:6014|0x177e|TransferClosed)\b/i,
    'La circulación cerró al comenzar el check-in. Este boleto ya no puede regalarse ni revenderse.',
  ],
  [/\b(?:6026|0x178a|SameOwner)\b/i, 'La wallet destinataria ya es propietaria de este boleto.'],
  [
    /\b(?:6028|0x178c|InvalidResalePrice)\b/i,
    'El precio supera el límite de reventa configurado por el evento.',
  ],
  [
    /\b(?:6030|0x178e|ListingNotActive)\b/i,
    'El listing ya no está activo. Actualiza el marketplace.',
  ],
  [/\b(?:6031|0x178f|ListingExpired)\b/i, 'El listing expiró y ya no puede comprarse.'],
  [/\b(?:6032|0x1790|SellerCannotBuy)\b/i, 'No puedes comprar tu propio listing.'],
  [
    /\b(?:6041|0x1799|ActiveIntentExists)\b/i,
    'Cancela o deja expirar la presentación de acceso antes de transferir el boleto.',
  ],
];

function collectErrorText(error: unknown, seen = new Set<unknown>()): string[] {
  if (error === null || error === undefined || seen.has(error)) return [];
  if (typeof error === 'string') return [error];
  if (typeof error !== 'object') return [String(error)];

  seen.add(error);
  const candidate = error as Record<string, unknown>;
  return [
    ...(typeof candidate.message === 'string' ? [candidate.message] : []),
    ...collectErrorText(candidate.cause, seen),
    ...collectErrorText(candidate.error, seen),
    ...collectErrorText(candidate.data, seen),
    ...(Array.isArray(candidate.logs)
      ? candidate.logs.filter((item): item is string => typeof item === 'string')
      : []),
  ];
}

export function describeSolanaError(error: unknown, fallback: string): string {
  const messages = collectErrorText(error);
  const details = messages.join(' ');

  for (const [pattern, message] of PROGRAM_ERRORS) {
    if (pattern.test(details)) return message;
  }

  const usefulMessage = messages.find(
    (message) => message.trim() && !/^unexpected error\.?$/i.test(message.trim()),
  );
  if (usefulMessage) return usefulMessage;

  if (/unexpected error/i.test(details)) {
    return 'Phantom rechazó la simulación. Actualiza las cuentas y verifica el estado y la ventana de check-in.';
  }

  return fallback;
}
