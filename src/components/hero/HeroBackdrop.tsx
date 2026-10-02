/**
 * Layers that always sit behind the hero: gradient wash + engineering grid.
 * With `illustrated`, also draws a static SVG version of the 3D scene —
 * used when WebGL is unavailable.
 */
export function HeroBackdrop({ illustrated = false }: { illustrated?: boolean }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 50% at 75% 45%, rgb(196 122 85 / 0.10) 0%, transparent 70%), radial-gradient(45% 40% at 15% 20%, rgb(217 154 120 / 0.07) 0%, transparent 70%), linear-gradient(180deg, var(--bg) 0%, var(--bg-2) 60%, var(--bg) 100%)',
        }}
      />
      <div className="bg-grid mask-fade absolute inset-0 opacity-70" />

      {illustrated && (
        <svg
          viewBox="0 0 600 600"
          className="absolute top-1/2 right-[-10%] h-[min(90vh,720px)] -translate-y-1/2 opacity-80 max-lg:right-1/2 max-lg:translate-x-1/2 max-lg:opacity-40"
        >
          <defs>
            <linearGradient id="fb-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="var(--accent)" stopOpacity="0.5" />
              <stop offset="1" stopColor="var(--cool)" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <g fill="none" stroke="url(#fb-g)" strokeWidth="1">
            <ellipse cx="300" cy="300" rx="230" ry="70" transform="rotate(-18 300 300)" />
            <ellipse cx="300" cy="300" rx="260" ry="90" transform="rotate(24 300 300)" opacity="0.6" />
          </g>
          <rect x="235" y="170" width="130" height="260" rx="22" fill="var(--card)" stroke="var(--accent)" strokeOpacity="0.35" />
          <rect x="245" y="182" width="110" height="236" rx="14" fill="var(--bg)" />
          <rect x="253" y="222" width="94" height="58" rx="6" fill="var(--accent)" fillOpacity="0.4" />
          <rect x="253" y="288" width="44" height="40" rx="5" fill="var(--line)" fillOpacity="0.14" />
          <rect x="303" y="288" width="44" height="40" rx="5" fill="var(--line)" fillOpacity="0.14" />
          <rect x="253" y="336" width="94" height="12" rx="3" fill="var(--line)" fillOpacity="0.1" />
          <rect x="253" y="354" width="94" height="12" rx="3" fill="var(--line)" fillOpacity="0.08" />
          {[
            [120, 160], [480, 140], [520, 330], [90, 380], [170, 500], [450, 480], [300, 70], [300, 540],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="var(--accent)" fillOpacity="0.8" />
          ))}
          <g stroke="var(--cool)" strokeOpacity="0.15">
            <path d="M120 160 L300 70 L480 140 L520 330 L450 480 L300 540 L170 500 L90 380 Z" fill="none" />
          </g>
        </svg>
      )}

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-ink-950" />
    </div>
  )
}
