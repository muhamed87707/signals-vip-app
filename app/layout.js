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
  title: "توصيات القناص VIP",
  description: "منصة التوصيات الخاصة",
};

export default function RootLayout({ children }) {
  return (
    // هنا تم التعديل لإصلاح الخطأ وضبط اللغة
    <html lang="ar" dir="rtl" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}
      >
        {children}
      </body>
    </html>
  );
}