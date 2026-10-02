import { ArrowUp } from 'lucide-react'
import { profile, socialLinks } from '../../data/profile'
import { Icon } from './Icon'

export function Footer() {
  return (
    <footer className="border-t border-line/[0.06] py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-5 sm:flex-row sm:px-8">
        <p className="text-center text-sm text-fg-subtle sm:text-left">
          © {new Date().getFullYear()} {profile.name} · {profile.title}
        </p>
        <div className="flex items-center gap-2">
          {socialLinks.map((l) => (
            <a
              key={l.label}
              href={l.href}
              aria-label={l.label}
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="grid size-10 place-items-center rounded-full text-fg-subtle transition-colors hover:text-accent"
            >
              <Icon name={l.icon} size={16} />
            </a>
          ))}
          <a
            href="#top"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-line/10 px-4 py-2 text-xs text-fg-muted transition-colors hover:border-line/25 hover:text-fg"
          >
            Back to top <ArrowUp size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
    </footer>
  )
}
