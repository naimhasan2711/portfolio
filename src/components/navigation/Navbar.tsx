import { AnimatePresence, motion } from 'motion/react'
import { Menu, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { profile, socialLinks } from '../../data/profile'
import { navItems } from '../../data/site'
import { useActiveSection } from '../../hooks/useActiveSection'
import { Icon } from '../common/Icon'
import { ThemeToggle } from './ThemeToggle'

const sectionIds = navItems.map((n) => n.id)

export function Navbar() {
  const active = useActiveSection(sectionIds)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock page scroll and support Escape while the mobile menu is open.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        toggleRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  // Close the menu if the viewport grows to desktop size.
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const onChange = () => mql.matches && setOpen(false)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return (
    <>
      <a
        href="#main"
        className="fixed top-3 left-3 z-[80] -translate-y-20 rounded-md bg-accent px-4 py-2 text-sm font-medium text-on-accent transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled || open ? 'border-b border-line/[0.06] bg-ink-950/70 backdrop-blur-xl' : 'border-b border-transparent'
        }`}
      >
        <nav aria-label="Primary" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="#top" className="group flex items-center gap-3" aria-label={`${profile.name} — back to top`}>
            {profile.avatar ? (
              <span className="relative size-10 shrink-0 rounded-full bg-gradient-to-br from-accent-soft to-accent-deep p-[2px] transition-transform duration-300 group-hover:scale-105">
                <img
                  src={profile.avatar}
                  alt=""
                  width={128}
                  height={128}
                  decoding="async"
                  className="size-full rounded-full bg-gradient-to-b from-accent to-accent-deep object-cover object-top"
                />
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-ink-950 bg-accent" />
              </span>
            ) : (
              <span className="relative grid size-9 place-items-center rounded-xl border border-line/10 bg-line/[0.03] font-mono text-xs font-medium tracking-wider text-fg transition-colors group-hover:border-accent/40">
                {profile.initials}
                <span className="absolute -right-0.5 -bottom-0.5 size-2 rounded-full bg-accent shadow-[0_0_10px_var(--accent)]" />
              </span>
            )}
            <span className="hidden text-sm font-medium whitespace-nowrap text-fg sm:block md:hidden lg:block">{profile.name}</span>
          </a>

          <ul className="hidden items-center gap-1 md:flex" onPointerLeave={() => setHovered(null)}>
            {navItems.map((item) => {
              const isActive = active === item.id
              const isHovered = hovered === item.id
              return (
                <li key={item.id} onPointerEnter={() => setHovered(item.id)}>
                  <a
                    href={`#${item.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    onFocus={() => setHovered(item.id)}
                    onBlur={() => setHovered(null)}
                    className={`group/nav relative block rounded-full px-3 py-2 text-sm transition-colors duration-300 lg:px-4 ${
                      isActive ? 'text-fg' : 'text-fg-muted'
                    }`}
                  >
                    {/* soft highlight that glides between items as the pointer moves */}
                    {isHovered && (
                      <motion.span
                        layoutId="nav-hover"
                        className="absolute inset-0 -z-20 rounded-full bg-accent/[0.08]"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 -z-10 rounded-full border border-line/10 bg-line/[0.06]"
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                      />
                    )}
                    {/* text roll: the label slides up and a copper copy rolls in from below */}
                    <span className="relative block overflow-hidden">
                      <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/nav:-translate-y-full group-focus-visible/nav:-translate-y-full">
                        {item.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 block translate-y-full text-accent-soft transition-transform duration-[450ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover/nav:translate-y-0 group-focus-visible/nav:translate-y-0"
                      >
                        {item.label}
                      </span>
                    </span>
                    {/* copper dot under the item */}
                    <span
                      aria-hidden="true"
                      className={`absolute bottom-0.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent transition-all duration-300 ${
                        isActive ? 'scale-100 opacity-100' : 'scale-0 opacity-0 group-hover/nav:scale-100 group-hover/nav:opacity-60'
                      }`}
                    />
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <a
              href="#contact"
              className="hidden rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-medium whitespace-nowrap text-accent-soft transition-colors hover:bg-accent/20 lg:inline-flex"
            >
              Get in touch
            </a>

            <button
              ref={toggleRef}
              type="button"
              className="grid size-11 place-items-center rounded-xl border border-line/10 bg-line/[0.03] text-fg md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((o) => !o)}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-16 z-40 flex flex-col overflow-y-auto bg-ink-950/95 px-5 pt-8 pb-10 backdrop-blur-2xl md:hidden"
          >
            <div aria-hidden="true" className="bg-grid mask-fade pointer-events-none absolute inset-0 opacity-50" />
            <ul className="relative flex flex-col">
              {navItems.map((item, i) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i + 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={`#${item.id}`}
                    onClick={() => setOpen(false)}
                    aria-current={active === item.id ? 'true' : undefined}
                    className="flex items-baseline gap-4 border-b border-line/[0.06] py-4 text-3xl font-medium tracking-tight text-fg"
                  >
                    <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.div
              className="relative mt-auto flex flex-wrap gap-3 pt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
            >
              {socialLinks.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm text-fg"
                >
                  <Icon name={l.icon} size={16} />
                  {l.label}
                </a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
