import type { Metadata } from "next";
import localFont from "next/font/local";
import { Karla } from "next/font/google";
import { Providers } from "@largence/components/providers";
import "./globals.css";

const karla = Karla({
  subsets: ["latin"],
  variable: "--font-karla",
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

export const metadata: Metadata = {
  title: "Largence - Legal Intelligence made Simple",
  description:
    "Automate contract drafting, ensure regulatory compliance, and streamline governance for International teams and enterprises.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://app.largence.com",
  ),
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
        className={`${karla.variable} ${clashDisplay.variable} font-sans antialiased overflow-hidden`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
