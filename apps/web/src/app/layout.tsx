import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Inter, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "../components/theme-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const generalSans = localFont({
  src: [
    {
      path: "../../../../packages/fonts/GeneralSans-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/GeneralSans-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/GeneralSans-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/GeneralSans-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/GeneralSans-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

const polySans = localFont({
  src: [
    {
      path: "../../../../packages/fonts/polysanstrial-slim.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/polysanstrial-neutral.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/polysanstrial-median.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/polysanstrial-bulky.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poly-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#252525" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://largence.com"),
  title: {
    default: "Largence - Legal Intelligence for Enterprises",
    template: "%s | Largence",
  },
  description:
    "Streamline drafting workflows and strengthen compliance oversight with AI-enabled legal support solutions..",
  keywords: [
    "legal tech",
    "contract management",
    "compliance automation",
    "legal AI",
    "legal software",
    "contract drafting",
    "regulatory compliance",
    "enterprise legal",
    "legal intelligence",
    "governance automation",
  ],
  authors: [{ name: "Largence" }],
  creator: "Largence",
  publisher: "Largence",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://largence.com",
    siteName: "Largence",
    title: "Largence - Legal Intelligence for Enterprises",
    description:
      "Automate contract drafting, ensure regulatory compliance, and streamline governance for African enterprises with AI-powered legal intelligence.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Largence - Enterprise Legal Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Largence - Legal Intelligence for Enterprises",
    description:
      "Automate contract drafting, ensure regulatory compliance, and streamline governance for African enterprises.",
    images: ["/og-image.png"],
    creator: "@largence",
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
  icons: {
    icon: [
      { url: "/icon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Largence",
  },
  alternates: {
    canonical: "https://largence.com",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <meta name="format-detection" content="telephone=no" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        </head>
        <body
          className={`${inter.variable} ${generalSans.variable} ${polySans.variable} ${geistMono.variable} font-sans antialiased`}
        >
            {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
