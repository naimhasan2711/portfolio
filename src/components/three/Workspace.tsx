import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { usePalette } from './palette'

/**
 * "Engineer at work" scene: a developer at a walnut desk with a monitor,
 * an open laptop, a keyboard and a steaming coffee, seated in a leather
 * office chair. Built entirely from primitives — no model files to download.
 *
 * Layout (local units): monitor on the left facing +x, the developer on the
 * right facing −x; the group is turned so the camera sees a 3/4 view.
 */

type V3 = [number, number, number]

const UP = new THREE.Vector3(0, 1, 0)

/* ── Small helpers ───────────────────────────────────────────── */

/** Soft radial sprite drawn once on a canvas (glows, shadows, steam). */
export function useRadialTexture(stops: [number, string][]) {
  const [texture] = useMemo(() => {
    const cv = document.createElement('canvas')
    cv.width = cv.height = 128
    const ctx = cv.getContext('2d')
    if (ctx) {
      const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
      stops.forEach(([o, col]) => g.addColorStop(o, col))
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 128, 128)
    }
    return [new THREE.CanvasTexture(cv)]
  }, [stops])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

const HALO_STOPS: [number, string][] = [
  [0, 'rgba(255,255,255,0.8)'],
  [0.5, 'rgba(255,255,255,0.18)'],
  [1, 'rgba(255,255,255,0)'],
]
const SHADOW_STOPS: [number, string][] = [
  [0, 'rgba(255,255,255,1)'],
  [0.6, 'rgba(255,255,255,0.35)'],
  [1, 'rgba(255,255,255,0)'],
]
export const STEAM_STOPS: [number, string][] = [
  [0, 'rgba(255,255,255,0.9)'],
  [0.45, 'rgba(255,255,255,0.35)'],
  [1, 'rgba(255,255,255,0)'],
]

/** Walnut wood grain, generated on a canvas. */
export function useWoodTexture(base: string, grain: string) {
  const texture = useMemo(() => {
    const cv = document.createElement('canvas')
    cv.width = 512
    cv.height = 256
    const ctx = cv.getContext('2d')
    if (ctx) {
      ctx.fillStyle = base
      ctx.fillRect(0, 0, 512, 256)
      let seed = 3
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
      for (let i = 0; i < 70; i++) {
        const y0 = rand() * 256
        const amp = 2 + rand() * 6
        const freq = 0.006 + rand() * 0.012
        ctx.strokeStyle = grain
        ctx.globalAlpha = 0.12 + rand() * 0.25
        ctx.lineWidth = 0.6 + rand() * 1.8
        ctx.beginPath()
        for (let x = 0; x <= 512; x += 8) {
          const y = y0 + Math.sin(x * freq + i) * amp
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
      ctx.globalAlpha = 1
    }
    const t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.anisotropy = 4
    return t
  }, [base, grain])
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape()
  s.moveTo(-w / 2 + r, -h / 2)
  s.lineTo(w / 2 - r, -h / 2)
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r)
  s.lineTo(w / 2, h / 2 - r)
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2)
  s.lineTo(-w / 2 + r, h / 2)
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r)
  s.lineTo(-w / 2, -h / 2 + r)
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2)
  return s
}

/** Flat rounded rectangle (screens, cards). */
export function useRoundedRect(w: number, h: number, r: number) {
  const geo = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(w, h, r), 6), [w, h, r])
  useEffect(() => () => geo.dispose(), [geo])
  return geo
}

/** Rounded, bevelled slab (desk top, cushions). Built in XY, extruded along Z, centred. */
export function useRoundedSlab(w: number, h: number, r: number, depth: number, bevel: number) {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(roundedRectShape(w - bevel * 2, h - bevel * 2, Math.max(0.001, r - bevel)), {
      depth,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 4,
      curveSegments: 10,
    })
    g.center()
    return g
  }, [w, h, r, depth, bevel])
  useEffect(() => () => geo.dispose(), [geo])
  return geo
}

