import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { AgeGate } from "@/components/age-gate";
import { GrainOverlay } from "@/components/grain-overlay";
import { PwaRegister } from "@/components/pwa-register";
import { APP_NAME } from "@/lib/navigation";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const headingFont = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${APP_NAME} — Coaching apparence & bien-être`,
  description:
    "Faciem vous aide à révéler le meilleur de vous-même : analyse bienveillante, nutrition, skincare et suivi personnalisé.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
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
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      localization={frFR}
      appearance={{
        variables: {
          colorPrimary: "#8b5cf6",
          colorBackground: "#141319",
          colorForeground: "#f4f3f8",
          colorMutedForeground: "#a1a0ab",
          colorInput: "#1b1a22",
          colorInputForeground: "#f4f3f8",
          colorBorder: "#26242e",
          borderRadius: "1rem",
        },
      }}
    >
      <html lang="fr" className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased dark`}>
        <body className="min-h-full flex flex-col bg-background text-foreground">
          <PwaRegister />
          <GrainOverlay />
          <AgeGate />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
