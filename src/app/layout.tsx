import type { Metadata, Viewport } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/site";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