/** Position + rotation that span a segment between two points. */
export function useSegment(from: V3, to: V3) {
  const [fx, fy, fz] = from
  const [tx, ty, tz] = to
  return useMemo(() => {
    const a = new THREE.Vector3(fx, fy, fz)
    const b = new THREE.Vector3(tx, ty, tz)
    const dir = b.clone().sub(a)
    return {
      position: a.clone().add(b).multiplyScalar(0.5),
      quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir.clone().normalize()),
      length: dir.length(),
    }
  }, [fx, fy, fz, tx, ty, tz])
}

/** A capsule stretched between two points (arms, legs). */
function Limb({ from, to, radius, color }: { from: V3; to: V3; radius: number; color: string }) {
  const { position, quaternion, length } = useSegment(from, to)
  return (
    <mesh position={position} quaternion={quaternion}>
      <capsuleGeometry args={[radius, Math.max(0.001, length - radius * 2), 6, 14]} />
      <meshStandardMaterial color={color} roughness={0.85} />
    </mesh>
  )
}

/** A tapered rod between two points (legs, frames). */
export function Rod({
  from,
  to,
  radius,
  radiusEnd,
  color,
  metalness = 0.85,
  roughness = 0.25,
}: {
  from: V3
  to: V3
  radius: number
  radiusEnd?: number
  color: string
  metalness?: number
  roughness?: number
}) {
  const { position, quaternion, length } = useSegment(from, to)
  return (
    <mesh position={position} quaternion={quaternion}>
      {/* cylinder's +y end is `to`, so radiusTop belongs to `to` */}
      <cylinderGeometry args={[radiusEnd ?? radius, radius, length, 14]} />
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  )
}

/* ── Monitor ──────────────────────────────────────────────────── */

/* Code lines on the monitor: [indent, width, accent?] */
const CODE: [number, number, boolean][] = [
  [0, 0.34, true],
  [0.07, 0.56, false],
  [0.14, 0.32, false],
  [0.14, 0.44, true],
  [0.07, 0.2, false],
  [0, 0.1, false],
  [0, 0.4, true],
  [0.07, 0.58, false],
]

