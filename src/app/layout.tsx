import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/toaster";

export const metadata: Metadata = {
  title: "Aurora — Agenda moderne",
  description:
    "Un agenda moderne, élégant et fluide, inspiré de Google Agenda avec une touche premium.",
  authors: [{ name: "LEGAGNEUR DÉVELOPPEMENT" }],
  keywords: ["agenda", "calendrier", "Aurora", "Next.js", "TypeScript"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "Aurora — Agenda moderne",
    description: "Un agenda moderne, élégant et fluide.",
    type: "website",
    locale: "fr_FR",
    siteName: "Aurora",
  },
  twitter: {
    card: "summary",
    title: "Aurora — Agenda moderne",
    description: "Un agenda moderne, élégant et fluide.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen aurora-bg">
        <ThemeProvider>{children}</ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
