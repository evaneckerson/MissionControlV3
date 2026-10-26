import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/newsreader/opsz.css";
import "@fontsource-variable/newsreader/opsz-italic.css";
import "./globals.css";
import TopBar from "@/components/TopBar";

export const metadata: Metadata = {
  title: { default: "Mission Control", template: "%s · Mission Control" },
  description: "What needs Evan, what Claude did, what is coming.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Mission Control", statusBarStyle: "default" },
  icons: { icon: "/icon-192.png", apple: "/icon-192.png" },
};
export const viewport: Viewport = {
  themeColor: [{ media: "(prefers-color-scheme: light)", color: "#f7f7f4" }, { media: "(prefers-color-scheme: dark)", color: "#0f1114" }],
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <TopBar />
        <main className="mx-auto max-w-[1120px] pb-16 pt-6 sm:pt-8">{children}</main>
      </body>
    </html>
  );
}
