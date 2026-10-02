import { ArrowUpRight, Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { projects } from '../../data/projects'
import { sections } from '../../data/site'
import type { Project } from '../../data/types'
import { Chip } from '../common/Chip'
import { Reveal, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'
import { TiltCard } from '../common/TiltCard'
import { ProjectArt } from './ProjectArt'

const period = (p: Project) => `${p.start} – ${p.end}`

export function Projects() {
  const [selected, setSelected] = useState<Project | null>(null)
  const featured = projects.filter((p) => p.featured)
  const others = projects.filter((p) => !p.featured)

  return (
    <Section id="projects" eyebrow={sections.projects.eyebrow} title={sections.projects.title} intro={sections.projects.intro}>
      <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {featured.map((p, i) => (
          <RevealItem key={p.id} id={`project-${p.id}`} delay={0.08 * i} className={`h-full scroll-mt-24 ${i === 0 ? 'md:col-span-2 lg:col-span-1' : ''}`}>
            <FeaturedCard project={p} onOpen={() => setSelected(p)} />
          </RevealItem>
        ))}
      </ul>

      <Reveal className="mt-14 mb-5 flex items-center gap-4">
        <h3 className="font-mono text-xs tracking-[0.2em] text-fg-subtle uppercase">More projects</h3>
        <span className="h-px flex-1 bg-line/[0.07]" aria-hidden="true" />
      </Reveal>
      <ul className="grid gap-4 md:grid-cols-3">
        {others.map((p, i) => (
          <RevealItem key={p.id} id={`project-${p.id}`} delay={0.06 * i} className="h-full scroll-mt-24">
            <CompactCard project={p} onOpen={() => setSelected(p)} />
          </RevealItem>
        ))}
      </ul>

      <ProjectDialog project={selected} onClose={() => setSelected(null)} />
    </Section>
  )
}

function FeaturedCard({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  const shown = p.technologies.slice(0, 4)
  const extra = p.technologies.length - shown.length
  return (
    <TiltCard className="rounded-3xl">
      <article className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-line/[0.08] bg-ink-900 transition-colors duration-500 group-hover:border-line/[0.16]">
        <div className="relative aspect-[5/3] overflow-hidden border-b border-line/[0.06]">
          <ProjectArt motif={p.motif} className="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]" />
          {p.highlight && (
            <div className="glass absolute bottom-3 left-3 rounded-xl px-3 py-2">
              <p className="text-lg leading-none font-semibold text-fg">{p.highlight.value}</p>
              <p className="mt-1 text-[11px] text-fg-muted">{p.highlight.label}</p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="font-mono text-[11px] tracking-wide text-fg-subtle">
            {p.company} · {p.start.split(' ').at(-1)}
            {p.end === 'Present' ? ' — Present' : ''}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-fg">{p.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.tagline}</p>
          <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Technologies">
            {shown.map((t) => (
              <li key={t}>
                <Chip>{t}</Chip>
              </li>
            ))}
            {extra > 0 && (
              <li>
                <Chip>+{extra}</Chip>
              </li>
            )}
          </ul>
          <button
            type="button"
            onClick={onOpen}
            className="mt-6 inline-flex items-center gap-2 self-start text-sm font-medium text-accent-soft after:absolute after:inset-0 after:content-[''] hover:text-accent"
            aria-haspopup="dialog"
          >
            View details <ArrowUpRight size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="sr-only">about {p.name}</span>
          </button>
        </div>
      </article>
    </TiltCard>
  )
}

function CompactCard({ project: p, onOpen }: { project: Project; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="group flex h-full w-full items-stretch gap-4 rounded-2xl border border-line/[0.07] bg-line/[0.015] p-3 text-left transition-colors duration-300 hover:border-line/[0.15] hover:bg-line/[0.03]"
    >
      <span className="relative w-24 shrink-0 overflow-hidden rounded-xl border border-line/[0.06] sm:w-28">
        <ProjectArt motif={p.motif} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col justify-center py-1">
        <span className="font-mono text-[10px] tracking-wide text-fg-subtle">
          {p.company} · {p.start.split(' ').at(-1)}
        </span>
        <span className="mt-1 text-base font-semibold text-fg">{p.name}</span>
        <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-fg-muted">{p.tagline}</span>
      </span>
      <Plus size={16} aria-hidden="true" className="mt-1 shrink-0 text-fg-subtle transition-transform duration-300 group-hover:rotate-90 group-hover:text-accent" />
    </button>
  )
}

/** Native <dialog>: focus trapping, Escape-to-close and backdrop come for free. */
function ProjectDialog({ project, onClose }: { project: Project | null; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null)
  // Keep the last project rendered during the close animation.
  const [shown, setShown] = useState<Project | null>(project)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (project) {
      setShown(project)
      if (!d.open) d.showModal()
      document.body.style.overflow = 'hidden'
    } else if (d.open) {
      d.close()
    }
  }, [project])

  useEffect(() => {
    const d = ref.current
    if (!d) return
    const onDialogClose = () => {
      document.body.style.overflow = ''
      onClose()
    }
    d.addEventListener('close', onDialogClose)
    return () => d.removeEventListener('close', onDialogClose)
  }, [onClose])

  const p = shown
  return (
    <dialog
      ref={ref}
      aria-labelledby="project-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close()
      }}
      className="project-dialog m-auto max-h-[92dvh] w-[min(760px,calc(100vw-24px))] overflow-hidden rounded-3xl border border-line/10 bg-ink-900 p-0 text-fg backdrop:bg-ink-950/75 backdrop:backdrop-blur-md"
    >
      {p && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="relative h-44 shrink-0 overflow-hidden border-b border-line/[0.06] sm:h-56">
            <ProjectArt motif={p.motif} />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/20 to-transparent" />
            <button
              type="button"
              onClick={() => ref.current?.close()}
              className="glass absolute top-4 right-4 grid size-10 place-items-center rounded-full text-fg"
              aria-label="Close project details"
              autoFocus
            >
              <X size={18} />
            </button>
            <div className="absolute right-6 bottom-5 left-6">
              <p className="font-mono text-[11px] tracking-wide text-accent">{p.company}</p>
              <h3 id="project-dialog-title" className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
                {p.name}
              </h3>
            </div>
          </div>

          <div className="overflow-y-auto p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <p className="max-w-md text-[15px] leading-relaxed text-fg-muted">{p.tagline}</p>
              <div className="flex gap-3">
                {p.highlight && (
                  <div className="rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-2.5">
                    <p className="text-xl leading-none font-semibold">{p.highlight.value}</p>
                    <p className="mt-1 text-[11px] text-fg-muted">{p.highlight.label}</p>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-4 font-mono text-xs text-fg-subtle">{period(p)}</p>

            <h4 className="mt-8 font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">What I did</h4>
            <ul className="mt-4 space-y-3">
              {p.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                  <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  {pt}
                </li>
              ))}
            </ul>

            <h4 className="mt-8 font-mono text-[11px] tracking-[0.18em] text-fg-subtle uppercase">Technologies</h4>
            <ul className="mt-3 flex flex-wrap gap-2">
              {p.technologies.map((t) => (
                <li key={t}>
                  <Chip active>{t}</Chip>
                </li>
              ))}
            </ul>

            {p.link && (
              <a
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-on-accent"
              >
                Visit project <ArrowUpRight size={15} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
      )}
    </dialog>
  )
}
