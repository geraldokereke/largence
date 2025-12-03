/**
 * Responsive image loader with optimization
 */
export function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // For external images, return as-is
  if (src.startsWith("http")) {
    return src;
  }

  // For local images, add width and quality parameters
  const params = new URLSearchParams();
  params.set("url", src);
  params.set("w", width.toString());
  params.set("q", (quality || 75).toString());

  return `/_next/image?${params.toString()}`;
}

/**
 * Get responsive image sizes for different breakpoints
 */
export const responsiveImageSizes = {
  mobile: "(max-width: 640px) 100vw",
  tablet: "(max-width: 1024px) 50vw",
  desktop: "33vw",
} as const;

/**
 * Standard image sizes string for Next.js Image component
 */
export const defaultImageSizes =
  "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

/**
 * Preload critical images
 */
export function preloadImage(src: string) {
  if (typeof window === "undefined") return;

  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}
