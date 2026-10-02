/**
 * Lightweight SVG "communication network" behind the contact card:
 * a handful of nodes with data packets flowing along the links (CSS only).
 */
const nodes: [number, number][] = [
  [620, 80], [760, 150], [900, 70], [700, 300], [860, 290], [1000, 200], [560, 220], [960, 380], [780, 430],
]
const links: [number, number][] = [
  [0, 1], [1, 2], [1, 3], [3, 4], [4, 5], [2, 5], [0, 6], [6, 3], [4, 7], [3, 8], [8, 7], [1, 4],
]

export function SignalNetwork() {
  return (
    <svg viewBox="0 0 1100 480" preserveAspectRatio="xMaxYMid slice" aria-hidden="true" className="absolute inset-0 h-full w-full">
      <defs>
        <radialGradient id="sn-glow" cx="0.72" cy="0.45" r="0.5">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.14" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1100" height="480" fill="url(#sn-glow)" />
      {links.map(([a, b], i) => {
        const p = nodes[a]!
        const q = nodes[b]!
        return (
          <g key={i}>
            <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke="var(--cool)" strokeOpacity="0.12" />
            <line
              x1={p[0]}
              y1={p[1]}
              x2={q[0]}
              y2={q[1]}
              stroke="var(--accent)"
              strokeOpacity="0.7"
              strokeWidth="1.5"
              strokeDasharray="4 36"
              style={{ animation: `flow ${2.2 + (i % 4) * 0.6}s linear infinite`, animationDelay: `${i * 0.3}s` }}
            />
          </g>
        )
      })}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="14" fill="var(--accent)" fillOpacity="0.05" />
          <circle cx={x} cy={y} r={i === 3 ? 6 : 3.5} fill={i === 3 ? 'var(--accent)' : 'var(--bg-2)'} stroke="var(--accent)" strokeOpacity="0.8" />
        </g>
      ))}
    </svg>
  )
}
