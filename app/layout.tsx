import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AgeGate } from "@/components/age-gate";
import { PwaRegister } from "@/components/pwa-register";
import { APP_NAME } from "@/lib/navigation";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const headingFont = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Coaching apparence & bien-être`,
  description:
    "Faciem vous aide à révéler le meilleur de vous-même : analyse bienveillante, nutrition, skincare et suivi personnalisé.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
  icons: {
    icon: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1a1817",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <PwaRegister />
        <AgeGate />
        {children}
      </body>
    </html>
  );
}
