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

const clashDisplay = localFont({
  src: [
    {
      path: "../../../../packages/fonts/ClashDisplay-Extralight.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/ClashDisplay-Light.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/ClashDisplay-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/ClashDisplay-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/ClashDisplay-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../../packages/fonts/ClashDisplay-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-clash-display",
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
        className={`${generalSans.variable} ${clashDisplay.variable} ${inter.variable} ${geistMono.variable} font-sans antialiased overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
