export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://web-two-amber-35.vercel.app';
  return Response.json({
    name: 'Acceso Centlalia',
    symbol: 'CENT',
    description:
      'Activo de acceso emitido por Centlalia en Solana devnet para validar compra, propiedad y check-in.',
    image: `${baseUrl}/icon.svg`,
    attributes: [
      { trait_type: 'Network', value: 'Solana devnet' },
      { trait_type: 'Validation', value: 'Centlalia vertical' },
    ],
  });
}
