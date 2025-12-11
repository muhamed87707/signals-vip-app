import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata = {
    title: "Abu Al-Dahab | مؤسسة ابو الذهب - Premium Trading Signals",
    description: "Premium gold and forex trading signals with high accuracy. Join our VIP community for professional signals. | توصيات احترافية لتداول الذهب والفوركس بدقة عالية. انضم لمجتمع VIP للتوصيات الاحترافية.",
    keywords: "trading signals, gold signals, forex signals, VIP signals, توصيات تداول, توصيات ذهب, توصيات فوركس, مؤسسة ابو الذهب, Abu Al-Dahab, XAUUSD signals",
    authors: [{ name: "Abu Al-Dahab" }],
    creator: "Abu Al-Dahab",
    publisher: "Abu Al-Dahab",
    openGraph: {
        type: "website",
        locale: "ar_SA",
        alternateLocale: "en_US",
        url: "https://your-domain.com",
        siteName: "Abu Al-Dahab | مؤسسة ابو الذهب",
        title: "Abu Al-Dahab | Premium Trading Signals | توصيات VIP",
        description: "Premium gold and forex trading signals. Join our VIP community. | توصيات احترافية للذهب والفوركس. انضم لمجتمعنا VIP.",
        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Abu Al-Dahab - Premium Trading Signals",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Abu Al-Dahab | Premium Trading Signals",
        description: "Premium gold and forex trading signals with high accuracy.",
        images: ["/og-image.png"],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({ children }) {
    return (
        <html suppressHydrationWarning={true}>
            <head>
                <meta name="theme-color" content="#D4AF37" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
