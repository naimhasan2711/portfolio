import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery'

interface TypedNameProps {
  /** One string per visual line, e.g. ['MD Nakibul', 'Hassan']. */
  lines: string[]
  /** Class for each line (gradient styles). */
  lineClasses: string[]
}

const TYPE_MS = 85 // per character while typing
const ERASE_MS = 40 // per character while erasing
const HOLD_MS = 6500 // full name stays on screen
const GAP_MS = 700 // pause before retyping

/**
 * Types the name out, holds it, erases it and types it again.
 * Each line reserves its full width/height up front, so nothing around it
 * shifts while the letters appear. Screen readers get the full name once
 * (the animated letters are aria-hidden). Reduced motion shows it static.
 */
export function TypedName({ lines, lineClasses }: TypedNameProps) {
  const reduced = usePrefersReducedMotion()
  const total = lines.reduce((n, l) => n + l.length, 0)
  const [count, setCount] = useState(reduced ? total : 0)
  const [phase, setPhase] = useState<'typing' | 'holding' | 'erasing' | 'waiting'>('typing')

  useEffect(() => {
    if (reduced) {
      setCount(total)
      return
    }
    let id: number
    if (phase === 'typing') {
      if (count < total) {
        // slight human jitter; a beat longer at the line break
        const atBreak = count === (lines[0]?.length ?? 0)
        id = window.setTimeout(() => setCount((c) => c + 1), TYPE_MS + Math.random() * 60 + (atBreak ? 220 : 0))
      } else id = window.setTimeout(() => setPhase('holding'), 0)
    } else if (phase === 'holding') {
      id = window.setTimeout(() => setPhase('erasing'), HOLD_MS)
    } else if (phase === 'erasing') {
      if (count > 0) id = window.setTimeout(() => setCount((c) => c - 1), ERASE_MS)
      else id = window.setTimeout(() => setPhase('waiting'), 0)
    } else {
      id = window.setTimeout(() => setPhase('typing'), GAP_MS)
    }
    return () => window.clearTimeout(id)
  }, [count, phase, reduced, total, lines])

  let remaining = count
  // the caret sits on the line currently being typed
  let caretLine = lines.length - 1
  {
    let r = count
    for (let i = 0; i < lines.length; i++) {
      const len = lines[i]?.length ?? 0
      if (r <= len) {
        caretLine = i
        break
      }
      r -= len
    }
  }

  return (
    <>
      <span className="sr-only">{lines.join(' ')}</span>
      {lines.map((line, i) => {
        const shown = line.slice(0, Math.max(0, Math.min(line.length, remaining)))
        remaining -= line.length
        const showCaret = !reduced && i === caretLine
        return (
          <span key={i} aria-hidden="true" className="relative block">
            {/* invisible full text reserves the space */}
            <span className={`invisible ${lineClasses[i] ?? ''}`}>{line}</span>
            <span className="absolute inset-0 whitespace-nowrap">
              <span className={lineClasses[i] ?? ''}>{shown}</span>
              {showCaret && (
                <span
                  className={`ml-1 inline-block w-[0.06em] translate-y-[0.08em] bg-accent align-baseline ${
                    phase === 'holding' || phase === 'waiting' ? 'animate-[caret-blink_1.05s_steps(1)_infinite]' : ''
                  }`}
                  style={{ height: '0.82em' }}
                />
              )}
            </span>
          </span>
        )
      })}
    </>
  )
}
