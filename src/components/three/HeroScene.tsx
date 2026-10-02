import { Canvas } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { getDeviceTier, sceneQuality } from '../../utils/device'
import { bindSceneInput, bindStageDrag, sceneStage } from './input'
import { SceneContents } from './SceneContents'

/**
 * The hero's WebGL canvas. Loaded lazily (see Hero.tsx) so three.js never
 * blocks the first paint of the page text.
 */
export default function HeroScene({ onReady }: { onReady?: () => void }) {
  const reduced = usePrefersReducedMotion()
  const quality = useMemo(() => sceneQuality[getDeviceTier()], [])
  const wrapper = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  useEffect(() => bindSceneInput(), [])

  // Track the stage element's box relative to the canvas.
  useEffect(() => {
    const wrap = wrapper.current
    const stage = document.getElementById('hero-stage')
    if (!wrap || !stage) return
    const measure = () => {
      const a = wrap.getBoundingClientRect()
      const b = stage.getBoundingClientRect()
      sceneStage.x = b.left - a.left
      sceneStage.y = b.top - a.top
      sceneStage.w = b.width
      sceneStage.h = b.height
      sceneStage.valid = b.width > 0 && b.height > 0
    }
    measure()
    const unbindDrag = bindStageDrag(stage)
    const ro = new ResizeObserver(measure)
    ro.observe(wrap)
    ro.observe(stage)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      unbindDrag()
      window.removeEventListener('resize', measure)
      sceneStage.valid = false
    }
  }, [])

  // Stop rendering entirely once the hero is scrolled out of view.
  useEffect(() => {
    const el = wrapper.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry?.isIntersecting ?? true), { threshold: 0 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // Reduced motion: render on demand (a still, composed frame) instead of animating.
  const frameloop = !visible ? 'never' : reduced ? 'demand' : 'always'

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={frameloop}
        dpr={quality.dpr}
        shadows={quality.shadows ? 'soft' : false}
        camera={{ position: [0, 0, 8], fov: 42, near: 0.1, far: 40 }}
        gl={{ antialias: quality.antialias, alpha: true, powerPreference: 'high-performance', stencil: false }}
        onCreated={() => onReady?.()}
        style={{ pointerEvents: 'none' }}
      >
        <SceneContents quality={quality} />
      </Canvas>
    </div>
  )
}
