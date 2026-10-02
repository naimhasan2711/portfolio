import { motion, useMotionValue, useSpring } from 'motion/react'
import type { PointerEvent, ReactNode } from 'react'
import { useFinePointer, usePrefersReducedMotion } from '../../hooks/useMediaQuery'

interface MagneticButtonProps {
  href: string
  children: ReactNode
  variant?: 'primary' | 'ghost'
  external?: boolean
  className?: string
  ariaLabel?: string
}

const variants = {
  primary:
    'bg-accent text-on-accent shadow-[0_0_0_1px_rgb(196_122_85/0.4),0_8px_30px_-6px_rgb(196_122_85/0.45)] hover:bg-accent-soft',
  ghost: 'glass text-fg hover:border-line/20 hover:bg-line/[0.06]',
}

/** Link styled as a button that leans toward the cursor (mouse users only). */
export function MagneticButton({ href, children, variant = 'primary', external, className = '', ariaLabel }: MagneticButtonProps) {
  const fine = useFinePointer()
  const reduced = usePrefersReducedMotion()
  const x = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 })
  const y = useSpring(useMotionValue(0), { stiffness: 250, damping: 18, mass: 0.4 })
  const enabled = fine && !reduced

  const onMove = (e: PointerEvent<HTMLAnchorElement>) => {
    if (!enabled) return
    const r = e.currentTarget.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.a
      href={href}
      aria-label={ariaLabel}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      className={`group inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-medium transition-colors duration-300 ${variants[variant]} ${className}`}
    >
      {children}
    </motion.a>
  )
}
