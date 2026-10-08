import { MapPin } from 'lucide-react'
import { experiences } from '../../data/experience'
import { about, headlineStats, profile } from '../../data/profile'
import { sections } from '../../data/site'
import { Reveal, RevealItem } from '../common/Reveal'
import { Section } from '../common/Section'
import { TiltCard } from '../common/TiltCard'

/** Renders the heading with its emphasised phrase in italic serif. */
function EmphasisHeading() {
  const { heading, headingEmphasis } = about
  const at = headingEmphasis ? heading.indexOf(headingEmphasis) : -1
  if (at < 0) return <>{heading}</>
  return (
    <>
      {heading.slice(0, at)}
      <em className="font-serif font-normal text-accent italic">{headingEmphasis}</em>
      {heading.slice(at + headingEmphasis.length)}
    </>
  )
}

function Portrait() {
  const current = experiences[0]
  return (
    <figure className="relative mx-auto w-full max-w-[270px] sm:max-w-[330px]">
      {/* offset hairline frame */}
      <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border border-accent/30" />

      <TiltCard className="rounded-[28px]" max={8} lift={18}>
      <div className="relative overflow-hidden rounded-[28px] border border-line/10 bg-ink-850 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.55)]">
        <div className="relative aspect-[4/5]">
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(70% 55% at 50% 78%, color-mix(in oklab, var(--accent-soft) 55%, transparent) 0%, transparent 70%), linear-gradient(180deg, var(--card) 0%, color-mix(in oklab, var(--accent) 45%, var(--card)) 100%)',
            }}
          />
          <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-60" />
          {profile.photo && (
            <img
              src={profile.photo}
              alt={`Portrait of ${profile.name}`}
              width={760}
              height={1211}
              loading="lazy"
              decoding="async"
              className="absolute bottom-0 left-1/2 w-[76%] -translate-x-1/2 drop-shadow-[0_20px_30px_rgb(0_0_0/0.35)]"
            />
          )}
        </div>

        {current && (
          <figcaption className="flex items-center justify-between gap-3 border-t border-line/[0.08] px-5 py-4">
            <div className="min-w-0">
              <p className="text-sm leading-snug font-medium text-fg">{current.role}</p>
              <p className="mt-0.5 text-xs text-fg-muted">
                {current.company} · since {current.start.split(' ').at(-1)}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/[0.08] px-2.5 py-1 font-mono text-[10px] tracking-wider text-accent uppercase">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              Current
            </span>
          </figcaption>
        )}
      </div>
      </TiltCard>
    </figure>
  )
}

export function About() {
  return (
    <Section id="about" eyebrow={sections.about.eyebrow} title={sections.about.title}>
      <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
        <Reveal y={36}>
          <Portrait />
        </Reveal>

        <div>
          <Reveal>
            <p className="text-[1.75rem] leading-[1.2] font-medium tracking-tight text-balance text-fg sm:text-4xl sm:leading-[1.15]">
              <EmphasisHeading />
            </p>
          </Reveal>

          <div className="mt-8 space-y-5">
            {about.paragraphs.map((p, i) => (
              <Reveal key={i} delay={0.05 * i}>
                <p className="text-base leading-relaxed text-fg-muted sm:text-[17px]">{p}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1} className="mt-9 flex flex-wrap items-end justify-between gap-4 border-t border-line/[0.08] pt-6">
            <div>
              <p className="font-serif text-3xl text-fg italic">{profile.name}</p>
              <p className="mt-1 text-sm text-fg-muted">{profile.title}</p>
            </div>
            <p className="flex items-center gap-1.5 text-sm text-fg-subtle">
              <MapPin size={14} aria-hidden="true" className="text-accent" /> {profile.location}
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <dl className="mt-8 grid grid-cols-2 gap-y-6 sm:grid-cols-4">
              {headlineStats.map((s, i) => (
                <div
                  key={s.label}
                  className={`flex flex-col-reverse justify-end pr-4 ${i > 0 ? 'sm:border-l sm:border-line/[0.08] sm:pl-5' : ''} ${i % 2 ? 'max-sm:border-l max-sm:border-line/[0.08] max-sm:pl-5' : ''}`}
                >
                  <dt className="mt-1.5 text-xs leading-snug text-fg-muted">{s.label}</dt>
                  <dd className="font-serif text-5xl leading-none text-fg">
                    {s.value.replace(/\+$/, '')}
                    {s.value.endsWith('+') && <span className="text-accent">+</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      <ul className="mt-20 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {about.principles.map((p, i) => (
          <RevealItem key={p.title} delay={0.06 * i} className="group border-t border-line/[0.1] pt-6">
            <span className="font-serif text-2xl text-accent italic">{String(i + 1).padStart(2, '0')}</span>
            <h3 className="mt-3 text-base font-semibold text-fg">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.body}</p>
            <span aria-hidden="true" className="mt-5 block h-px w-8 bg-accent/60 transition-all duration-500 group-hover:w-16" />
          </RevealItem>
        ))}
      </ul>
    </Section>
  )
}
