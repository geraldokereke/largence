import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ["@largence/ui"],

  // Enable standalone output for Docker
  output: "standalone",

  // Optimize for smooth page transitions
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@largence/ui",
    ],
    scrollRestoration: true,
    // Enable faster navigation with staleTimes
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
  },

  // Enable faster navigation
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
