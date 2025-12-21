import { Inter, Cairo } from 'next/font/google';
import Script from 'next/script';
import { LanguageProvider } from './context/LanguageContext';
import FloatingChat from './components/FloatingChat';
import "./globals.css";

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
});

const cairo = Cairo({
    subsets: ['arabic'],
    variable: '--font-cairo',
    display: 'swap',
});

export const metadata = {
    metadataBase: new URL('https://signals-vip-app.vercel.app'),
    title: {
        default: "Abu Al-Dahab | Premium Gold & Forex Signals",
        template: "%s | Abu Al-Dahab"
    },
    description: "Join the elite circle of traders. High-accuracy Gold (XAUUSD) and Forex signals, professional analysis, and 24/7 VIP support. Start with Abu Al-Dahab Institution.",
    keywords: ["Gold Signals", "Forex VIP", "Trading Signals", "XAUUSD", "Abu Al-Dahab", "توصيات ذهب", "فوركس", "تداول", "Gold Trading", "Forex Signals"],
    authors: [{ name: 'Abu Al-Dahab' }],
    creator: 'Abu Al-Dahab Est.',
    manifest: '/manifest.json',
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
        ],
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
        ],
        other: [
            { rel: 'icon', url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { rel: 'icon', url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    },
    openGraph: {
        title: "Abu Al-Dahab | Premium Gold & Forex Signals",
        description: "Achieve consistent results with our VIP trading signals. High accuracy technical analysis for Gold and Forex.",
        url: 'https://signals-vip-app.vercel.app',
        siteName: 'Abu Al-Dahab Est.',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Abu Al-Dahab VIP Signals',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: "Abu Al-Dahab | Premium Signals",
        description: "Elite Gold & Forex signals for serious traders.",
        images: ['/og-image.png'],
    },
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    themeColor: '#B8860B',
    alternates: {
        canonical: '/',
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'Abu Al-Dahab',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${cairo.variable} antialiased`}>
                <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
                <LanguageProvider>
                    {children}
                    <FloatingChat />
                </LanguageProvider>
            </body>
        </html>
    );
}
