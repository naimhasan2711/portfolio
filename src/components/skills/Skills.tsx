import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { sections } from '../../data/site'
import { skillGroups } from '../../data/skills'
import { findSkillUsage, type SkillUsage } from '../../utils/skillUsage'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'

/** First group (Android) is full width; so is the last one if it would sit alone in its row. */
const spansFull = (i: number) => i === 0 || (i === skillGroups.length - 1 && (skillGroups.length - 1) % 2 === 1)

const kindLabel: Record<SkillUsage['kind'], string> = { project: 'Project', role: 'Role', training: 'Training' }

export function Skills() {
  const [skill, setSkill] = useState('Jetpack Compose')
  const panelRef = useRef<HTMLDivElement>(null)

  // On single-column layouts the panel sits below the chips — bring it into view.
  const pick = (s: string) => {
    setSkill(s)
    const panel = panelRef.current
    if (!panel || window.matchMedia('(min-width: 1024px)').matches) return
    const r = panel.getBoundingClientRect()
    if (r.top > window.innerHeight * 0.6 || r.bottom < 80) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      panel.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    }
  }
  const usage = useMemo(() => findSkillUsage(skill), [skill])
  const group = skillGroups.find((g) => g.skills.includes(skill))

  return (
    <Section id="skills" eyebrow={sections.skills.eyebrow} title={sections.skills.title} intro={sections.skills.intro}>
      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-10">
        <div className="grid gap-4 sm:grid-cols-2">
          {skillGroups.map((g, gi) => (
            <Reveal
              key={g.id}
              delay={0.04 * gi}
              className={`rounded-2xl border border-line/[0.07] bg-line/[0.015] p-5 ${spansFull(gi) ? 'sm:col-span-2' : ''}`}
            >
              <div role="group" aria-labelledby={`skills-${g.id}`}>
                <h3 id={`skills-${g.id}`} className="text-sm font-semibold text-fg">
                  {g.title}
                </h3>
                <p className="mt-1 text-xs text-fg-subtle">{g.description}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {g.skills.map((s) => {
                    const active = s === skill
                    return (
                      <li key={s}>
                        <button
                          type="button"
                          aria-pressed={active}
                          onClick={() => pick(s)}
                          className={`relative rounded-full border px-3 py-1.5 font-mono text-xs transition-all duration-300 ${
                            active
                              ? 'border-accent/60 bg-accent/12 text-accent-soft shadow-[0_0_20px_-4px_rgb(196_122_85/0.5)]'
                              : 'border-line/10 bg-line/[0.02] text-fg-muted hover:-translate-y-px hover:border-line/25 hover:text-fg'
                          }`}
                        >
                          {s}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>

        {/* "Used in" panel with a small constellation */}
        <Reveal delay={0.1} className="lg:sticky lg:top-24 lg:self-start">
          <div ref={panelRef} className="glass scroll-mt-20 overflow-hidden rounded-3xl" aria-live="polite">
            <Constellation skill={skill} usage={usage} />
            <div className="p-6">
              <p className="font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">{group?.title}</p>
              <h3 className="mt-1 text-2xl font-semibold tracking-tight text-fg">{skill}</h3>
              <AnimatePresence mode="wait">
                <motion.div key={skill} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  {usage.length > 0 ? (
                    <>
                      <p className="mt-2 text-sm text-fg-muted">
                        Mentioned in {usage.length} {usage.length === 1 ? 'entry' : 'entries'} of my experience.
                      </p>
                      <ul className="mt-5 flex flex-col gap-2">
                        {usage.map((u) => (
                          <li key={u.kind + u.name}>
                            <a
                              href={u.href}
                              className="group flex items-center justify-between gap-3 rounded-xl border border-line/[0.07] bg-line/[0.02] px-4 py-3 transition-colors hover:border-accent/30"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-medium text-fg">{u.name}</span>
                                <span className="block text-xs text-fg-subtle">
                                  {kindLabel[u.kind]} · {u.context}
                                </span>
                              </span>
                              <ArrowUpRight size={15} aria-hidden="true" className="shrink-0 text-fg-subtle transition-colors group-hover:text-accent" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                      Part of my technical toolkit — not tied to a specific project listed on this site.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  )
}

/** Decorative graph: the selected skill in the center, linked to each usage. */
function Constellation({ skill, usage }: { skill: string; usage: SkillUsage[] }) {
  const n = Math.max(usage.length, 1)
  const nodes = usage.map((u, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.6
    const r = i % 2 ? 0.78 : 1
    return { u, x: 190 + Math.cos(a) * 125 * r, y: 90 + Math.sin(a) * 62 * r }
  })
  return (
    <svg viewBox="0 0 380 180" className="block w-full border-b border-line/[0.06] bg-ink-950/40" aria-hidden="true">
      <defs>
        <pattern id="sk-grid" width="19" height="19" patternUnits="userSpaceOnUse">
          <path d="M19 0H0V19" fill="none" stroke="var(--line)" strokeOpacity="0.04" />
        </pattern>
      </defs>
      <rect width="380" height="180" fill="url(#sk-grid)" />
      <ellipse cx="190" cy="90" rx="125" ry="62" fill="none" stroke="var(--line)" strokeOpacity="0.06" strokeDasharray="2 5" />
      <g key={skill}>
        {nodes.map(({ u, x, y }, i) => (
          <g key={u.kind + u.name}>
            <motion.line
              x1="190"
              y1="90"
              x2={x}
              y2={y}
              stroke={u.kind === 'project' ? 'var(--accent)' : 'var(--cool)'}
              strokeOpacity="0.45"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.05 * i, duration: 0.5 }}
            />
            <motion.circle
              cx={x}
              cy={y}
              r={u.kind === 'project' ? 5 : 4}
              fill={u.kind === 'project' ? 'var(--accent)' : 'var(--cool)'}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05 * i + 0.3, type: 'spring', stiffness: 300, damping: 18 }}
              style={{ transformOrigin: `${x}px ${y}px` }}
            />
          </g>
        ))}
        <circle cx="190" cy="90" r="22" fill="var(--accent)" fillOpacity="0.08" />
        <circle cx="190" cy="90" r="9" fill="var(--bg-2)" stroke="var(--accent)" strokeWidth="1.5" />
        <circle cx="190" cy="90" r="3.5" fill="var(--accent)" />
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--fg-subtle)">
        <circle cx="16" cy="166" r="3" fill="var(--accent)" />
        <text x="24" y="169">project</text>
        <circle cx="76" cy="166" r="3" fill="var(--cool)" />
        <text x="84" y="169">role / training</text>
      </g>
    </svg>
  )
}