function Monitor() {
  const c = usePalette()
  const typing = useRef<THREE.Mesh>(null)
  const cursor = useRef<THREE.Mesh>(null)
  const W = 1.08
  const H = 0.62
  const frame = useRoundedRect(W + 0.04, H + 0.04, 0.03)
  const screen = useRoundedRect(W, H, 0.022)
  const halo = useRadialTexture(HALO_STOPS)
  const gap = 0.06
  const top = H / 2 - 0.1
  const lastY = top - CODE.length * gap
  const typeW = 0.5

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const p = (t * 0.28) % 1
    if (typing.current) {
      typing.current.scale.x = Math.max(0.001, p)
      typing.current.position.x = -W / 2 + 0.1 + (typeW * p) / 2
    }
    if (cursor.current) {
      cursor.current.position.x = -W / 2 + 0.1 + typeW * p + 0.018
      cursor.current.visible = Math.floor(t * 2.2) % 2 === 0
    }
  })

  return (
    <group position={[-0.34, 0.66, -0.12]} rotation={[0, -0.5, 0]}>
      <mesh position={[-0.06, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.2, 1.5]} />
        <meshBasicMaterial map={halo} color={c.accent} transparent opacity={0.2} depthWrite={false} />
      </mesh>

      <mesh position={[-0.012, 0, 0]}>
        <boxGeometry args={[0.02, H + 0.03, W + 0.03]} />
        <meshStandardMaterial color={c.body} metalness={0.85} roughness={0.25} />
      </mesh>

      <group position={[0.001, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <mesh geometry={frame}>
          <meshStandardMaterial color={c.body} metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh geometry={screen} position={[0, 0, 0.001]}>
          <meshBasicMaterial color={c.screen} />
        </mesh>
        <mesh position={[-W / 2 + 0.065, -0.02, 0.002]}>
          <planeGeometry args={[0.003, H - 0.16]} />
          <meshBasicMaterial color={c.code} transparent opacity={0.18} />
        </mesh>
        {CODE.map(([indent, w, accent], i) => (
          <mesh key={i} position={[-W / 2 + 0.1 + indent + w / 2, top - i * gap, 0.002]}>
            <planeGeometry args={[w, 0.021]} />
            <meshBasicMaterial color={accent ? c.accent : c.code} transparent opacity={accent ? 0.85 : 0.35} />
          </mesh>
        ))}
        <mesh ref={typing} position={[-W / 2 + 0.1, lastY, 0.002]}>
          <planeGeometry args={[typeW, 0.021]} />
          <meshBasicMaterial color={c.accent2} transparent opacity={0.8} />
        </mesh>
        <mesh ref={cursor} position={[-W / 2 + 0.11, lastY, 0.003]}>
          <planeGeometry args={[0.008, 0.04]} />
          <meshBasicMaterial color={c.block} />
        </mesh>
      </group>

      <pointLight position={[0.45, 0, 0]} intensity={1.3} distance={1.9} color={c.accent2} />

      <Rod from={[-0.03, -0.58, 0]} to={[-0.03, -0.3, 0]} radius={0.016} color={c.chrome} />
      <mesh position={[-0.01, -0.62, 0]} scale={[1, 0.1, 1.5]}>
        <cylinderGeometry args={[0.12, 0.13, 0.12, 40]} />
        <meshStandardMaterial color={c.chrome} metalness={0.9} roughness={0.22} />
      </mesh>
    </group>
  )
}

/* ── Laptop ───────────────────────────────────────────────────── */

function Laptop() {
  const c = usePalette()
  const base = useRoundedSlab(0.3, 0.42, 0.02, 0.008, 0.003)
  const lid = useRoundedSlab(0.28, 0.42, 0.02, 0.006, 0.002)
  const display = useRoundedRect(0.24, 0.38, 0.012)
  const W = 0.24
  const H = 0.38
  return (
    // sits right of the monitor, turned toward the developer
    <group position={[0.02, 0.026, 0.56]} rotation={[0, -0.25, 0]}>
      {/* base (laid flat) */}
      <mesh geometry={base} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={c.chrome} metalness={0.9} roughness={0.3} />
      </mesh>
      {/* keyboard well */}
      <mesh position={[0.03, 0.0076, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.13, 0.36]} />
        <meshStandardMaterial color={c.body} roughness={0.6} />
      </mesh>
      {/* lid, hinged at the back edge and tilted open */}
      <group position={[-0.15, 0.004, 0]} rotation={[0, 0, -0.32]}>
        <group position={[0, 0.14, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh geometry={lid} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color={c.chrome} metalness={0.9} roughness={0.3} />
          </mesh>
          <mesh geometry={display} position={[0, 0, 0.0062]} rotation={[0, 0, Math.PI / 2]}>
            <meshBasicMaterial color={c.screen} />
          </mesh>
          {/* simple app UI on the laptop screen (landscape: H wide, W tall) */}
          <group position={[0, 0, 0.0068]}>
            <mesh position={[0, W / 2 - 0.03, 0]}>
              <planeGeometry args={[H - 0.05, 0.02]} />
              <meshBasicMaterial color={c.accent} transparent opacity={0.85} />
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[-H / 2 + 0.07 + i * 0.12, -0.01, 0]}>
                <planeGeometry args={[0.1, 0.1]} />
                <meshBasicMaterial color={i === 1 ? c.accent2 : c.code} transparent opacity={i === 1 ? 0.55 : 0.25} />
              </mesh>
            ))}
            <mesh position={[0, -W / 2 + 0.035, 0]}>
              <planeGeometry args={[H - 0.05, 0.015]} />
              <meshBasicMaterial color={c.code} transparent opacity={0.3} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}

/* ── Keyboard ─────────────────────────────────────────────────── */

const KEY_ROWS = 4
const KEY_COLS = 13

function Keyboard() {
  const c = usePalette()
  const keys = useRef<THREE.InstancedMesh>(null)
  const plate = useRoundedSlab(0.17, 0.56, 0.018, 0.008, 0.003)

  useEffect(() => {
    const m = keys.current
    if (!m) return
    const o = new THREE.Object3D()
    let i = 0
    for (let r = 0; r < KEY_ROWS; r++) {
      for (let k = 0; k < KEY_COLS; k++) {
        o.position.set(-0.054 + r * 0.036, 0.008, -0.235 + k * 0.039)
        // last row: one long space bar in the middle
        const isSpace = r === KEY_ROWS - 1 && k >= 4 && k <= 8
        o.scale.set(1, 1, isSpace ? (k === 6 ? 5.3 : 0.0001) : 1)
        o.updateMatrix()
        m.setMatrixAt(i++, o.matrix)
      }
    }
    m.instanceMatrix.needsUpdate = true
  }, [])

  return (
    <group position={[0.2, 0.024, -0.02]}>
      <mesh geometry={plate} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={c.chrome} metalness={0.85} roughness={0.3} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, KEY_ROWS * KEY_COLS]}>
        <boxGeometry args={[0.029, 0.006, 0.032]} />
        <meshStandardMaterial color={c.keys} roughness={0.55} />
      </instancedMesh>
    </group>
  )
}

