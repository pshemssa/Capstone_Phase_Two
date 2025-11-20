import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Lumen Yard - Stories That Linger",
    template: "%s | Lumen Yard",
  },
  description: "A publishing platform for sharing your stories with the world. Read, write, and discover engaging content from talented writers.",
  keywords: ["blog", "publishing", "stories", "writing", "content", "articles"],
  authors: [{ name: "Lumen Yard" }],
  creator: "Lumen Yard",
  publisher: "Lumen Yard",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "Lumen Yard",
    title: "Lumen Yard - Stories That Linger",
    description: "A publishing platform for sharing your stories with the world",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lumen Yard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumen Yard - Stories That Linger",
    description: "A publishing platform for sharing your stories with the world",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}