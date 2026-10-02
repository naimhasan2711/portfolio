import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { androidLanguages, androidLayers } from '../../data/android'
import { sections } from '../../data/site'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { Reveal } from '../common/Reveal'
import { Section } from '../common/Section'

const AUTOPLAY_MS = 4200

export function AndroidSection() {
  const [index, setIndex] = useState(0)
  const [interacted, setInteracted] = useState(false)
  const [inView, setInView] = useState(false)
  const reduced = usePrefersReducedMotion()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const rootRef = useRef<HTMLDivElement>(null)
  const layer = androidLayers[index] ?? androidLayers[0]!

  // Only autoplay while visible, and stop for good once the visitor picks a layer.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setInView(e?.isIntersecting ?? false), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (interacted || reduced || !inView) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % androidLayers.length), AUTOPLAY_MS)
    return () => window.clearInterval(id)
  }, [interacted, reduced, inView])

  const select = (i: number, focus = false) => {
    setInteracted(true)
    setIndex(i)
    if (focus) tabRefs.current[i]?.focus()
  }

  const onKeyDown = (e: KeyboardEvent) => {
    const n = androidLayers.length
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') select((index + 1) % n, true)
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') select((index - 1 + n) % n, true)
    else if (e.key === 'Home') select(0, true)
    else if (e.key === 'End') select(n - 1, true)
    else return
    e.preventDefault()
  }

  return (
    <Section id="android" eyebrow={sections.android.eyebrow} title={sections.android.title} intro={sections.android.intro}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 h-[600px] bg-[radial-gradient(50%_50%_at_60%_50%,rgb(196_122_85/0.07),transparent_70%)]" />

      <div ref={rootRef} className="grid items-center gap-12 lg:grid-cols-[1fr_auto_0.9fr] lg:gap-10">
        {/* Layer selector */}
        <Reveal>
          <div role="tablist" aria-orientation="vertical" aria-label="Android stack layers" onKeyDown={onKeyDown} className="flex flex-col gap-1.5">
            {androidLayers.map((l, i) => {
              const selected = i === index
              return (
                <button
                  key={l.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  role="tab"
                  id={`tab-${l.id}`}
                  aria-selected={selected}
                  aria-controls="android-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => select(i)}
                  className={`group relative flex items-center gap-4 rounded-xl px-4 py-3 text-left transition-colors duration-300 ${
                    selected ? 'bg-line/[0.05] text-fg' : 'text-fg-muted hover:bg-line/[0.025] hover:text-fg'
                  }`}
                >
                  <span className={`font-mono text-[11px] ${selected ? 'text-accent' : 'text-fg-subtle'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium sm:text-base">{l.title}</span>
                  {selected && (
                    <motion.span
                      layoutId="android-tab"
                      className="absolute inset-y-2 left-0 w-[2px] rounded-full bg-accent shadow-[0_0_12px_var(--accent)]"
                    />
                  )}
                  {selected && !interacted && !reduced && (
                    <span className="absolute right-4 h-[2px] w-10 overflow-hidden rounded-full bg-line/10" aria-hidden="true">
                      <motion.span
                        key={index}
                        className="block h-full bg-accent/70"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
                      />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Reveal>

        {/* CSS phone */}
        <Reveal delay={0.1} className="mx-auto">
          <div className="relative">
            {/* orbit decoration */}
            <div aria-hidden="true" className="absolute top-1/2 left-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-line/[0.05] max-sm:size-[360px]" />
            <div aria-hidden="true" className="absolute top-1/2 left-1/2 size-[340px] -translate-x-1/2 -translate-y-1/2 animate-[spin-slow_40s_linear_infinite] rounded-full border border-dashed border-accent/15 max-sm:size-[300px]" />
            {androidLanguages.map((lang, i) => (
              <span
                key={lang}
                aria-hidden="true"
                className={`glass absolute z-20 rounded-full px-3 py-1.5 font-mono text-xs text-fg ${
                  i === 0 ? '-top-3 -left-10 max-sm:-left-4' : 'top-1/2 -right-14 max-sm:-right-6'
                } animate-[float-slow_5s_ease-in-out_infinite]`}
                style={{ animationDelay: `${i * 1.3}s` }}
              >
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-accent align-middle" />
                {lang}
              </span>
            ))}

            <div className="relative z-10 h-[520px] w-[258px] rounded-[44px] border border-line/15 bg-gradient-to-b from-ink-700 to-ink-850 p-[9px] shadow-[0_40px_120px_-20px_rgb(196_122_85/0.25),inset_0_0_0_1px_color-mix(in_oklab,var(--line)_4%,transparent)] max-sm:h-[480px] max-sm:w-[238px]">
              {/* side buttons */}
              <span aria-hidden="true" className="absolute top-28 -right-[3px] h-14 w-[3px] rounded-r bg-ink-600" />
              <span aria-hidden="true" className="absolute top-48 -right-[3px] h-9 w-[3px] rounded-r bg-ink-600" />

              <div className="relative flex h-full flex-col overflow-hidden rounded-[36px] bg-ink-950">
                <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-30" />
                {/* status bar */}
                <div className="relative flex items-center justify-between px-6 pt-4 pb-2 font-mono text-[10px] text-fg-subtle">
                  <span>{androidLanguages.join(' · ')}</span>
                  <span aria-hidden="true" className="absolute top-3.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-ink-800" />
                  <span aria-hidden="true" className="flex items-center gap-1">
                    <span className="h-2 w-3 rounded-[2px] border border-fg-subtle/70" />
                  </span>
                </div>

                {/* app bar */}
                <div className="relative px-5 pt-3">
                  <p className="font-mono text-[10px] tracking-[0.2em] text-accent uppercase">Layer {index + 1} / {androidLayers.length}</p>
                </div>

                <div id="android-panel" role="tabpanel" aria-labelledby={`tab-${layer.id}`} aria-live="polite" className="relative flex-1 px-5 pt-2">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={layer.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <h3 className="text-xl font-semibold tracking-tight text-fg">{layer.title}</h3>
                      <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{layer.caption}</p>
                      <ul className="mt-5 flex flex-col gap-2">
                        {layer.tools.map((t, i) => (
                          <motion.li
                            key={t}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.06 * i + 0.1 }}
                            className="flex items-center gap-3 rounded-xl border border-line/[0.07] bg-line/[0.03] px-3 py-2.5"
                          >
                            <span aria-hidden="true" className="grid size-6 place-items-center rounded-md bg-accent/12 font-mono text-[10px] text-accent">
                              {t.slice(0, 1)}
                            </span>
                            <span className="text-[13px] text-fg">{t}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* nav bar handle */}
                <div aria-hidden="true" className="relative flex justify-center pt-2 pb-3">
                  <span className="h-1 w-24 rounded-full bg-line/25" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Stack diagram */}
        <Reveal delay={0.15} className="hidden lg:block">
          <div aria-hidden="true" className="flex flex-col gap-2 [perspective:900px]">
            {androidLayers.map((l, i) => {
              const selected = i === index
              return (
                <motion.div
                  key={l.id}
                  style={{ rotateY: -7 }}
                  animate={{ x: selected ? -14 : 0, opacity: selected ? 1 : 0.55 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                  className={`rounded-xl border px-4 py-3 ${
                    selected ? 'border-accent/40 bg-accent/[0.07]' : 'border-line/[0.06] bg-line/[0.02]'
                  }`}
                >
                  <p className={`text-xs font-medium ${selected ? 'text-accent-soft' : 'text-fg-muted'}`}>{l.title}</p>
                  <p className="mt-1 truncate font-mono text-[10px] text-fg-subtle">{l.tools.join(' · ')}</p>
                </motion.div>
              )
            })}
          </div>
        </Reveal>
      </div>
    </Section>
  )
}
