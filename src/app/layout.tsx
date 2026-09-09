import type { Metadata } from 'next';
import { Outfit, Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '700'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Tripyy - Ride Sharing, Intercity Travel & Set Your Own Fare in Bangladesh',
    template: '%s | Tripyy Bangladesh',
  },
  description:
    "Tripyy is Bangladesh's premier ride-sharing platform where you set your own fare. Book Sedans, Toyota Noah, Hiace microbus, and Chander Gari with transparent pricing and live GPS tracking.",
  keywords: [
    'ride sharing bangladesh',
    'tripyy',
    'set your own fare',
    'dhaka to gazipur ride',
    'toyota hiace rental bangladesh',
    'toyota noah booking',
    'chander gari sajek',
    'intercity travel bangladesh',
  ],
  authors: [{ name: 'Tripyy Technologies Bangladesh Ltd.' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-brand-dark text-slate-100 font-body min-h-screen flex flex-col antialiased">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
