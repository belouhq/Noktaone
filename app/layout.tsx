import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import AppProvider from "@/components/providers/AppProvider";
import ReferralTracker from "@/components/ReferralTracker";
import TestButtons from "@/components/debug/TestButtons";
import { LandscapeWarning } from "@/components/ui/LandscapeWarning";
import "@/lib/utils/console-filter";

let poppinsVariable = "";
try {
  const { Poppins } = require("next/font/google");
  const poppins = Poppins({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    variable: "--font-poppins",
    display: "swap",
    fallback: ["system-ui", "-apple-system", "BlinkMacSystemFont", "arial"],
  });
  poppinsVariable = poppins.variable;
} catch (e) {
  console.warn("Google Fonts not available, using system fonts");
}

export const metadata: Metadata = {
  title: "NOKTA ONE",
  description: "Nervous System Reset - 30 seconds to balance",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NOKTA ONE",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${poppinsVariable}`} dir="ltr" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="HandheldFriendly" content="true" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className="antialiased bg-black text-white"
        style={{ pointerEvents: "auto", position: "relative", margin: 0, padding: 0 }}
        suppressHydrationWarning
      >
        <I18nProvider>
          <AuthProvider>
            <AppProvider>
              <Suspense fallback={null}>
                <ReferralTracker />
              </Suspense>
              <TestButtons />
              <div className="app-container" style={{ pointerEvents: "auto", position: "relative" }}>
                <LandscapeWarning />
                <main className="main-content" style={{ pointerEvents: "auto", position: "relative", zIndex: 10 }}>
                  {children}
                </main>
              </div>
            </AppProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
