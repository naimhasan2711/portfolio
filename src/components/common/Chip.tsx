import type { ReactNode } from 'react'

interface ChipProps {
  children: ReactNode
  active?: boolean
  className?: string
}

/** Small technology badge. */
export function Chip({ children, active = false, className = '' }: ChipProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 font-mono text-[11px] leading-5 tracking-wide transition-colors duration-300 ${
        active ? 'border-accent/50 bg-accent/10 text-accent-soft' : 'border-line/10 bg-line/[0.03] text-fg-muted'
      } ${className}`}
    >
      {children}
    </span>
  )
}
