import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Max tilt in degrees. */
  max?: number
}

/**
 * A card that tilts in 3D toward the cursor and shows a soft spotlight.
 * Touch devices and reduced-motion users get a static card.
 */
export function TiltCard({ children, className = '', max = 6 }: TiltCardProps) {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced

  const rx = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 })
  const ry = useSpring(useMotionValue(0), { stiffness: 180, damping: 20 })
  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgb(196 122 85 / 0.10), transparent 60%)`

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    ry.set((px - 0.5) * max * 2)
    rx.set(-(py - 0.5) * max * 2)
    mx.set(px * 100)
    my.set(py * 100)
  }
  const reset = () => {
    rx.set(0)
    ry.set(0)
  }

  return (
    <div className="h-full [perspective:1200px]" onPointerMove={onMove} onPointerLeave={reset}>
      <motion.div
        style={enabled ? { rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' } : undefined}
        className={`group relative h-full ${className}`}
      >
        {enabled && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: spotlight }}
          />
        )}
        {children}
      </motion.div>
    </div>
  )
}
