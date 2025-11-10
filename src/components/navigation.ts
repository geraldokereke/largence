/**
 * Smooth Routing System
 * 
 * A comprehensive routing solution for Next.js that provides:
 * - Smooth page transitions using Framer Motion
 * - Native View Transitions API support (Chrome 111+)
 * - Loading indicators during navigation
 * - Automatic route prefetching
 * - Drop-in replacements for Next.js router and Link
 * 
 * @example
 * // Using SmoothLink
 * import { SmoothLink } from '@largence/components/navigation'
 * <SmoothLink href="/dashboard">Dashboard</SmoothLink>
 * 
 * @example
 * // Using useSmoothRouter
 * import { useSmoothRouter } from '@largence/hooks/use-smooth-router'
 * const router = useSmoothRouter()
 * router.push('/dashboard')
 */

export { SmoothLink } from './smooth-link'
export { PageTransition } from './page-transition'
export { RouteLoading } from './route-loading'
