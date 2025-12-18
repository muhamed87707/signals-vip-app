import { Inter, Cairo } from 'next/font/google';
import Script from 'next/script';
import { LanguageProvider } from './context/LanguageContext';
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
    title: "Abu Al-Dahab | Premium Trading Signals",
    description: "Elite Gold & Forex signals for serious traders. Join the VIP circle.",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    openGraph: {
        title: 'Abu Al-Dahab VIP Signals',
        description: 'Join the elite circle of Gold & Forex traders. High accuracy signals daily.',
        url: 'https://signals-vip-app.vercel.app',
        siteName: 'Abu Al-Dahab',
        images: [
            {
                url: '/og-image.png',
                width: 1200,
                height: 630,
                alt: 'Abu Al-Dahab VIP Signals Preview',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Abu Al-Dahab VIP Signals',
        description: 'Join the elite circle of Gold & Forex traders. High accuracy signals daily.',
        images: ['/og-image.png'],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${cairo.variable} antialiased`}>
                <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </body>
        </html>
    );
}
