import type { JSX } from 'react'
import type { ProjectMotif } from '../../data/types'

/**
 * Abstract, code-generated artwork for each project (no screenshots are used).
 * Layers marked `data-depth` drift on hover for a subtle parallax.
 */
export function ProjectArt({ motif, className = '' }: { motif: ProjectMotif; className?: string }) {
  return (
    <svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={`block h-full w-full ${className}`}>
      <defs>
        <linearGradient id={`pa-${motif}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--accent)" />
          <stop offset="1" stopColor="var(--cool)" />
        </linearGradient>
        <radialGradient id={`pa-${motif}-r`} cx="0.7" cy="0.3" r="0.8">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <pattern id={`pa-${motif}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="var(--line)" strokeOpacity="0.05" />
        </pattern>
      </defs>
      <rect width="400" height="240" fill="var(--bg-2)" />
      <rect width="400" height="240" fill={`url(#pa-${motif}-grid)`} />
      <rect width="400" height="240" fill={`url(#pa-${motif}-r)`} />
      <g className="transition-transform duration-700 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-x-[-6px] group-hover:translate-y-[-4px]">
        {art[motif](`url(#pa-${motif}-g)`)}
      </g>
    </svg>
  )
}

const art: Record<ProjectMotif, (grad: string) => JSX.Element> = {
  commerce: (g) => (
    <>
      {[0, 1, 2].map((c) =>
        [0, 1].map((r) => (
          <g key={`${c}${r}`} transform={`translate(${70 + c * 72} ${48 + r * 78})`}>
            <rect width="60" height="66" rx="8" fill="var(--line)" fillOpacity={c === 1 && r === 0 ? 0.1 : 0.04} stroke="var(--line)" strokeOpacity="0.1" />
            <rect x="8" y="8" width="44" height="30" rx="4" fill={c === 1 && r === 0 ? g : 'var(--line)'} fillOpacity={c === 1 && r === 0 ? 0.8 : 0.07} />
            <rect x="8" y="46" width="30" height="4" rx="2" fill="var(--line)" fillOpacity="0.25" />
            <rect x="8" y="54" width="18" height="4" rx="2" fill="var(--accent)" fillOpacity="0.6" />
          </g>
        )),
      )}
      <circle cx="318" cy="120" r="26" fill="none" stroke={g} strokeWidth="1.5" />
      <path d="M306 112h4l5 14h14l4-10h-20" fill="none" stroke="var(--line)" strokeOpacity="0.8" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M286 120 C 270 120, 262 90, 250 82" fill="none" stroke="var(--accent)" strokeOpacity="0.5" strokeDasharray="3 4" />
    </>
  ),
  meter: (g) => (
    <>
      <path d="M40 200 Q 120 150 200 175 T 360 140" fill="none" stroke="var(--cool)" strokeOpacity="0.25" />
      <path d="M40 220 Q 140 170 220 195 T 380 160" fill="none" stroke="var(--cool)" strokeOpacity="0.15" />
      <g transform="translate(150 118)">
        <circle r="62" fill="none" stroke="var(--line)" strokeOpacity="0.08" strokeWidth="10" />
        <circle r="62" fill="none" stroke={g} strokeWidth="10" strokeLinecap="round" strokeDasharray="260 400" transform="rotate(140)" />
        <circle r="44" fill="none" stroke="var(--line)" strokeOpacity="0.06" />
        <text y="8" textAnchor="middle" fill="var(--line)" fillOpacity="0.85" fontFamily="JetBrains Mono, monospace" fontSize="20">0482</text>
        <text y="26" textAnchor="middle" fill="var(--accent)" fillOpacity="0.8" fontFamily="JetBrains Mono, monospace" fontSize="8">kWh · synced</text>
      </g>
      <g transform="translate(290 70)">
        <path d="M0 0c-14 0-24 10-24 23 0 17 24 41 24 41s24-24 24-41C24 10 14 0 0 0Z" fill="var(--accent)" fillOpacity="0.14" stroke="var(--accent)" strokeOpacity="0.7" />
        <circle cy="22" r="7" fill="var(--accent)" />
        <circle cy="70" r="14" fill="none" stroke="var(--accent)" strokeOpacity="0.3" />
      </g>
      <rect x="250" y="160" width="100" height="30" rx="8" fill="var(--line)" fillOpacity="0.05" stroke="var(--line)" strokeOpacity="0.08" />
      <circle cx="266" cy="175" r="4" fill="var(--accent)" />
      <rect x="278" y="172" width="56" height="6" rx="3" fill="var(--line)" fillOpacity="0.2" />
    </>
  ),
  business: (g) => (
    <>
      {[0, 1, 2].map((c) => (
        <g key={c} transform={`translate(${44 + c * 82} 36)`}>
          <rect width="70" height="10" rx="5" fill="var(--line)" fillOpacity="0.12" />
          {Array.from({ length: 3 - (c === 2 ? 1 : 0) }).map((_, i) => (
            <rect key={i} y={20 + i * 44} width="70" height="36" rx="7" fill={c === 1 && i === 0 ? g : 'var(--line)'} fillOpacity={c === 1 && i === 0 ? 0.55 : 0.05} stroke="var(--line)" strokeOpacity="0.08" />
          ))}
        </g>
      ))}
      <g transform="translate(300 60)">
        {[46, 70, 58, 96, 120].map((h, i) => (
          <rect key={i} x={i * 14} y={130 - h} width="9" height={h} rx="2" fill={i === 4 ? 'var(--accent)' : 'var(--line)'} fillOpacity={i === 4 ? 0.85 : 0.12} />
        ))}
      </g>
    </>
  ),
  map: (g) => (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M${-20 + i * 6} ${60 + i * 34} C 90 ${20 + i * 34}, 180 ${110 + i * 30}, 260 ${60 + i * 32} S 380 ${40 + i * 34}, 430 ${70 + i * 30}`}
          fill="none"
          stroke="var(--cool)"
          strokeOpacity={0.08 + i * 0.02}
        />
      ))}
      <path d="M70 190 C 120 160, 140 120, 200 120 S 290 80, 330 58" fill="none" stroke={g} strokeWidth="2" strokeDasharray="6 6" />
      {[
        [70, 190, 5],
        [200, 120, 7],
        [330, 58, 9],
      ].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={(r ?? 5) * 2.6} fill="var(--accent)" fillOpacity="0.08" />
          <circle cx={x} cy={y} r={r} fill={i === 2 ? 'var(--accent)' : 'var(--bg-2)'} stroke="var(--accent)" strokeWidth="1.5" />
        </g>
      ))}
      <g transform="translate(250 150)">
        <rect width="110" height="52" rx="10" fill="var(--line)" fillOpacity="0.05" stroke="var(--line)" strokeOpacity="0.1" />
        <rect x="12" y="12" width="28" height="28" rx="6" fill={g} fillOpacity="0.7" />
        <rect x="50" y="16" width="48" height="6" rx="3" fill="var(--line)" fillOpacity="0.3" />
        <rect x="50" y="30" width="32" height="5" rx="2.5" fill="var(--line)" fillOpacity="0.15" />
      </g>
    </>
  ),
  health: (g) => (
    <>
      <g transform="translate(110 120)">
        {[70, 52, 34].map((r, i) => (
          <circle key={r} r={r} fill="none" stroke="var(--accent)" strokeOpacity={0.08 + i * 0.08} />
        ))}
        <circle r="16" fill={g} fillOpacity="0.85" />
      </g>
      <path
        d="M170 120 H215 L225 92 L238 150 L250 70 L262 140 L272 120 H380"
        fill="none"
        stroke={g}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <path d="M170 120 H380" stroke="var(--line)" strokeOpacity="0.06" />
      <g transform="translate(280 170)">
        <rect width="90" height="34" rx="8" fill="var(--line)" fillOpacity="0.05" stroke="var(--line)" strokeOpacity="0.08" />
        <text x="12" y="22" fill="var(--line)" fillOpacity="0.7" fontFamily="JetBrains Mono, monospace" fontSize="11">IoT → app</text>
      </g>
    </>
  ),
  voucher: (g) => (
    <>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${60 + i * 26} ${50 + i * 34}) rotate(${-6 + i * 4})`}>
          <path
            d="M0 10a10 10 0 0 1 10-10h170a10 10 0 0 1 10 10v20a10 10 0 0 0 0 20v20a10 10 0 0 1-10 10H10A10 10 0 0 1 0 70V50a10 10 0 0 0 0-20Z"
            fill={i === 2 ? g : 'var(--line)'}
            fillOpacity={i === 2 ? 0.2 : 0.04}
            stroke={i === 2 ? 'var(--accent)' : 'var(--line)'}
            strokeOpacity={i === 2 ? 0.6 : 0.1}
          />
          <path d="M130 8V72" stroke="var(--line)" strokeOpacity="0.2" strokeDasharray="3 4" />
          <rect x="18" y="22" width="70" height="8" rx="4" fill="var(--line)" fillOpacity="0.3" />
          <rect x="18" y="40" width="44" height="6" rx="3" fill="var(--line)" fillOpacity="0.14" />
          <text x="142" y="46" fill="var(--line)" fillOpacity="0.75" fontFamily="JetBrains Mono, monospace" fontSize="13">%</text>
        </g>
      ))}
      <g transform="translate(320 60)" stroke="var(--line)" strokeOpacity="0.25">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(0 ${i * 30})`}>
            <line x1="0" x2="50" />
            <circle cx={[14, 36, 22][i]} r="5" fill="var(--bg-2)" stroke="var(--accent)" strokeOpacity="0.8" />
          </g>
        ))}
      </g>
    </>
  ),
}
