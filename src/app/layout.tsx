import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { cookies } from "next/headers";

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
  metadataBase: new URL("https://jobly.az"),
  applicationName: "Jobly",
  title: {
    default: "Vakansiyalar, CVlər",
    template: "%s | Vakansiyalar, CVlər",
  },
  description:
    "Vakansiyalar, iş elanları və CV-lər. İş tapmaq, iş axtarmaq və CV yaratmaq üçün Jobly.",
  keywords: [
    "jobly",
    "jobly.az",
    "vakansiya",
    "vakansiyalar",
    "iş",
    "iş elanları",
    "iş tap",
    "iş axtar",
    "CV",
    "CVlər",
    "cv yarat",
    "iş tapmaq",
    "iş axtarmaq",
    "azerbaycan vakansiya",
    "azerbaycan iş elanları",
    "azerbaycan cv",
  ],
  icons: {
    icon: "/jobly_icon.jpg",
    apple: "/jobly_icon.jpg",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/jobly_icon.jpg",
    shortcut: "/jobly_icon.jpg",
    apple: "/jobly_icon.jpg",
  },
  openGraph: {
    type: "website",
    siteName: "Jobly",
    url: "https://jobly.az",
    title: "Vakansiyalar, CVlər",
    description:
      "Vakansiyalar, iş elanları və CV-lər. İş tapmaq, iş axtarmaq və CV yaratmaq üçün Jobly.",
    images: [
      {
        url: "/jobly_icon.jpg",
        width: 1200,
        height: 630,
        alt: "Jobly",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vakansiyalar, CVlər",
    description:
      "Vakansiyalar, iş elanları və CV-lər. İş tapmaq, iş axtarmaq və CV yaratmaq üçün Jobly.",
    images: ["/jobly_icon.jpg"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocaleFromCookies();
  const cookieStore = await cookies();
  const theme = cookieStore.get("jobly_theme")?.value;
  const htmlClassName = theme === "dark" ? "dark" : undefined;

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
