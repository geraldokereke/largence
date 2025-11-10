"use client"

import { useRouter as useNextRouter } from "next/navigation"
import { useCallback } from "react"

export function useSmoothRouter() {
  const router = useNextRouter()

  const smoothPush = useCallback(
    (href: string) => {
      // Use View Transitions API if available
      if ("startViewTransition" in document && typeof (document as any).startViewTransition === "function") {
        (document as any).startViewTransition(() => {
          router.push(href)
        })
      } else {
        router.push(href)
      }
    },
    [router]
  )

  const smoothReplace = useCallback(
    (href: string) => {
      if ("startViewTransition" in document && typeof (document as any).startViewTransition === "function") {
        (document as any).startViewTransition(() => {
          router.replace(href)
        })
      } else {
        router.replace(href)
      }
    },
    [router]
  )

  return {
    ...router,
    push: smoothPush,
    replace: smoothReplace,
  }
}
