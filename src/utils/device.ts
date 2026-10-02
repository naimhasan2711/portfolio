/**
 * Device capability helpers used to scale the 3D scene to the hardware.
 */

export type DeviceTier = 'low' | 'mid' | 'high'

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number
}

let webglSupport: boolean | null = null

/** True if the browser can create a WebGL context. Cached after first call. */
export function hasWebGL(): boolean {
  if (webglSupport !== null) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    webglSupport = gl !== null
    // Release the probe context right away.
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglSupport = false
  }
  return webglSupport
}

/** Rough device tier from cores, memory, screen size and pointer type. */
export function getDeviceTier(): DeviceTier {
  const nav = navigator as NavigatorWithMemory
  const cores = nav.hardwareConcurrency ?? 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const small = window.innerWidth < 768

  if (cores <= 4 || memory <= 2) return 'low'
  if (coarse || small) return 'mid'
  return 'high'
}

export interface SceneQuality {
  particles: number
  nodes: number
  dpr: [number, number]
  antialias: boolean
  /** Real-time soft shadows (desktop-class GPUs only). */
  shadows: boolean
}

export const sceneQuality: Record<DeviceTier, SceneQuality> = {
  low: { particles: 350, nodes: 14, dpr: [1, 1], antialias: false, shadows: false },
  mid: { particles: 700, nodes: 20, dpr: [1, 1.5], antialias: false, shadows: false },
  high: { particles: 1400, nodes: 28, dpr: [1, 2], antialias: true, shadows: true },
}
