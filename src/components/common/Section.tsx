import type { ReactNode } from 'react'
import { Reveal } from './Reveal'

interface SectionProps {
  id?: string
  eyebrow: string
  title: string
  intro?: string
  children: ReactNode
  className?: string
  /** Extra element rendered to the right of the heading on wide screens. */
  aside?: ReactNode
}

export function SectionHeading({ eyebrow, title, intro, aside, id }: Omit<SectionProps, 'children' | 'className'>) {
  return (
    <Reveal className="mb-12 flex flex-col gap-6 md:mb-16 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="mb-4 flex items-center gap-3 font-mono text-xs tracking-[0.2em] text-accent uppercase">
          <span className="h-px w-8 bg-accent/60" aria-hidden="true" />
          {eyebrow}
        </p>
        <h2 id={id ? `${id}-title` : undefined} className="text-gradient text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
          {title}
        </h2>
        {intro && <p className="mt-5 max-w-xl text-base leading-relaxed text-fg-muted md:text-lg">{intro}</p>}
      </div>
      {aside}
    </Reveal>
  )
}

/** Standard page section: consistent spacing, max width and heading. */
export function Section({ id, eyebrow, title, intro, aside, children, className = '' }: SectionProps) {
  return (
    <section id={id} aria-labelledby={id ? `${id}-title` : undefined} className={`relative py-20 md:py-28 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <SectionHeading id={id} eyebrow={eyebrow} title={title} intro={intro} aside={aside} />
        {children}
      </div>
    </section>
  )
}
