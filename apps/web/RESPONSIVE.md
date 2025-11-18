# Largence - Responsive Web Application

## Overview
Enterprise-grade responsive Next.js application optimized for mobile, tablet, and desktop experiences across all devices.

## Responsive Features Implemented

### 1. Comprehensive Metadata & SEO
- **Viewport Configuration**: Proper viewport settings with device-width and zoom controls
- **Theme Colors**: Dynamic theme colors for light/dark modes
- **Open Graph**: Complete OG tags for social media sharing
- **Twitter Cards**: Optimized Twitter card metadata
- **Robots & Sitemap**: SEO-friendly robots.txt and dynamic sitemap
- **Icons**: Full icon suite (favicon, SVG, PWA icons, Apple touch icons)

### 2. Progressive Web App (PWA) Support
- **manifest.json**: Full PWA manifest with icons, theme colors, and display modes
- **App Capabilities**: Standalone app mode with proper orientation support
- **Screenshots**: Mobile and desktop screenshots for app stores
- **Categories**: Business, productivity, and legal categorization

### 3. Performance Optimizations
- **Image Optimization**: AVIF/WebP formats with responsive device sizes
- **Font Display**: Swap strategy for all custom fonts (GeneralSans, PolySans, Satoshi)
- **Compression**: Gzip/Brotli compression enabled
- **Caching**: Immutable caching for static assets (fonts, images)
- **Headers**: Security headers (HSTS, CSP, X-Frame-Options, etc.)

### 4. Mobile-First Design
- **Touch Optimization**: `touch-manipulation` CSS on all interactive elements
- **Tap Targets**: Minimum 44px tap targets on mobile (36px on desktop)
- **Safe Areas**: Support for notched devices with safe-area-inset
- **Font Sizing**: 16px minimum to prevent iOS zoom on inputs
- **Typography**: Responsive text scaling from mobile to desktop

### 5. Accessibility & UX
- **Reduced Motion**: Respects `prefers-reduced-motion` preference
- **Focus States**: Enhanced focus indicators for keyboard navigation
- **ARIA Labels**: Proper semantic HTML and ARIA attributes
- **Loading States**: Smooth loading indicators
- **Error Boundaries**: Comprehensive error handling with recovery options

### 6. CSS Optimizations
- **Font Rendering**: Antialiasing and kerning for better text display
- **Smooth Scrolling**: Native smooth scroll with hardware acceleration
- **Overflow Prevention**: Horizontal scroll prevention
- **Responsive Images**: All images responsive by default (max-w-full)

## File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout with metadata
│   │   ├── loading.tsx         # Loading UI
│   │   ├── error.tsx           # Error boundary
│   │   ├── not-found.tsx       # 404 page
│   │   ├── globals.css         # Global styles
│   │   ├── sitemap.ts          # Dynamic sitemap
│   │   ├── opengraph-image.tsx # OG image generator
│   │   └── twitter-image.tsx   # Twitter card image
│   ├── components/
│   │   ├── Navbar.tsx          # Responsive navigation
│   │   ├── Hero.tsx            # Hero section
│   │   └── landing/            # Landing page sections
│   └── lib/
│       ├── image-utils.ts      # Image optimization utilities
│       └── responsive-utils.ts # Responsive helper functions
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── robots.txt              # SEO robots file
│   └── icon.svg                # App icon
├── next.config.ts              # Next.js configuration
└── package.json                # Scripts and dependencies
```

## Responsive Breakpoints

```typescript
{
  sm: '640px',   // Small devices (phones)
  md: '768px',   // Medium devices (tablets)
  lg: '1024px',  // Large devices (desktops)
  xl: '1280px',  // Extra large devices
  '2xl': '1536px' // Ultra-wide displays
}
```

## Typography Scale

### Headings (Mobile → Desktop)
- H1: `text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl`
- H2: `text-xl sm:text-2xl md:text-3xl lg:text-4xl`
- H3: `text-lg sm:text-xl md:text-2xl lg:text-3xl`

### Body Text
- Large: `text-sm sm:text-base md:text-lg lg:text-xl`
- Regular: `text-xs sm:text-sm md:text-base lg:text-lg`
- Small: `text-xs sm:text-sm`

## Performance Features

### Image Optimization
- Automatic format selection (AVIF → WebP → JPEG/PNG)
- Responsive srcset generation
- Lazy loading by default
- Blur-up placeholders

### Font Loading
- Preconnect to font sources
- Font display swap
- Subsetting for reduced size
- Local fonts with proper fallbacks

### Caching Strategy
- Fonts: 1 year immutable cache
- Images: 1 year immutable cache
- Pages: Revalidate on demand
- API: No caching by default

## Security Headers

- **HSTS**: Strict Transport Security with preload
- **CSP**: Content Security Policy for XSS prevention
- **X-Frame-Options**: Clickjacking protection
- **X-Content-Type-Options**: MIME sniffing prevention
- **Referrer-Policy**: Privacy-focused referrer handling
- **Permissions-Policy**: Feature access restrictions

## Testing & Monitoring

### Scripts Available
```bash
pnpm dev        # Development server
pnpm build      # Production build
pnpm start      # Production server
pnpm lint       # ESLint checking
pnpm analyze    # Bundle size analysis
pnpm lighthouse # Lighthouse audit
```

### Recommended Tools
- Lighthouse: Performance, accessibility, SEO audits
- WebPageTest: Real-world performance testing
- Chrome DevTools: Mobile device emulation
- BrowserStack: Cross-browser testing

## Best Practices Implemented

1. ✅ Mobile-first responsive design
2. ✅ Progressive enhancement
3. ✅ Semantic HTML5
4. ✅ ARIA accessibility
5. ✅ SEO optimization
6. ✅ Performance budgets
7. ✅ Security headers
8. ✅ PWA capabilities
9. ✅ Error boundaries
10. ✅ Loading states

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- iOS Safari: 13+
- Android Chrome: Last 2 versions

## Next Steps

1. **Add Real Icons**: Replace placeholder icons with actual Largence branding
2. **Add Screenshots**: Create actual mobile/desktop screenshots for PWA
3. **Analytics**: Implement performance monitoring (e.g., Vercel Analytics)
4. **Testing**: Run Lighthouse audits and optimize further
5. **Content**: Add real content and imagery
6. **A11y Testing**: Comprehensive accessibility audit

## Utility Functions

### Responsive Utilities (`responsive-utils.ts`)
- `isMobileDevice()`: Detect mobile devices
- `isTouchDevice()`: Detect touch capability
- `getViewportDimensions()`: Get current viewport size
- `prefersReducedMotion()`: Check motion preferences
- `getSafeAreaInsets()`: Get notch/safe area values
- `getCurrentBreakpoint()`: Get active breakpoint

### Image Utilities (`image-utils.ts`)
- `imageLoader()`: Optimize image loading
- `preloadImage()`: Preload critical images
- `responsiveImageSizes`: Predefined size strings

## Performance Targets

- **Lighthouse Score**: 90+ for all metrics
- **First Contentful Paint**: < 1.8s
- **Largest Contentful Paint**: < 2.5s
- **Total Blocking Time**: < 200ms
- **Cumulative Layout Shift**: < 0.1
- **Speed Index**: < 3.4s

---

Built with ❤️ using Next.js 16, React 19, and Tailwind CSS 4
