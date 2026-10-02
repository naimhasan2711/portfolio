import { useSyncExternalStore } from 'react'

/** Subscribes to a CSS media query. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}

/** True for mouse/trackpad users — hover-only effects are gated on this. */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
