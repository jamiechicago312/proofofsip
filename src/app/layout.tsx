import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { siteUrl } from "@/lib/site";

// Self-hosted via next/font (downloaded at build time, served from this
// origin — no runtime request to Google's own CDN, so no external-request
// or privacy concern). Fraunces is a display serif for headings/titles —
// a warm, slightly editorial voice that pairs with the coffee-toned theme
// instead of the generic system-UI look the app had before; Inter is a
// clean, highly legible sans for everything else. Both expose a CSS
// variable rather than replacing `font-family` directly, so `globals.css`
// stays the one place the type system is wired into the design tokens.
const displayFont = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display-family",
  display: "swap",
});

const sansFont = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-family",
  display: "swap",
});

const description = "A cappuccino-tasting journal for Chicago cafes.";

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: "Proof of Sip",
  description,
  openGraph: {
    title: "Proof of Sip",
    description,
    siteName: "Proof of Sip",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Proof of Sip",
    description,
  },
};

// Matches the light/dark `--color-bg` design tokens in globals.css, so
// supporting browsers (Safari, Android Chrome) tint their own UI chrome —
// the address bar, status bar — to the same theme as the page instead of
// defaulting to white.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffdf9" },
    { media: "(prefers-color-scheme: dark)", color: "#1b120c" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
