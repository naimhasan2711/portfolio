import { Check, Copy, MapPin } from 'lucide-react'
import { useState } from 'react'
import { profile, socialLinks } from '../../data/profile'
import { sections } from '../../data/site'
import { Icon } from '../common/Icon'
import { MagneticButton } from '../common/MagneticButton'
import { Reveal } from '../common/Reveal'
import { SectionHeading } from '../common/Section'
import { ContactForm } from './ContactForm'
import { SignalNetwork } from './SignalNetwork'

export function Contact() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      window.location.href = `mailto:${profile.email}`
    }
  }

  const links = [
    ...socialLinks.filter((l) => l.icon !== 'mail'),
    ...(profile.showPhone ? [{ label: profile.phone, href: `tel:${profile.phone}`, icon: 'phone' as const }] : []),
  ]

  return (
    <section id="contact" aria-labelledby="contact-title" className="relative py-20 md:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2rem] border border-line/[0.08] bg-ink-900">
          <SignalNetwork />
          <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(80%_90%_at_0%_100%,color-mix(in_oklab,var(--bg-2)_96%,transparent),transparent_75%)]" />

          <div className="relative grid gap-10 p-6 sm:p-10 md:p-14 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="flex flex-col">
              <SectionHeading id="contact" eyebrow={sections.contact.eyebrow} title={sections.contact.title} intro={sections.contact.intro} />

              <Reveal className="-mt-4 md:-mt-8">
                <div className="flex items-center justify-between gap-3 rounded-2xl border border-line/[0.08] bg-ink-950/40 px-4 py-3 sm:px-5">
                  <div className="min-w-0">
                    <p className="font-mono text-[10px] tracking-[0.18em] text-fg-subtle uppercase">Email</p>
                    <a href={`mailto:${profile.email}`} className="block truncate text-base font-medium text-fg hover:text-accent">
                      {profile.email}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-line/10 text-fg-muted transition-colors hover:border-accent/40 hover:text-accent"
                    aria-label={copied ? 'Email address copied' : 'Copy email address'}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                  <span role="status" className="sr-only">
                    {copied ? 'Email address copied to clipboard' : ''}
                  </span>
                </div>

                <p className="mt-4 flex items-center gap-2 text-sm text-fg-muted">
                  <MapPin size={15} aria-hidden="true" className="text-accent" />
                  Based in {profile.location}
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <MagneticButton href={`mailto:${profile.email}`} variant="ghost">
                    <Icon name="mail" size={16} />
                    Open email app
                  </MagneticButton>
                  {links.map((l) => (
                    <MagneticButton key={l.label} href={l.href} variant="ghost" external={l.href.startsWith('http')}>
                      <Icon name={l.icon} size={16} />
                      {l.label}
                    </MagneticButton>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.1}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
