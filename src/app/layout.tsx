import type { Metadata } from 'next';
import { Outfit, Inter, JetBrains_Mono, Hind_Siliguri } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LanguageProvider } from '@/context/LanguageContext';
import { ReduxProvider } from '@/redux/provider';
import { AuthPromptManager } from '@/components/auth/AuthPromptManager';
import { LoginModal } from '@/components/auth/LoginModal';

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

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  variable: '--font-bengali',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'Trippy - Ride Sharing, Intercity Travel & Set Your Own Fare in Bangladesh',
    template: '%s | Trippy Bangladesh',
  },
  description:
    "Trippy is Bangladesh's premier ride-sharing platform where you set your own fare. Book Sedans, Toyota Noah, Hiace microbus, and Chander Gari with transparent pricing and live GPS tracking.",
  keywords: [
    'ride sharing bangladesh',
    'trippy',
    'set your own fare',
    'dhaka to gazipur ride',
    'toyota hiace rental bangladesh',
    'toyota noah booking',
    'chander gari sajek',
    'intercity travel bangladesh',
  ],
  authors: [{ name: 'Trippy Technologies Bangladesh Ltd.' }],
  icons: {
    icon: [
      { url: '/images/Icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: '/images/Icon.svg',
    apple: '/images/Icon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${jetbrainsMono.variable} ${hindSiliguri.variable}`}>
      <body className="bg-white text-slate-900 font-body min-h-screen flex flex-col antialiased">
        <LanguageProvider>
          <ReduxProvider>
            <AuthPromptManager />
            <LoginModal />
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ReduxProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
