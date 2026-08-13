import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'OneClick CV';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} — Professional CVs. Smarter applications.`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    'Build a professional UAE-ready CV and tailored cover letter in minutes with smart writing suggestions, ATS guidance and premium templates.',
  keywords: ['CV builder', 'resume builder UAE', 'ATS CV', 'cover letter generator', 'Dubai jobs CV', 'UAE resume'],
  openGraph: {
    title: `${APP_NAME} — Professional CVs. Smarter applications.`,
    description: 'Build a professional UAE-ready CV and tailored cover letter in minutes.',
    type: 'website',
    locale: 'en_AE',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f1b52',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
