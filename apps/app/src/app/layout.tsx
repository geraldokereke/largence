import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono, Inter } from "next/font/google";
import { Providers } from "@largence/components/providers";
import "./globals.css";

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
    {
      path: "../../../../packages/fonts/polysansitalictrial-slimitalic.otf",
      weight: "300",
      style: "italic",
    },
    {
      path: "../../../../packages/fonts/polysansitalictrial-neutralitalic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../../../packages/fonts/polysansitalictrial-medianitalic.otf",
      weight: "500",
      style: "italic",
    },
    {
      path: "../../../../packages/fonts/polysansitalictrial-bulkyitalic.otf",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-poly-sans",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../../../../packages/fonts/Satoshi-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/Satoshi-Black.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Largence - Legal Intelligence made Simple",
  description:
    "Automate contract drafting, ensure regulatory compliance, and streamline governance for International teams and enterprises.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com"),
  icons: {
    icon: [
      { url: "/logo.png" },
      { url: "/logo.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  openGraph: {
    title: "Largence - Legal Intelligence for Enterprises",
    description:
      "Automate contract drafting, ensure regulatory compliance, and streamline governance for International teams and  enterprises.",
    url: "https://largence.com",
    siteName: "Largence",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Largence - Legal Intelligence Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Largence - Legal Intelligence for Enterprises",
    description:
      "Automate contract drafting, ensure regulatory compliance, and streamline governance for International teams and  enterprises.",
    images: ["/og-image.png"],
    creator: "@largence",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${generalSans.variable} ${polySans.variable} ${inter.variable} ${geistMono.variable} font-sans antialiased overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
