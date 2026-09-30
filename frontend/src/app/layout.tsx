import type { Metadata, Viewport } from "next";
import { Outfit, Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#09090b",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "Community — Closed Social Network",
    template: "%s | Community",
  },
  description:
    "A private, invite-only community platform for creators, students, and engineers. Connect, discuss, and build together.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Community",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  keywords: ["community", "social", "network", "discussions", "creators"],
  openGraph: {
    type: "website",
    title: "Community",
    description:
      "A private, invite-only community platform for creators, students, and engineers.",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512 }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(outfit.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[60] rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-[var(--color-accent-foreground)] focus:not-sr-only"
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
