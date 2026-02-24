import AppInitializer from "@/components/AppInitializer";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "It's Bathtime!",
  description: "Comic book style PWA for tracking kids' bath order.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2a62a6",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#2a62a6" />
      </head>
      <body>
        <AppInitializer />
        <div className="app-container">
          <header className="header">
            <Logo />
            <Navigation />
          </header>
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
