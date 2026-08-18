import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { InstallPwaBanner } from "@/components/ui/InstallPwaBanner";

import { SmartPageLoader } from "@/components/layout/SmartPageLoader";

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "VELOCE | Luxury & Performance Footwear",
  description:
    "Discover handcrafted carbon-plated road racers, iconic street sneakers, and luxury Tuscan leather footwear. Engineered for distinction.",
  keywords: ["shoes", "sneakers", "running shoes", "luxury footwear", "veloce", "leather boots"],
  manifest: "/manifest.json",
  icons: {
    icon: "/images/veloce-logo-icon.svg",
    shortcut: "/images/veloce-logo-icon.svg",
    apple: "/icons/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VELOCE",
  },
  openGraph: {
    title: "VELOCE | Luxury & Performance Footwear",
    description: "Engineered for distinction. Discover the world's most advanced footwear.",
    type: "website",
    siteName: "VELOCE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('veloce_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 min-h-screen selection:bg-brand-500 selection:text-white transition-colors duration-200 overflow-x-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        <ThemeProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <SmartPageLoader />
            </Suspense>
            {children}
            <CartDrawer />
            <MobileBottomNav />
            <InstallPwaBanner />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

