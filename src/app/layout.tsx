import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/contexts/auth-context";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tyles - AI-Powered Financial Companion",
  description: "AI-powered financial companion for gig workers. Track earnings, manage expenses, optimize taxes, and predict income.",
  keywords: ["gig worker", "finance", "taxes", "earnings", "expenses", "AI", "financial planning"],
  authors: [{ name: "Tyles Team" }],
  creator: "Tyles",
  publisher: "Tyles",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tyles",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://tyles.app",
    title: "Tyles - AI-Powered Financial Companion",
    description: "AI-powered financial companion for gig workers. Track earnings, manage expenses, optimize taxes, and predict income.",
    siteName: "Tyles",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tyles - AI-Powered Financial Companion",
    description: "AI-powered financial companion for gig workers. Track earnings, manage expenses, optimize taxes, and predict income.",
    creator: "@tyles",
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

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-192x192.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Tyles" />
        <meta name="msapplication-TileColor" content="#6366f1" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="theme-color" content="#6366f1" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
