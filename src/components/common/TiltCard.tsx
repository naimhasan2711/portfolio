import { motion, useMotionTemplate, useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

interface TiltCardProps {
  children: ReactNode
  className?: string
  /** Max tilt in degrees. */
  max?: number
  /** Show a glossy glare that follows the cursor (like light on glass). */
  glare?: boolean
  /** Lift the card toward the viewer on hover (px of Z translation). */
  lift?: number
}

/**
 * A card that tilts in 3D toward the cursor with a copper spotlight, an
 * optional glossy glare, and a soft lift toward the viewer. Children can add
 * the class `tilt-pop` to float above the card surface for a parallax feel.
 * Touch devices and reduced-motion users get a static card.
 */
export function TiltCard({ children, className = '', max = 6, glare = true, lift = 14 }: TiltCardProps) {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const enabled = fine && !reduced

  const spring = { stiffness: 180, damping: 20 }
  const rx = useSpring(useMotionValue(0), spring)
  const ry = useSpring(useMotionValue(0), spring)
  const z = useSpring(useMotionValue(0), { stiffness: 220, damping: 24 })
  const mx = useMotionValue(50)
  const my = useMotionValue(50)
  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgb(196 122 85 / 0.10), transparent 60%)`
  const sheen = useMotionTemplate`radial-gradient(260px circle at ${mx}% ${my}%, rgb(255 255 255 / 0.10), transparent 55%), linear-gradient(${mx}deg, transparent 35%, rgb(255 255 255 / 0.05) 50%, transparent 65%)`

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
  const enter = () => enabled && z.set(lift)
  const reset = () => {
    rx.set(0)
    ry.set(0)
    z.set(0)
  }

  return (
    <div className="h-full [perspective:1200px]" onPointerMove={onMove} onPointerEnter={enter} onPointerLeave={reset}>
      <motion.div
        style={enabled ? { rotateX: rx, rotateY: ry, z, transformStyle: 'preserve-3d' } : undefined}
        className={`group relative h-full transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgb(0_0_0/0.55)] ${className}`}
      >
        {enabled && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: spotlight }}
          />
        )}
        {enabled && glare && (
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 mix-blend-soft-light transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: sheen }}
          />
        )}
        {children}
      </motion.div>
    </div>
  )
}
