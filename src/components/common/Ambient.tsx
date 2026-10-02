import { motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useRef } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

/** Thin accent bar at the top of the page showing reading progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-gradient-to-r from-accent via-accent-soft to-cool"
    />
  )
}

/** Soft glow that follows the mouse. Disabled for touch and reduced motion. */
export function CursorGlow() {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!fine || reduced) return
    let frame = 0
    let x = -1000
    let y = -1000
    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0
          ref.current?.style.setProperty('transform', `translate3d(${x - 300}px, ${y - 300}px, 0)`)
        })
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [fine, reduced])

  if (!fine || reduced) return null
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-0 h-[600px] w-[600px] rounded-full opacity-60 will-change-transform"
      style={{
        background: 'radial-gradient(circle, rgb(196 122 85 / 0.07) 0%, rgb(217 154 120 / 0.03) 35%, transparent 65%)',
        transform: 'translate3d(-1000px,-1000px,0)',
      }}
    />
  )
}
