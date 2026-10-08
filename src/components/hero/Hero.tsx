import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowRight, Minus, Plus, RotateCcw, Rotate3d } from 'lucide-react'
import { lazy, Suspense, useEffect, useState } from 'react'
import { experiences } from '../../data/experience'
import { profile, socialLinks } from '../../data/profile'
import { hasWebGL } from '../../utils/device'
import { resetView, zoomBy } from '../three/input'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { Icon } from '../common/Icon'
import { MagneticButton } from '../common/MagneticButton'
import { HeroBackdrop } from './HeroBackdrop'
import { TypedName } from './TypedName'

// three.js is code-split into its own chunk and loaded after first paint.
const HeroScene = lazy(() => import('../three/HeroScene'))

const ease = [0.16, 1, 0.3, 1] as const
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
}

export function Hero() {
  const [webgl] = useState(() => hasWebGL())
  const [sceneReady, setSceneReady] = useState(false)
  // true once the 3D models have downloaded and the scene has appeared
  const [modelReady, setModelReady] = useState(false)
  useEffect(() => {
    const onReady = () => setModelReady(true)
    window.addEventListener('hero-model-ready', onReady)
    return () => window.removeEventListener('hero-model-ready', onReady)
  }, [])
  const current = experiences[0]
  const [first, ...rest] = profile.name.split(' ')
  const firstLine = [first, rest.slice(0, -1).join(' ')].filter(Boolean).join(' ')
  const lastName = rest.at(-1) ?? ''

  const fallback = <HeroBackdrop illustrated />

  return (
    <section id="top" aria-label="Introduction" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-20 pb-12 sm:pt-24 lg:pb-16">
      <HeroBackdrop />
      {webgl ? (
        <ErrorBoundary fallback={fallback}>
          <Suspense fallback={null}>
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: sceneReady ? 1 : 0 }}
              transition={{ duration: 1.6, ease }}
            >
              <HeroScene onReady={() => setSceneReady(true)} />
            </motion.div>
          </Suspense>
        </ErrorBoundary>
      ) : (
        fallback
      )}

      {/* Centred two-column layout (same width as the other sections). On phones/tablets the 3D stage comes first. */}
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-6 px-5 sm:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-4">
        <motion.div
          className="relative z-10 max-w-2xl"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } } }}
        >
          <motion.p
            variants={item}
            className="glass mb-7 inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2.5 text-xs text-fg-muted"
          >
            <span className="relative flex size-2">
              <span className="absolute inset-0 animate-[pulse-dot_2.4s_ease-in-out_infinite] rounded-full bg-accent" />
            </span>
            <span className="font-medium text-fg">{profile.title}</span>
            <span className="text-fg-subtle max-[359px]:hidden">·</span>
            <span className="max-[359px]:hidden">{profile.location}</span>
          </motion.p>

          <motion.h1 variants={item} className="text-[clamp(2.6rem,9vw,5.6rem)] leading-[0.95] font-semibold tracking-[-0.02em]">
            <TypedName lines={[firstLine, lastName]} lineClasses={['text-gradient', 'text-accent-gradient pb-2']} />
          </motion.h1>

          <motion.ul variants={item} aria-label="Specialties" className="mt-6 flex flex-wrap items-center gap-2">
            {profile.specialties.map((s) => (
              <li
                key={s}
                className="rounded-md border border-line/10 bg-ink-950/60 px-2.5 py-1 font-mono text-[12px] text-fg-muted backdrop-blur-sm sm:text-[13px]"
              >
                {s}
              </li>
            ))}
          </motion.ul>

          <motion.p variants={item} className="mt-6 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
            {profile.intro}
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton href="#projects">
              View my work
              <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
            </MagneticButton>
            <MagneticButton href="#contact" variant="ghost">
              Contact me
            </MagneticButton>
          </motion.div>

          <motion.ul variants={item} className="mt-8 flex items-center gap-2" aria-label="Profiles">
            {socialLinks.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  aria-label={l.label}
                  {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="grid size-11 place-items-center rounded-full border border-line/10 bg-line/[0.02] text-fg-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:text-accent"
                >
                  <Icon name={l.icon} size={17} />
                </a>
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* The 3D scene fits itself into this box. Drag / swipe sideways to spin it. */}
        <div className="relative order-first lg:order-none">
          <div
            id="hero-stage"
            aria-label="3D workstation — drag sideways to rotate, pinch or Ctrl + scroll to zoom"
            role="img"
            tabIndex={0}
            className="relative mx-auto h-[clamp(300px,92vw,520px)] w-full max-w-2xl cursor-grab touch-pan-y select-none active:cursor-grabbing lg:h-[min(74vh,660px)] lg:max-w-none"
          />
          {webgl && (
            <AnimatePresence>
              {!modelReady && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  role="status"
                  className="pointer-events-none absolute inset-0 grid place-items-center"
                >
                  <div className="flex flex-col items-center gap-4">
                    <span className="relative grid size-16 place-items-center">
                      <span className="absolute inset-0 animate-spin rounded-full border-2 border-line/10 border-t-accent [animation-duration:1.1s]" />
                      <span className="absolute inset-2 animate-spin rounded-full border border-line/5 border-b-accent-soft/70 [animation-direction:reverse] [animation-duration:1.8s]" />
                      <span className="size-2 animate-[pulse-dot_1.6s_ease-in-out_infinite] rounded-full bg-accent" />
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.25em] text-fg-subtle uppercase">Loading workspace</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          {webgl && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: modelReady ? 1 : 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="pointer-events-none absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-line/10 bg-ink-950/60 px-3 py-1 whitespace-nowrap font-mono text-[10px] tracking-[0.16em] text-fg-subtle uppercase backdrop-blur-sm lg:top-4 lg:bottom-auto"
            >
              <Rotate3d size={12} aria-hidden="true" className="text-accent" /> Drag to rotate · pinch to zoom
            </motion.p>
          )}
          {webgl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: modelReady ? 1 : 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              role="group"
              aria-label="3D view controls"
              className="absolute right-1 bottom-1 flex flex-col gap-1.5 lg:top-4 lg:right-4 lg:bottom-auto"
            >
              {[
                { label: 'Zoom in', icon: <Plus size={15} />, onClick: () => zoomBy(1.18) },
                { label: 'Zoom out', icon: <Minus size={15} />, onClick: () => zoomBy(1 / 1.18) },
                { label: 'Reset view', icon: <RotateCcw size={14} />, onClick: resetView },
              ].map((b) => (
                <button
                  key={b.label}
                  type="button"
                  onClick={b.onClick}
                  aria-label={b.label}
                  title={b.label}
                  className="grid size-9 place-items-center rounded-full border border-line/10 bg-ink-950/60 text-fg-muted backdrop-blur-sm transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {b.icon}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {current && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.8, ease }}
          className="glass absolute bottom-10 hidden max-w-xs rounded-2xl p-4 lg:block lg:right-[max(2rem,calc((100vw-72rem)/2+2rem))]"
        >
          <p className="font-mono text-[10px] tracking-[0.2em] text-fg-subtle uppercase">Currently</p>
          <p className="mt-1.5 text-sm font-medium text-fg">
            {current.role} <span className="text-fg-muted">@ {current.company}</span>
          </p>
          <p className="mt-0.5 text-xs text-fg-subtle">Since {current.start}</p>
        </motion.div>
      )}

      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-fg-subtle transition-colors hover:text-fg sm:flex"
      >
        <span className="font-mono text-[10px] tracking-[0.25em] uppercase">Scroll</span>
        <ArrowDown size={14} className="animate-[float-slow_2.4s_ease-in-out_infinite]" />
      </a>
    </section>
  )
}
