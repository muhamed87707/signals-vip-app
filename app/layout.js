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
