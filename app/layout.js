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
  title: "مؤسسة ابو الذهب | توصيات تداول الذهب والفوركس VIP",
  description: "انضم لأكثر من 500+ متداول ناجح مع مؤسسة ابو الذهب. توصيات احترافية للذهب والفوركس بدقة عالية ونتائج موثقة. ابدأ رحلتك نحو الأرباح اليوم!",
  keywords: "توصيات ذهب, توصيات فوركس, تداول الذهب, توصيات تداول, VIP signals, مؤسسة ابو الذهب, gold trading signals, forex signals, تحليل فني, إشارات تداول",
  authors: [{ name: "مؤسسة ابو الذهب" }],
  creator: "مؤسسة ابو الذهب",
  publisher: "مؤسسة ابو الذهب",
  openGraph: {
    type: "website",
    locale: "ar_SA",
    url: "https://your-domain.com",
    siteName: "مؤسسة ابو الذهب",
    title: "مؤسسة ابو الذهب | توصيات تداول الذهب والفوركس VIP",
    description: "انضم لأكثر من 500+ متداول ناجح. توصيات احترافية للذهب والفوركس بدقة عالية ونتائج موثقة.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "مؤسسة ابو الذهب - توصيات تداول احترافية",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مؤسسة ابو الذهب | توصيات تداول الذهب والفوركس VIP",
    description: "انضم لأكثر من 500+ متداول ناجح. توصيات احترافية للذهب والفوركس بدقة عالية.",
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
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning={true}>
      <head>
        <link rel="canonical" href="https://your-domain.com" />
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