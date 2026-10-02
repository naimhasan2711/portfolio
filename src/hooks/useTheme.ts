import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'theme'
const listeners = new Set<() => void>()

function read(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
}

/** Applies a theme to <html>, remembers it, and notifies subscribers. */
export function setTheme(theme: Theme) {
  const root = document.documentElement
  // Briefly enable colour transitions so the switch feels smooth, not abrupt.
  root.classList.add('theme-transition')
  root.dataset.theme = theme
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f3efe6' : '#0b1117')
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* storage unavailable (private mode) — theme still applies for this visit */
  }
  window.setTimeout(() => root.classList.remove('theme-transition'), 450)
  listeners.forEach((l) => l())
}

/** Current theme, re-rendering when it changes. Initial value is set by the script in index.html. */
export function useTheme(): Theme {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    read,
    () => 'dark',
  )
}
