import { Award, ExternalLink, GraduationCap } from 'lucide-react'
import { certifications, education } from '../../data/education'
import { sections } from '../../data/site'
import { Reveal, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'

function ColumnTitle({ children }: { children: string }) {
  return (
    <Reveal className="mb-5 flex items-center gap-4">
      <h3 className="font-mono text-xs tracking-[0.2em] text-fg-subtle uppercase">{children}</h3>
      <span className="h-px flex-1 bg-line/[0.07]" aria-hidden="true" />
    </Reveal>
  )
}

export function Education() {
  return (
    <Section id="education" eyebrow={sections.education.eyebrow} title={sections.education.title}>
      <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div>
          <ColumnTitle>Education</ColumnTitle>
          <ul className="flex flex-col gap-5">
            {education.map((e, i) => (
              <RevealItem
                key={e.institution}
                delay={0.06 * i}
                className="relative flex flex-col gap-5 overflow-hidden rounded-3xl border border-line/[0.08] bg-line/[0.02] p-6 sm:flex-row sm:items-start sm:p-7"
              >
                <div aria-hidden="true" className="absolute -top-16 -right-16 size-48 rounded-full bg-accent/[0.07] blur-3xl" />
                {e.logo ? (
                  <span className="relative grid size-20 shrink-0 place-items-center rounded-2xl border border-line/10 bg-line/[0.03] p-2.5">
                    <img
                      src={e.logo}
                      alt={`${e.institution} logo`}
                      width={240}
                      height={236}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain drop-shadow-[0_6px_14px_rgb(0_0_0/0.25)]"
                    />
                  </span>
                ) : (
                  <span className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-line/10 bg-line/[0.03] text-accent">
                    <GraduationCap size={20} aria-hidden="true" />
                  </span>
                )}
                <div className="relative min-w-0">
                  <p className="font-mono text-[11px] tracking-wide text-fg-subtle">
                    {e.start} — {e.end}
                    {e.location && ` · ${e.location}`}
                  </p>
                  <h4 className="mt-2 text-lg font-semibold tracking-tight text-fg sm:text-xl">{e.degree}</h4>
                  {e.field && <p className="mt-0.5 text-sm text-fg-muted">{e.field}</p>}
                  <p className="mt-1.5 text-fg-muted">{e.institution}</p>
                  {e.grade && (
                    <p className="mt-4 inline-flex rounded-full border border-accent/30 bg-accent/[0.07] px-3 py-1 font-mono text-xs text-accent-soft">
                      {e.grade}
                    </p>
                  )}
                </div>
              </RevealItem>
            ))}
          </ul>
        </div>

        <div>
          <ColumnTitle>Certifications</ColumnTitle>
          <ul className="flex flex-col gap-5">
            {certifications.map((c, i) => (
              <RevealItem key={c.name} delay={0.08 * (i + 1)}>
                <a
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex h-full items-start gap-4 rounded-3xl border border-line/[0.07] bg-line/[0.015] p-6 transition-colors duration-300 hover:border-accent/30 hover:bg-line/[0.03]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line/10 bg-line/[0.03] text-cool">
                    <Award size={20} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="font-mono text-[11px] tracking-wide text-fg-subtle">Certification · {c.issuer}</span>
                    <span className="mt-1.5 block text-base font-semibold text-fg">{c.name}</span>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs text-fg-muted transition-colors group-hover:text-accent">
                      View certificate <ExternalLink size={12} aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </span>
                  </span>
                </a>
              </RevealItem>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
