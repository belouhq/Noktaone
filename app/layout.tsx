import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import ReferralTracker from "@/components/ReferralTracker";

const inter = Inter({ subsets: ["latin"] });

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
    <html lang="fr" className="dark" dir="ltr" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="HandheldFriendly" content="true" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} antialiased bg-black text-white`} style={{ pointerEvents: 'auto', position: 'relative', margin: 0, padding: 0 }}>
        <I18nProvider>
          <AuthProvider>
            <ReferralTracker />
            <div className="app-container" style={{ pointerEvents: 'auto', position: 'relative' }}>
              <div className="landscape-warning fixed inset-0 bg-black z-[100] hidden items-center justify-center p-8 text-center pointer-events-none">
                <div>
                  <p className="text-4xl mb-4">📱</p>
                  <p className="text-white text-lg">
                    Veuillez tourner votre téléphone en mode portrait
                  </p>
                </div>
              </div>
              <main className="main-content" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                {children}
              </main>
            </div>
          </AuthProvider>
        </I18nProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function attachNavListeners() {
                  const navButtons = document.querySelectorAll('[data-nav-button]');
                  navButtons.forEach(btn => {
                    const path = btn.getAttribute('data-nav-path');
                    if (path) {
                      btn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = path;
                      });
                    }
                  });
                }
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', attachNavListeners);
                } else {
                  attachNavListeners();
                }
                setTimeout(attachNavListeners, 100);
                setTimeout(attachNavListeners, 500);
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