/* ── Coffee mug with rising steam ─────────────────────────────── */

function Mug() {
  const c = usePalette()
  const steamTex = useRadialTexture(STEAM_STOPS)
  const puffs = useRef<(THREE.Sprite | null)[]>([])
  const COUNT = 5

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    puffs.current.forEach((s, i) => {
      if (!s) return
      const p = (t * 0.32 + i / COUNT) % 1 // 0 → 1 life cycle
      s.position.set(Math.sin(t * 1.3 + i * 1.7) * 0.025 * p, 0.09 + p * 0.42, Math.cos(t * 1.1 + i) * 0.02 * p)
      const size = 0.05 + p * 0.16
      s.scale.set(size, size * 1.3, 1)
      const mat = s.material as THREE.SpriteMaterial
      mat.opacity = Math.sin(Math.PI * p) * 0.32
    })
  })

  return (
    <group position={[-0.12, 0.018, -0.66]}>
      {/* ceramic cup */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.045, 0.04, 0.115, 32, 1, true]} />
        <meshStandardMaterial color={c.accent} roughness={0.35} metalness={0.15} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.003, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.006, 32]} />
        <meshStandardMaterial color={c.accent} roughness={0.35} />
      </mesh>
      {/* coffee surface */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.042, 32]} />
        <meshStandardMaterial color="#2a170d" roughness={0.2} />
      </mesh>
      {/* handle */}
      <mesh position={[0.05, 0.06, 0]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.025, 0.007, 10, 20, Math.PI]} />
        <meshStandardMaterial color={c.accent} roughness={0.35} />
      </mesh>
      {/* steam */}
      {Array.from({ length: COUNT }).map((_, i) => (
        <sprite
          key={i}
          ref={(s) => {
            puffs.current[i] = s
          }}
        >
          <spriteMaterial map={steamTex} color={c.steam} transparent opacity={0} depthWrite={false} />
        </sprite>
      ))}
    </group>
  )
}

/* ── Desk ─────────────────────────────────────────────────────── */

