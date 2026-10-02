/**
 * Shared, mutable input state for the 3D scene.
 * Written by DOM listeners, read inside useFrame — no React re-renders.
 */
export const sceneInput = {
  /** Pointer / device tilt, normalized to -1..1 */
  x: 0,
  y: 0,
  /** Scroll progress through the hero, 0..1 */
  scroll: 0,
  /** Turntable angle (radians) set by dragging the stage; unbounded, so it can spin 360°. */
  spin: 0,
  /** Angular velocity after a drag is released (radians per frame at 60 fps). */
  spinVelocity: 0,
  dragging: false,
  /** Zoom factor requested by the user (pinch, Ctrl/⌘ + wheel, or the +/− buttons). */
  zoom: 1,
}

export const ZOOM_MIN = 0.65
export const ZOOM_MAX = 1.8

const clampZoom = (z: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))

/** Zoom in/out by a factor (used by the on-screen buttons). */
export function zoomBy(factor: number) {
  sceneInput.zoom = clampZoom(sceneInput.zoom * factor)
}

/** Back to the default angle and size. */
export function resetView() {
  sceneInput.zoom = 1
  sceneInput.spin = Math.round(sceneInput.spin / (Math.PI * 2)) * Math.PI * 2
  sceneInput.spinVelocity = 0
}

/**
 * Stage gestures:
 *  • drag / swipe sideways → spin around the vertical axis (360°)
 *  • two-finger pinch (touch) or Ctrl/⌘ + wheel / trackpad pinch → zoom
 *  • ← / → rotate and + / − zoom when the stage has keyboard focus
 * A plain mouse wheel keeps scrolling the page.
 */
export function bindStageDrag(el: HTMLElement): () => void {
  const RAD_PER_PX = (Math.PI * 2) / 700 // ~700px of drag = one full turn
  const pointers = new Map<number, { x: number; y: number }>()
  let lastX = 0
  let pinchStart = 0
  let zoomStart = 1

  const distance = () => {
    const [a, b] = [...pointers.values()]
    return a && b ? Math.hypot(a.x - b.x, a.y - b.y) : 0
  }

  const down = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    el.setPointerCapture(e.pointerId)
    if (pointers.size === 1) {
      lastX = e.clientX
      sceneInput.dragging = true
      sceneInput.spinVelocity = 0
    } else if (pointers.size === 2) {
      sceneInput.dragging = false
      pinchStart = distance()
      zoomStart = sceneInput.zoom
    }
  }
  const move = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.size >= 2) {
      if (pinchStart > 0) sceneInput.zoom = clampZoom(zoomStart * (distance() / pinchStart))
      return
    }
    if (!sceneInput.dragging) return
    const dx = e.clientX - lastX
    lastX = e.clientX
    sceneInput.spin += dx * RAD_PER_PX
    sceneInput.spinVelocity = dx * RAD_PER_PX
  }
  const up = (e: PointerEvent) => {
    pointers.delete(e.pointerId)
    if (pointers.size === 0) sceneInput.dragging = false
    if (pointers.size < 2) pinchStart = 0
    if (pointers.size === 1) {
      const [p] = [...pointers.values()]
      if (p) lastX = p.x
      sceneInput.dragging = true
    }
  }
  const wheel = (e: WheelEvent) => {
    // Only zoom on pinch-to-zoom trackpads / Ctrl+wheel — a normal wheel scrolls the page.
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    sceneInput.zoom = clampZoom(sceneInput.zoom * Math.exp(-e.deltaY * 0.004))
  }
  const key = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') sceneInput.spin -= 0.25
    else if (e.key === 'ArrowRight') sceneInput.spin += 0.25
    else if (e.key === '+' || e.key === '=') zoomBy(1.15)
    else if (e.key === '-' || e.key === '_') zoomBy(1 / 1.15)
    else if (e.key === '0') resetView()
    else return
    e.preventDefault()
  }

  el.addEventListener('pointerdown', down)
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
  el.addEventListener('wheel', wheel, { passive: false })
  el.addEventListener('keydown', key)
  return () => {
    el.removeEventListener('pointerdown', down)
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
    el.removeEventListener('wheel', wheel)
    el.removeEventListener('keydown', key)
  }
}

/**
 * Where the 3D object should sit, in canvas pixels. Measured from the
 * #hero-stage element (right half on desktop, a block under the text on
 * phones/tablets) so the scene always fits its space.
 */
export const sceneStage = { x: 0, y: 0, w: 0, h: 0, valid: false }

/** Attaches pointer, scroll and device-orientation listeners. Returns cleanup. */
export function bindSceneInput(): () => void {
  const onPointer = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    sceneInput.x = (e.clientX / window.innerWidth) * 2 - 1
    sceneInput.y = -((e.clientY / window.innerHeight) * 2 - 1)
  }
  const onScroll = () => {
    sceneInput.scroll = Math.min(1, Math.max(0, window.scrollY / window.innerHeight))
  }
  // Tilt on phones/tablets. iOS requires a permission prompt for this event,
  // which we intentionally don't show — those devices simply don't tilt.
  const onOrientation = (e: DeviceOrientationEvent) => {
    if (e.gamma === null || e.beta === null) return
    sceneInput.x = Math.max(-1, Math.min(1, e.gamma / 35))
    sceneInput.y = Math.max(-1, Math.min(1, (45 - e.beta) / 35))
  }

  onScroll()
  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  const coarse = window.matchMedia('(pointer: coarse)').matches
  if (coarse) window.addEventListener('deviceorientation', onOrientation, { passive: true })

  return () => {
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('deviceorientation', onOrientation)
  }
}
