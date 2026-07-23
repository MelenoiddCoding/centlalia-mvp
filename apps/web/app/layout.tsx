import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, IBM_Plex_Sans } from 'next/font/google';
import { AppShell } from '@/components/app-shell';
import { SolanaAppProvider } from '@/providers/solana-app-provider';
import './globals.css';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
});

const sans = IBM_Plex_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Centlalia | Eventos verificables',
  description: 'Boletos verificables para comunidades que organizan en Solana.',
};

export const viewport: Viewport = {
  themeColor: '#191812',
  colorScheme: 'light',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>
        <SolanaAppProvider>
          <AppShell>{children}</AppShell>
        </SolanaAppProvider>
      </body>
    </html>
  );
}
