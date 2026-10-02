import { achievements } from '../../data/achievements'
import { sections } from '../../data/site'
import { RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'

export function Leadership() {
  if (achievements.length === 0) return null
  const [lead, ...rest] = achievements

  return (
    <Section id="leadership" eyebrow={sections.leadership.eyebrow} title={sections.leadership.title}>
      <ul className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        {lead && (
          <RevealItem className="relative overflow-hidden rounded-3xl border border-line/[0.08] bg-gradient-to-br from-accent/[0.07] via-line/[0.02] to-transparent p-6 sm:p-8 lg:row-span-2">
            <div aria-hidden="true" className="bg-grid mask-fade absolute inset-0 opacity-50" />
            <div className="relative">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[11px] tracking-wide text-accent">
                    {lead.context}
                    {lead.period && <span className="text-fg-subtle"> · {lead.period}</span>}
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-fg">{lead.title}</h3>
                </div>
                {lead.stat && (
                  <div className="flex items-center gap-4">
                    <p className="text-5xl font-semibold tracking-tight text-fg">
                      {lead.stat.value.replace(/\+$/, '')}
                      {lead.stat.value.endsWith('+') && <span className="text-accent">+</span>}
                    </p>
                    <p className="max-w-[10rem] text-xs leading-snug text-fg-muted">{lead.stat.label}</p>
                  </div>
                )}
              </div>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {lead.points.map((pt) => (
                  <li key={pt} className="rounded-xl border border-line/[0.06] bg-ink-900/60 p-4 text-sm leading-relaxed text-fg-muted">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>
        )}

        {rest.map((a, i) => (
          <RevealItem key={a.title} delay={0.08 * (i + 1)} className="rounded-3xl border border-line/[0.07] bg-line/[0.015] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-wide text-fg-subtle">{a.context}</p>
                <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-fg">{a.title}</h3>
              </div>
              {a.stat && (
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-semibold text-fg">{a.stat.value}</p>
                  <p className="max-w-[9rem] text-[11px] leading-snug text-fg-subtle">{a.stat.label}</p>
                </div>
              )}
            </div>
            <ul className="mt-4 space-y-2.5">
              {a.points.map((pt) => (
                <li key={pt} className="flex gap-3 text-sm leading-relaxed text-fg-muted">
                  <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                  {pt}
                </li>
              ))}
            </ul>
          </RevealItem>
        ))}
      </ul>
    </Section>
  )
}
