import { Outfit, Cairo } from 'next/font/google';
import "./globals.css";
import { LanguageProvider } from './context/LanguageContext';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
    display: 'swap',
});

const cairo = Cairo({
    subsets: ['arabic'],
    variable: '--font-cairo',
    display: 'swap',
});

export const metadata = {
    title: "Abou Al-Dahab | Premium Trading Signals",
    description: "Elite Gold & Forex signals for serious traders. Join the VIP circle.",
    viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({ children }) {
    return (
        <html suppressHydrationWarning>
            <body className={`${outfit.variable} ${cairo.variable} antialiased`}>
                <LanguageProvider>
                    {children}
                </LanguageProvider>
            </body>
        </html>
    );
}
