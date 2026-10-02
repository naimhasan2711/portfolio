import { AnimatePresence, motion, useScroll, useSpring } from 'motion/react'
import { ChevronDown, MapPin } from 'lucide-react'
import { useRef, useState } from 'react'
import { experiences } from '../../data/experience'
import { projects } from '../../data/projects'
import { sections } from '../../data/site'
import type { Experience as ExperienceEntry } from '../../data/types'
import { Chip } from '../common/Chip'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'

export function Experience() {
  const listRef = useRef<HTMLOListElement>(null)
  const [openId, setOpenId] = useState<string | null>(experiences[0]?.id ?? null)
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start 70%', 'end 60%'] })
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })

  return (
    <Section id="experience" eyebrow={sections.experience.eyebrow} title={sections.experience.title} intro={sections.experience.intro}>
      <ol ref={listRef} className="relative">
        {/* timeline rail + scroll-linked progress */}
        <div aria-hidden="true" className="absolute top-2 bottom-2 left-[7px] w-px bg-line/[0.08] md:left-[calc(11rem+7px)]" />
        <motion.div
          aria-hidden="true"
          style={{ scaleY: progress }}
          className="absolute top-2 bottom-2 left-[7px] w-px origin-top bg-gradient-to-b from-accent via-accent/70 to-cool/40 md:left-[calc(11rem+7px)]"
        />

        {experiences.map((exp, i) => (
          <TimelineItem
            key={exp.id}
            exp={exp}
            index={i}
            open={openId === exp.id}
            onToggle={() => setOpenId((cur) => (cur === exp.id ? null : exp.id))}
          />
        ))}
      </ol>
    </Section>
  )
}

function TimelineItem({ exp, index, open, onToggle }: { exp: ExperienceEntry; index: number; open: boolean; onToggle: () => void }) {
  const [hoveredTech, setHoveredTech] = useState<string | null>(null)
  const related = projects.filter((p) => exp.projectIds.includes(p.id))
  const current = exp.end.toLowerCase() === 'present'
  const panelId = `exp-panel-${exp.id}`

  return (
    <li className="relative pb-12 pl-10 last:pb-0 md:grid md:grid-cols-[11rem_1fr] md:gap-10 md:pl-0">
      {/* date column */}
      <Reveal className="mb-3 md:mb-0 md:pt-6 md:pr-10 md:text-right">
        <p className="font-mono text-xs tracking-wide text-fg-muted">
          {exp.start} —<br className="hidden md:block" /> <span className={current ? 'text-accent' : ''}>{exp.end}</span>
        </p>
      </Reveal>

      {/* node */}
      <span
        aria-hidden="true"
        className={`absolute top-1 left-0 grid size-[15px] place-items-center rounded-full border md:top-[30px] md:left-[11rem] ${
          open || current ? 'border-accent bg-ink-950' : 'border-line/20 bg-ink-900'
        }`}
      >
        <span className={`size-[5px] rounded-full ${open || current ? 'bg-accent shadow-[0_0_10px_var(--accent)]' : 'bg-line/30'}`} />
      </span>

      <Reveal delay={0.05 * index} className="md:pl-10">
        <article
          className={`rounded-2xl border transition-[border-color,background-color] duration-500 ${
            open ? 'border-line/[0.12] bg-line/[0.035]' : 'border-line/[0.06] bg-line/[0.015] hover:border-line/[0.1]'
          }`}
        >
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={open}
            aria-controls={panelId}
            className="flex w-full items-start justify-between gap-4 rounded-2xl p-5 text-left sm:p-6"
          >
            <div className="min-w-0">
              <h3 className="text-lg font-semibold tracking-tight text-fg sm:text-xl">{exp.role}</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
                <span className="font-medium text-fg/90">{exp.company}</span>
                <span className="flex items-center gap-1 text-fg-subtle">
                  <MapPin size={13} aria-hidden="true" />
                  {exp.location}
                </span>
              </p>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted sm:text-[15px]">{exp.summary}</p>
            </div>
            <span
              className={`mt-1 grid size-9 shrink-0 place-items-center rounded-full border border-line/10 text-fg-muted transition-transform duration-500 ${
                open ? 'rotate-180 text-accent' : ''
              }`}
            >
              <ChevronDown size={16} aria-hidden="true" />
              <span className="sr-only">{open ? 'Hide details' : 'Show details'}</span>
            </span>
          </button>

          {/* highlight stats — visible even when collapsed */}
          <dl className="flex flex-wrap border-t border-line/[0.06]">
            {exp.highlights.map((h) => (
              <div key={h.label} className="flex basis-1/2 flex-col-reverse px-5 py-4 sm:flex-1 sm:basis-0 sm:px-6">
                <dt className="mt-0.5 text-[11px] leading-snug text-fg-subtle">{h.label}</dt>
                <dd className="text-xl font-semibold tracking-tight text-fg">{h.value}</dd>
              </div>
            ))}
          </dl>

          <AnimatePresence initial={false}>
            {open && (
              <motion.div
                id={panelId}
                key="panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden"
              >
                <div className="border-t border-line/[0.06] p-5 sm:p-6">
                  <h4 className="font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">Key contributions</h4>
                  <ul className="mt-4 space-y-3">
                    {exp.responsibilities.map((r) => (
                      <li key={r} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                        <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                        {r}
                      </li>
                    ))}
                  </ul>

                  <h4 className="mt-7 font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">Technologies</h4>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {exp.technologies.map((t) => (
                      <li key={t} onPointerEnter={() => setHoveredTech(t)} onPointerLeave={() => setHoveredTech(null)}>
                        <Chip active={hoveredTech === t}>{t}</Chip>
                      </li>
                    ))}
                  </ul>

                  {related.length > 0 && (
                    <>
                      <h4 className="mt-7 font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">Projects in this role</h4>
                      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {related.map((p) => {
                          const usesHovered = hoveredTech !== null && p.technologies.includes(hoveredTech)
                          return (
                            <li key={p.id}>
                              <a
                                href={`#project-${p.id}`}
                                className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm transition-colors duration-300 ${
                                  usesHovered ? 'border-accent/40 bg-accent/[0.06] text-fg' : 'border-line/[0.07] text-fg-muted hover:border-line/15 hover:text-fg'
                                }`}
                              >
                                <span className="font-medium">{p.name}</span>
                                <span className="font-mono text-[10px] text-fg-subtle">{p.start.split(' ').at(-1)}</span>
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </article>
      </Reveal>
    </li>
  )
}