function Desk() {
  const c = usePalette()
  const wood = useWoodTexture(c.wood, c.woodGrain)
  const topGeo = useRoundedSlab(1.04, 1.78, 0.08, 0.03, 0.012)
  useEffect(() => {
    wood.repeat.set(1.2, 1.2)
  }, [wood])

  // splayed, tapered legs — mid-century style
  const legs: [V3, V3][] = [
    [[-0.36, -0.035, -0.72], [-0.44, -0.88, -0.8]],
    [[0.36, -0.035, -0.72], [0.44, -0.88, -0.8]],
    [[-0.36, -0.035, 0.72], [-0.44, -0.88, 0.8]],
    [[0.36, -0.035, 0.72], [0.44, -0.88, 0.8]],
  ]

  return (
    <group>
      {/* walnut top with rounded, bevelled edges */}
      <mesh geometry={topGeo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshStandardMaterial map={wood} roughness={0.42} metalness={0.05} />
      </mesh>
      {/* recessed apron */}
      <mesh position={[0, -0.045, 0]}>
        <boxGeometry args={[0.8, 0.035, 1.5]} />
        <meshStandardMaterial map={wood} color="#b89a86" roughness={0.55} />
      </mesh>
      {legs.map(([from, to], i) => (
        <group key={i}>
          <Rod from={from} to={to} radius={0.022} radiusEnd={0.011} color={c.wood} metalness={0.05} roughness={0.5} />
          {/* brass foot cap */}
          <Rod
            from={to}
            to={[to[0] + (to[0] - from[0]) * 0.05, to[1] - 0.04, to[2] + (to[2] - from[2]) * 0.05]}
            radius={0.0115}
            radiusEnd={0.011}
            color={c.brass}
          />
        </group>
      ))}

      <Keyboard />
      {/* mouse */}
      <mesh position={[0.22, 0.04, -0.42]} scale={[1.35, 0.55, 0.8]}>
        <sphereGeometry args={[0.04, 24, 16]} />
        <meshStandardMaterial color={c.keys} roughness={0.4} />
      </mesh>
      <Laptop />
      <Mug />
    </group>
  )
}

/* ── Chair ────────────────────────────────────────────────────── */

function Chair() {
  const c = usePalette()
  const seat = useRoundedSlab(0.52, 0.5, 0.12, 0.05, 0.022)
  const back = useRoundedSlab(0.48, 0.62, 0.14, 0.035, 0.016)
  const leather = <meshPhysicalMaterial color={c.leather} roughness={0.5} clearcoat={0.35} clearcoatRoughness={0.4} sheen={0.4} sheenColor={c.accent2} />

  return (
    <group position={[1.04, 0, 0]}>
      {/* seat cushion */}
      <mesh geometry={seat} position={[0, -0.39, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        {leather}
      </mesh>
      {/* gently reclined, slightly curved backrest */}
      <group position={[0.27, -0.02, 0]} rotation={[0, 0, 0.14]}>
        <mesh geometry={back} rotation={[0, Math.PI / 2, 0]}>
          {leather}
        </mesh>
        {/* lumbar seam */}
        <mesh position={[-0.02, -0.12, 0]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[0.42, 0.006, 0.04]} />
          <meshStandardMaterial color={c.accent2} roughness={0.6} />
        </mesh>
      </group>
      {/* spine connecting seat and back */}
      <Rod from={[0.2, -0.42, 0]} to={[0.3, -0.25, 0]} radius={0.016} color={c.chrome} />

      {/* armrests */}
      {[1, -1].map((side) => (
        <group key={side}>
          <Rod from={[0.1, -0.38, 0.25 * side]} to={[0.08, -0.16, 0.27 * side]} radius={0.012} color={c.chrome} />
          <mesh position={[0.02, -0.15, 0.27 * side]}>
            <boxGeometry args={[0.24, 0.022, 0.05]} />
            <meshPhysicalMaterial color={c.leather} roughness={0.5} clearcoat={0.3} />
          </mesh>
        </group>
      ))}

      {/* gas lift + five-star base with casters */}
      <Rod from={[0, -0.84, 0]} to={[0, -0.42, 0]} radius={0.028} radiusEnd={0.02} color={c.chrome} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3
        const end: V3 = [Math.cos(a) * 0.27, -0.85, Math.sin(a) * 0.27]
        return (
          <group key={i}>
            <Rod from={[0, -0.83, 0]} to={end} radius={0.016} radiusEnd={0.011} color={c.chrome} />
            <mesh position={[end[0], -0.88, end[2]]}>
              <sphereGeometry args={[0.022, 14, 10]} />
              <meshStandardMaterial color={c.body} roughness={0.4} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ── Developer ────────────────────────────────────────────────── */

/** Tapered torso made with a lathe profile (smoother than a capsule). */
function Torso({ color }: { color: string }) {
  const geo = useMemo(() => {
    const pts = [
      [0.0, -0.22],
      [0.135, -0.21],
      [0.15, -0.08],
      [0.165, 0.08],
      [0.16, 0.18],
      [0.11, 0.24],
      [0.05, 0.26],
      [0.0, 0.265],
    ].map(([x, y]) => new THREE.Vector2(x, y))
    return new THREE.LatheGeometry(pts, 32)
  }, [])
  useEffect(() => () => geo.dispose(), [geo])
  return (
    <mesh geometry={geo} position={[1.0, 0.0, 0]} rotation={[0, 0, 0.16]} scale={[1, 1, 1.15]}>
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

/* Finger layout across the back of the hand (hand faces −x, fingers point forward/down). */
const FINGERS = [
  { z: -0.021, len: 0.03 }, // little finger
  { z: -0.007, len: 0.036 },
  { z: 0.007, len: 0.039 },
  { z: 0.021, len: 0.035 }, // index finger
]

/**
 * Arm with an articulated hand. The forearm pivots at the elbow so the hand
 * drifts across the keyboard, and each finger taps keys on its own rhythm.
 */
function Arm({ side }: { side: 1 | -1 }) {
  const c = usePalette()
  const shoulder: V3 = [0.99, 0.2, 0.17 * side]
  const elbow: V3 = [0.76, -0.04, 0.21 * side]
  const hand: V3 = [0.32, 0.075, 0.1 * side - 0.02]
  const local: V3 = [hand[0] - elbow[0], hand[1] - elbow[1], hand[2] - elbow[2]]
  const forearm = useRef<THREE.Group>(null)
  const wrist = useRef<THREE.Group>(null)
  const fingers = useRef<(THREE.Group | null)[]>([])
  const thumb = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    // the hand travels over the keys: slow sweep + quick small reaches
    if (forearm.current) {
      forearm.current.rotation.y = Math.sin(t * 0.55 + side * 1.3) * 0.045 + Math.sin(t * 2.3 + side) * 0.012
      forearm.current.rotation.z = Math.sin(t * 1.4 + side * 2) * 0.012
    }
    // wrist lifts slightly between bursts of typing
    if (wrist.current) wrist.current.rotation.z = 0.08 + Math.max(0, Math.sin(t * 0.8 + side)) * 0.08
    fingers.current.forEach((f, i) => {
      if (!f) return
      // each finger has its own tempo; sharp, short key presses
      const rate = 5.5 + ((i * 7 + (side > 0 ? 3 : 5)) % 5) * 0.9
      const phase = i * 2.17 + (side > 0 ? 0 : 1.3)
      const press = Math.pow(Math.max(0, Math.sin(t * rate + phase)), 10)
      f.rotation.z = 0.55 + press * 0.5
    })
    if (thumb.current) {
      // occasional space-bar press
      thumb.current.rotation.x = side * (0.35 + Math.pow(Math.max(0, Math.sin(t * 2.4 + side)), 14) * 0.35)
    }
  })

  return (
    <>
      <Limb from={shoulder} to={elbow} radius={0.05} color={c.shirt} />
      <group position={elbow}>
        <group ref={forearm}>
          <Limb from={[0, 0, 0]} to={[local[0] + 0.02, local[1], local[2]]} radius={0.03} color={c.skin} />
          {/* cuff of the sleeve */}
          <Limb from={[-0.02, 0.005, 0]} to={[-0.07, 0.01, local[2] * 0.12]} radius={0.04} color={c.shirt} />
          <group ref={wrist} position={local}>
            {/* palm, slightly flattened and angled down toward the keys */}
            <mesh position={[-0.012, 0, 0]} scale={[1.15, 0.45, 1]}>
              <sphereGeometry args={[0.032, 18, 12]} />
              <meshStandardMaterial color={c.skin} roughness={0.7} />
            </mesh>
            {FINGERS.map((f, i) => (
              <group
                key={i}
                position={[-0.038, -0.002, f.z * (side > 0 ? 1 : -1)]}
                ref={(g) => {
                  fingers.current[i] = g
                }}
              >
                {/* finger points forward (−x); the group's z-rotation curls it down */}
                <mesh position={[-f.len / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <capsuleGeometry args={[0.0075, f.len - 0.015, 4, 8]} />
                  <meshStandardMaterial color={c.skin} roughness={0.7} />
                </mesh>
              </group>
            ))}
            {/* thumb on the inner side */}
            <group ref={thumb} position={[-0.02, -0.01, -0.03 * side]}>
              <mesh position={[-0.015, -0.004, 0]} rotation={[0, 0.5 * side, Math.PI / 2 + 0.4]}>
                <capsuleGeometry args={[0.008, 0.018, 4, 8]} />
                <meshStandardMaterial color={c.skin} roughness={0.7} />
              </mesh>
            </group>
          </group>
        </group>
      </group>
    </>
  )
}

/** Over-ear headset with a boom mic, sized to the developer's head (head faces −x). */
function Headset() {
  const c = usePalette()
  const shell = <meshStandardMaterial color="#16181b" metalness={0.35} roughness={0.35} />
  return (
    <group position={[0.015, 0.0, 0]}>
      {/* headband arching over the top, ear to ear */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.152, 0.011, 12, 40, Math.PI]} />
        {shell}
      </mesh>
      {/* padded underside of the band */}
      <mesh position={[0, -0.004, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.142, 0.007, 10, 32, Math.PI * 0.7]} />
        <meshStandardMaterial color="#2a2e33" roughness={0.9} />
      </mesh>
      {[1, -1].map((side) => (
        <group key={side} position={[0, -0.005, 0.15 * side]} rotation={[Math.PI / 2, 0, 0]}>
          {/* ear cup */}
          <mesh>
            <cylinderGeometry args={[0.05, 0.05, 0.032, 28]} />
            {shell}
          </mesh>
          {/* cushion */}
          <mesh position={[0, -0.02 * side, 0]}>
            <cylinderGeometry args={[0.046, 0.046, 0.014, 28]} />
            <meshStandardMaterial color="#202327" roughness={0.95} />
          </mesh>
          {/* copper accent ring */}
          <mesh position={[0, 0.0165 * side, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.034, 0.004, 8, 28]} />
            <meshStandardMaterial color={c.accent} metalness={0.7} roughness={0.3} emissive={c.accent} emissiveIntensity={0.25} />
          </mesh>
        </group>
      ))}
      {/* boom mic from the left cup toward the mouth */}
      <Rod from={[0, -0.03, 0.17]} to={[-0.12, -0.1, 0.09]} radius={0.005} color="#16181b" metalness={0.4} roughness={0.4} />
      <mesh position={[-0.125, -0.103, 0.085]}>
        <sphereGeometry args={[0.012, 12, 10]} />
        <meshStandardMaterial color="#16181b" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function Developer() {
  const c = usePalette()
  const head = useRef<THREE.Group>(null)
  const body = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (body.current) body.current.position.y = Math.sin(t * 1.1) * 0.004
    if (head.current) head.current.rotation.z = 0.08 + Math.sin(t * 0.7) * 0.025
  })

  return (
    <group ref={body}>
      {([1, -1] as const).map((side) => (
        <group key={side}>
          <Limb from={[1.0, -0.3, 0.1 * side]} to={[0.56, -0.29, 0.11 * side]} radius={0.068} color={c.pants} />
          <Limb from={[0.56, -0.29, 0.11 * side]} to={[0.54, -0.84, 0.11 * side]} radius={0.055} color={c.pants} />
          <mesh position={[0.49, -0.875, 0.11 * side]} scale={[1.9, 0.6, 1]}>
            <sphereGeometry args={[0.05, 16, 12]} />
            <meshStandardMaterial color={c.hair} roughness={0.5} />
          </mesh>
        </group>
      ))}

      <Torso color={c.shirt} />
      <mesh position={[0.955, 0.3, 0]} rotation={[0, 0, 0.16]}>
        <cylinderGeometry args={[0.045, 0.055, 0.1, 16]} />
        <meshStandardMaterial color={c.skin} roughness={0.75} />
      </mesh>

      <group ref={head} position={[0.93, 0.45, 0]}>
        <mesh scale={[1, 1.08, 0.95]}>
          <sphereGeometry args={[0.125, 32, 24]} />
          <meshStandardMaterial color={c.skin} roughness={0.7} />
        </mesh>
        {/* ears */}
        {[1, -1].map((side) => (
          <mesh key={side} position={[0.02, 0, 0.118 * side]} scale={[0.6, 1, 0.35]}>
            <sphereGeometry args={[0.03, 12, 10]} />
            <meshStandardMaterial color={c.skin} roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0.02, 0.035, 0]} rotation={[0, 0, -0.5]} scale={[1.02, 1, 0.98]}>
          <sphereGeometry args={[0.133, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2.05]} />
          <meshStandardMaterial color={c.hair} roughness={0.8} />
        </mesh>
        <mesh position={[-0.045, -0.06, 0]} scale={[0.72, 0.62, 0.92]}>
          <sphereGeometry args={[0.115, 24, 16, 0, Math.PI * 2, Math.PI / 2.4, Math.PI / 1.7]} />
          <meshStandardMaterial color={c.hair} roughness={0.95} />
        </mesh>
        <Headset />
      </group>

      <Arm side={1} />
      <Arm side={-1} />
    </group>
  )
}

/* ── Floating code cards ──────────────────────────────────────── */

function CodeCards() {
  const c = usePalette()
  const refs = useRef<(THREE.Group | null)[]>([])
  const big = useRoundedRect(0.62, 0.38, 0.04)
  const small = useRoundedRect(0.44, 0.26, 0.035)
  const cards = useMemo(
    () => [
      { w: 0.62, h: 0.38, pos: [-0.75, 1.45, -0.6] as V3, rot: [0, 0.75, 0] as V3, lines: [0.36, 0.24, 0.42] },
      { w: 0.44, h: 0.26, pos: [-0.05, 1.72, -1.0] as V3, rot: [0, 0.45, 0] as V3, lines: [0.24, 0.3] },
    ],
    [],
  )
  const fills = [big, small]
  const outlines = useMemo(() => [new THREE.EdgesGeometry(big), new THREE.EdgesGeometry(small)], [big, small])
  useEffect(() => () => outlines.forEach((o) => o.dispose()), [outlines])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((g, i) => {
      if (g) g.position.y = (cards[i]?.pos[1] ?? 0) + Math.sin(t * 0.6 + i * 2) * 0.035
    })
  })

  return (
    <>
      {cards.map((card, i) => (
        <group
          key={i}
          ref={(g) => {
            refs.current[i] = g
          }}
          position={card.pos}
          rotation={card.rot}
        >
          <mesh geometry={fills[i]}>
            <meshBasicMaterial color={c.accent} transparent opacity={0.06} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
          <lineSegments geometry={outlines[i]}>
            <lineBasicMaterial color={c.accent} transparent opacity={0.4} />
          </lineSegments>
          {card.lines.map((w, j) => (
            <mesh key={j} position={[-card.w / 2 + 0.05 + w / 2, card.h / 2 - 0.07 - j * 0.055, 0.001]}>
              <planeGeometry args={[w, 0.018]} />
              <meshBasicMaterial color={j === 0 ? c.accent2 : c.code} transparent opacity={j === 0 ? 0.8 : 0.35} side={THREE.DoubleSide} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

/* ── Floor: contact shadow, cast-shadow catcher, fine ring ────── */

function Floor({ shadows }: { shadows: boolean }) {
  const c = usePalette()
  const shadow = useRadialTexture(SHADOW_STOPS)
  return (
    <group position={[0.35, -0.9, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <circleGeometry args={[1.25, 48]} />
        <meshBasicMaterial map={shadow} color={c.shadow} transparent opacity={c.shadowOpacity * (shadows ? 0.6 : 1)} depthWrite={false} />
      </mesh>
      {shadows && (
        <mesh receiveShadow position={[0, 0, 0.001]}>
          <circleGeometry args={[1.6, 48]} />
          <shadowMaterial transparent opacity={c.castShadowOpacity} />
        </mesh>
      )}
      <mesh>
        <ringGeometry args={[1.48, 1.485, 96]} />
        <meshBasicMaterial color={c.accent} transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  )
}

export function Workspace({ shadows = false }: { shadows?: boolean }) {
  const c = usePalette()
  const root = useRef<THREE.Group>(null)

  // Opaque, lit meshes cast and receive real shadows when enabled.
  useEffect(() => {
    root.current?.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mat = m.material as THREE.Material
      const lit = !(mat instanceof THREE.MeshBasicMaterial) && !(mat instanceof THREE.ShadowMaterial) && !mat.transparent
      m.castShadow = shadows && lit
      m.receiveShadow = shadows && lit
    })
  }, [shadows])

  return (
    <group ref={root} position={[-0.25, -0.15, 0]} rotation={[0, -0.6, 0]} scale={1.35}>
      {/* copper rim light from behind + soft fill from the front */}
      <pointLight position={[2.2, 1.2, -1.6]} intensity={6} distance={6} color={c.accent2} />
      <pointLight position={[0.6, 1.6, 1.6]} intensity={1.6} distance={5} color={c.key} />
      <Floor shadows={shadows} />
      <Desk />
      <Monitor />
      <Chair />
      <Developer />
      <CodeCards />
    </group>
  )
}
