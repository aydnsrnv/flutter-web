import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { cookies } from 'next/headers';

import { I18nProvider } from "@/lib/i18n/client";
import { getLocaleFromCookies } from "@/lib/i18n/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://jobly.az'),
  title: {
    default: 'Jobly — Vakansiyalar, iş elanları və CV',
    template: '%s | Jobly',
  },
  description: 'Vakansiyalar, iş elanları və CV-lər. İş tapmaq, iş axtarmaq və CV yaratmaq üçün Jobly.',
  keywords: [
    'vakansiya',
    'vakansiyalar',
    'iş',
    'iş elanları',
    'iş tap',
    'iş axtar',
    'CV',
    'cv yarat',
    'iş tapmaq',
    'iş axtarmaq',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Jobly',
    title: 'Jobly — Vakansiyalar, iş elanları və CV',
    description: 'Vakansiyalar, iş elanları və CV-lər. İş tapmaq, iş axtarmaq və CV yaratmaq üçün Jobly.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobly — Vakansiyalar, iş elanları və CV',
    description: 'Vakansiyalar, iş elanları və CV-lər. İş tapmaq, iş axtarmaq və CV yaratmaq üçün Jobly.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromCookies();
  const cookieStore = await cookies();
  const theme = cookieStore.get('jobly_theme')?.value;
  const htmlClassName = theme === 'dark' ? 'dark' : undefined;

  return (
    <html lang={locale} className={htmlClassName}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/remixicon@4.6.0/fonts/remixicon.css"
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider initialLocale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
