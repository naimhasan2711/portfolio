import { useEffect, useMemo } from 'react'
import { useTheme } from '../../hooks/useTheme'

/** Scene colours for each site theme (kept in step with src/styles/index.css). */
const palettes = {
  dark: {
    accent: '#c47a55', accent2: '#d99a78', steel: '#9da6ad',
    body: '#17212b', screen: '#0b1117', notch: '#29333c', block: '#f3efe6',
    particles: '#ead7c7', particleOpacity: 0.55, additive: true,
    fog: '#0b1117', key: '#f3efe6', networkOpacity: 0.14, edgeOpacity: 0.32,
    desk: '#222c36', deskEdge: '#c47a55', chair: '#1a232c', skin: '#c4927a', hair: '#1b2027',
    shirt: '#5f7891', pants: '#2a343e', code: '#9da6ad', shadow: '#000000', shadowOpacity: 0.55,
    wood: '#5b3b27', woodGrain: '#3f2717', brass: '#c9a26b', leather: '#7d4a2f', chrome: '#c9ced3', keys: '#ece7de', steam: '#f3efe6', envIntensity: 0.45, castShadowOpacity: 0.45,
    rug: '#3a3f45', rugBand: '#23272c', wall: '#3a4047', wallSide: '#343a41', floor: '#262b31', cabinet: '#2b3238', led: '#f6efe2', ledGlow: 0.55, mat: '#111417',
  },
  light: {
    accent: '#9c5737', accent2: '#b8693f', steel: '#5d6b75',
    body: '#1c2731', screen: '#0b1117', notch: '#29333c', block: '#f3efe6',
    particles: '#7a5a46', particleOpacity: 0.45, additive: false,
    fog: '#f3efe6', key: '#ffffff', networkOpacity: 0.22, edgeOpacity: 0.5,
    desk: '#2a3540', deskEdge: '#9c5737', chair: '#222d38', skin: '#bd8c73', hair: '#1b2027',
    shirt: '#556d86', pants: '#2a343e', code: '#9da6ad', shadow: '#3a2a20', shadowOpacity: 0.28,
    wood: '#5b3b27', woodGrain: '#3f2717', brass: '#b8925c', leather: '#7d4a2f', chrome: '#b9bfc5', keys: '#f4f0e8', steam: '#8e9ba5', envIntensity: 0.6, castShadowOpacity: 0.22,
    rug: '#e3dccf', rugBand: '#cfc5b5', wall: '#e6e1d8', wallSide: '#ddd7cc', floor: '#cbc3b6', cabinet: '#48515a', led: '#fff6e8', ledGlow: 0.35, mat: '#16191c',
  },
} as const

export function usePalette() {
  return palettes[useTheme()]
}

/** Disposes three.js resources created outside of JSX when the component unmounts. */
export function useDisposable<T extends { dispose: () => void }>(factory: () => T, deps: unknown[]): T {
  const value = useMemo(factory, deps)
  useEffect(() => () => value.dispose(), [value])
  return value
}
