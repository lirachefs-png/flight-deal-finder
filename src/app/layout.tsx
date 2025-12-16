import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import 'react-day-picker/dist/style.css'; // Fix calendar styles explicitly
import { Toaster } from 'sonner';
import { SettingsProvider } from '@/context/SettingsContext';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://alltripapp.com'),
  title: {
    default: 'AllTrip | Passagens Aéreas e Ofertas Exclusivas',
    template: '%s | AllTrip'
  },
  description: 'Descubra voos baratos e promoções secretas de mais de 700 companhias aéreas. Economize até 40% na sua próxima viagem com o AllTrip.',
  applicationName: 'AllTrip',
  keywords: ['passagens aéreas', 'voos baratos', 'promoções de viagens', 'alltrip', 'low cost', 'férias'],
  authors: [{ name: 'AllTrip Team' }],
  creator: 'AllTrip',
  publisher: 'AllTrip',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'AllTrip | Viaje Mais, Pague Menos',
    description: 'Encontre as melhores ofertas de voos em segundos. Tecnologia avançada para caçar os menores preços do mercado.',
    url: 'https://alltripapp.com',
    siteName: 'AllTrip',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AllTrip | Ofertas de Voos',
    description: 'O seu buscador de viagens inteligente.',
    creator: '@alltripapp',
  },
  manifest: "/manifest.json",
  icons: {
    icon: '/favicon.ico', // We should ensure we have icons later
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SettingsProvider>
          {children}
          <Toaster position="top-center" richColors />
          <Footer />
        </SettingsProvider>
      </body>
    </html>
  );
}
