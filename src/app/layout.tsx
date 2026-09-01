import type { Metadata } from 'next';
import './globals.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Ameer Muaviya Burger Point | امیر معاویہ برگر پوائنٹ - نوکھر',
  description:
    'Delicious Egg Burgers, Chicken Burgers, Shawarma, and Fast Food in Nokhar. Order online directly without account or call for fast home delivery in Nokhar.',
  keywords: [
    'Ameer Muaviya Burger Point',
    'Nokhar Burger',
    'امیر معاویہ برگر پوائنٹ',
    'نوکھر فاسٹ فوڈ',
    'Single Egg Burger',
    'Double Egg Burger',
    'Chicken Shawarma Nokhar',
  ],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  authors: [{ name: 'Ameer Muaviya Burger Point' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ur" dir="ltr" className="scroll-smooth">
      <body className="min-h-screen bg-[#090d16] text-slate-100 antialiased selection:bg-amber-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}
