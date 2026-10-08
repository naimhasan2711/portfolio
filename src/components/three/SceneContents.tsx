import { useFrame, useThree } from '@react-three/fiber'
import { Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { heroCenterpiece } from '../../data/site'
import type { SceneQuality } from '../../utils/device'
import { revealState, sceneInput, sceneStage } from './input'
import { useDisposable, usePalette } from './palette'
import { Workspace } from './Workspace'
import { Workstation } from './Workstation'



/* ── Smartphone ──────────────────────────────────────────────── */

function Device() {
  const c = usePalette()
  const W = 1.5
  const H = 3.05
  const D = 0.12

  const body = useDisposable(() => {
    const r = 0.24
    const s = new THREE.Shape()
    s.moveTo(-W / 2 + r, -H / 2)
    s.lineTo(W / 2 - r, -H / 2)
    s.quadraticCurveTo(W / 2, -H / 2, W / 2, -H / 2 + r)
    s.lineTo(W / 2, H / 2 - r)
    s.quadraticCurveTo(W / 2, H / 2, W / 2 - r, H / 2)
    s.lineTo(-W / 2 + r, H / 2)
    s.quadraticCurveTo(-W / 2, H / 2, -W / 2, H / 2 - r)
    s.lineTo(-W / 2, -H / 2 + r)
    s.quadraticCurveTo(-W / 2, -H / 2, -W / 2 + r, -H / 2)
    const g = new THREE.ExtrudeGeometry(s, {
      depth: D,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.03,
      bevelSegments: 2,
      curveSegments: 6,
    })
    g.center()
    return g
  }, [])

  const edges = useDisposable(() => new THREE.EdgesGeometry(body, 25), [body])

  const zScreen = D / 2 + 0.032

  // Abstract Compose-like UI blocks on the screen: [x, y, w, h, opacity, accent?]
  const blocks: [number, number, number, number, number, boolean][] = [
    [0, 1.25, 1.1, 0.08, 0.35, false],
    [0, 0.72, 1.18, 0.72, 0.5, true],
    [-0.31, -0.02, 0.56, 0.5, 0.18, false],
    [0.31, -0.02, 0.56, 0.5, 0.18, false],
    [0, -0.5, 1.18, 0.16, 0.14, false],
    [0, -0.75, 1.18, 0.16, 0.12, false],
    [0, -1.0, 1.18, 0.16, 0.1, false],
    [0, -1.32, 0.42, 0.05, 0.4, false],
  ]

  return (
    <group>
      <mesh geometry={body}>
        <meshStandardMaterial color={c.body} metalness={0.75} roughness={0.32} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={c.accent} transparent opacity={c.edgeOpacity} />
      </lineSegments>

      {/* screen */}
      <mesh position={[0, 0, zScreen]}>
        <planeGeometry args={[W - 0.12, H - 0.14]} />
        <meshBasicMaterial color={c.screen} />
      </mesh>
      {blocks.map(([x, y, w, h, o, accent], i) => (
        <mesh key={i} position={[x, y, zScreen + 0.002]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial color={accent ? c.accent : c.block} transparent opacity={o} depthWrite={false} />
        </mesh>
      ))}
      {/* camera punch-hole */}
      <mesh position={[0, H / 2 - 0.16, zScreen + 0.002]}>
        <circleGeometry args={[0.035, 12]} />
        <meshBasicMaterial color={c.notch} />
      </mesh>
    </group>
  )
}

/* ── Orbit rings with travelling nodes ───────────────────────── */

function Orbit({ radius, tilt, speed, color }: { radius: number; tilt: [number, number, number]; speed: number; color: string }) {
  const dot = useRef<THREE.Mesh>(null)
  const dot2 = useRef<THREE.Mesh>(null)
  const ring = useDisposable(() => {
    const pts = new THREE.EllipseCurve(0, 0, radius, radius, 0, Math.PI * 2).getPoints(96)
    return new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)))
  }, [radius])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed
    dot.current?.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0)
    dot2.current?.position.set(Math.cos(t + Math.PI) * radius, Math.sin(t + Math.PI) * radius, 0)
  })

  return (
    <group rotation={tilt}>
      <lineLoop geometry={ring}>
        <lineBasicMaterial color={color} transparent opacity={0.16} />
      </lineLoop>
      <mesh ref={dot}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={dot2}>
        <sphereGeometry args={[0.028, 8, 8]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

/* ── Connected node network ──────────────────────────────────── */

function NodeNetwork({ count, subtle = false }: { count: number; subtle?: boolean }) {
  const c = usePalette()
  const group = useRef<THREE.Group>(null)

  const { points, lines } = useMemo(() => {
    // Deterministic pseudo-random so the layout is identical on every load.
    let seed = 7
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const nodes: THREE.Vector3[] = []
    const golden = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2
      const r = Math.sqrt(1 - y * y)
      const th = golden * i
      const radius = 2.7 + rand() * 0.9
      nodes.push(new THREE.Vector3(Math.cos(th) * r * radius, y * radius * 0.9, Math.sin(th) * r * radius))
    }
    const segs: number[] = []
    nodes.forEach((a, i) => {
      const nearest = nodes
        .map((b, j) => ({ j, d: a.distanceTo(b) }))
        .filter((n) => n.j > i)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
      for (const n of nearest) {
        const b = nodes[n.j]
        if (b && n.d < 2.6) segs.push(a.x, a.y, a.z, b.x, b.y, b.z)
      }
    })
    const pg = new THREE.BufferGeometry().setFromPoints(nodes)
    const lg = new THREE.BufferGeometry()
    lg.setAttribute('position', new THREE.Float32BufferAttribute(segs, 3))
    return { points: pg, lines: lg }
  }, [count])

  useEffect(
    () => () => {
      points.dispose()
      lines.dispose()
    },
    [points, lines],
  )

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.04
  })

  return (
    <group ref={group}>
      <lineSegments geometry={lines}>
        <lineBasicMaterial color={c.steel} transparent opacity={c.networkOpacity * (subtle ? 0.45 : 1)} depthWrite={false} />
      </lineSegments>
      <points geometry={points}>
        <pointsMaterial color={c.accent} size={subtle ? 0.045 : 0.07} sizeAttenuation transparent opacity={subtle ? 0.55 : 0.9} depthWrite={false} />
      </points>
    </group>
  )
}

/* ── Dust particles ──────────────────────────────────────────── */

function Particles({ count }: { count: number }) {
  const c = usePalette()
  const ref = useRef<THREE.Points>(null)

  const geometry = useDisposable(() => {
    let seed = 11
    const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (rand() - 0.5) * 26
      arr[i * 3 + 1] = (rand() - 0.5) * 16
      arr[i * 3 + 2] = (rand() - 0.5) * 14 - 3
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [count])

  // Round, soft sprite drawn once on a tiny canvas.
  const sprite = useDisposable(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 32
    const ctx = c.getContext('2d')
    if (ctx) {
      const g = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      g.addColorStop(0, 'rgba(255,255,255,1)')
      g.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, 32, 32)
    }
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.008
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        map={sprite}
        key={c.additive ? 'add' : 'normal'}
        color={c.particles}
        size={0.06}
        sizeAttenuation
        transparent
        opacity={c.particleOpacity}
        depthWrite={false}
        blending={c.additive ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  )
}

/* ── Floating wireframe structures ───────────────────────────── */

function FloatingShapes() {
  const c = usePalette()
  const refs = useRef<(THREE.Mesh | null)[]>([])
  const shapes = useMemo(
    () => [
      { pos: [-2.6, 1.9, -1.5] as const, geo: 'ico', s: 0.42, speed: 0.3 },
      { pos: [2.4, -1.9, -0.6] as const, geo: 'oct', s: 0.34, speed: 0.4 },
      { pos: [-2.1, -2.2, 0.6] as const, geo: 'tet', s: 0.26, speed: 0.5 },
      { pos: [2.1, 2.3, -2.2] as const, geo: 'box', s: 0.24, speed: 0.35 },
    ],
    [],
  )

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    refs.current.forEach((m, i) => {
      if (!m) return
      const sp = shapes[i]?.speed ?? 0.3
      m.rotation.x = t * sp
      m.rotation.y = t * sp * 0.7
      m.position.y = (shapes[i]?.pos[1] ?? 0) + Math.sin(t * 0.6 + i) * 0.12
    })
  })

  return (
    <>
      {shapes.map((s, i) => (
        <mesh
          key={i}
          ref={(m) => {
            refs.current[i] = m
          }}
          position={[s.pos[0], s.pos[1], s.pos[2]]}
          scale={s.s}
        >
          {s.geo === 'ico' && <icosahedronGeometry args={[1, 0]} />}
          {s.geo === 'oct' && <octahedronGeometry args={[1, 0]} />}
          {s.geo === 'tet' && <tetrahedronGeometry args={[1, 0]} />}
          {s.geo === 'box' && <boxGeometry args={[1, 1, 1]} />}
          <meshBasicMaterial color={i % 2 ? c.steel : c.accent} wireframe transparent opacity={0.32} />
        </mesh>
      ))}
    </>
  )
}

/* ── Architecture core: concentric layers around a faceted core ── */

const CORE_LAYERS = [
  { radius: 1.15, modules: 3, speed: 0.22 },
  { radius: 1.45, modules: 5, speed: -0.14 },
  { radius: 1.75, modules: 7, speed: 0.09 },
]

function Core() {
  const c = usePalette()
  const core = useRef<THREE.Mesh>(null)
  const shell = useRef<THREE.LineSegments>(null)
  const layers = useRef<(THREE.Group | null)[]>([])

  const shellGeo = useDisposable(() => {
    const src = new THREE.IcosahedronGeometry(0.88, 1)
    const edges = new THREE.EdgesGeometry(src)
    src.dispose()
    return edges
  }, [])
  const ringGeo = useDisposable(() => {
    const pts = new THREE.EllipseCurve(0, 0, 1, 1, 0, Math.PI * 2).getPoints(128)
    return new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)))
  }, [])

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    if (core.current) {
      core.current.rotation.x += dt * 0.25
      core.current.rotation.y += dt * 0.35
      core.current.scale.setScalar(1 + Math.sin(t * 1.4) * 0.025)
    }
    if (shell.current) {
      shell.current.rotation.y -= dt * 0.12
      shell.current.rotation.z += dt * 0.05
    }
    layers.current.forEach((g, i) => {
      if (g) g.rotation.z += dt * (CORE_LAYERS[i]?.speed ?? 0.1)
    })
  })

  const ringColors = [c.accent, c.accent2, c.steel]
  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial color={c.accent} metalness={0.55} roughness={0.32} flatShading emissive={c.accent} emissiveIntensity={0.22} />
      </mesh>
      <lineSegments ref={shell} geometry={shellGeo}>
        <lineBasicMaterial color={c.accent2} transparent opacity={0.4} />
      </lineSegments>

      {/* layers seen in perspective, like the Clean Architecture circles */}
      <group rotation={[0.82, 0.3, 0]}>
        {CORE_LAYERS.map((l, i) => (
          <group
            key={l.radius}
            ref={(g) => {
              layers.current[i] = g
            }}
          >
            <lineLoop geometry={ringGeo} scale={l.radius}>
              <lineBasicMaterial color={ringColors[i]} transparent opacity={0.6 - i * 0.12} />
            </lineLoop>
            {Array.from({ length: l.modules }).map((_, m) => {
              const a = (m / l.modules) * Math.PI * 2 + i
              return (
                <mesh key={m} position={[Math.cos(a) * l.radius, Math.sin(a) * l.radius, 0]} rotation={[0, 0, a]}>
                  <boxGeometry args={[0.11, 0.11, 0.11]} />
                  <meshStandardMaterial color={ringColors[i]} metalness={0.4} roughness={0.4} emissive={ringColors[i]} emissiveIntensity={0.15} />
                </mesh>
              )
            })}
          </group>
        ))}
      </group>
    </group>
  )
}

/* ── Rig: composition, pointer, scroll & lighting ────────────── */

/** Downward viewing angle for the room scenes (radians). Higher = more top-down. */
const ROOM_PITCH = 0.36

function Rig({ children, shadows }: { children: ReactNode; shadows: boolean }) {
  const c = usePalette()
  const group = useRef<THREE.Group>(null)
  const device = useRef<THREE.Group>(null)
  const light = useRef<THREE.PointLight>(null)
  const { size, camera, gl, scene: three } = useThree()
  // Model footprint at scale 1 (measured once after mount): width, height and centre offset.
  const footprint = useRef({ w: 3.4, h: 3.6, cx: 0, cy: 0, pivotX: 0, pivotZ: 0 })
  /** 0 → 1 entrance animation, started when the model first appears. */
  const intro = useRef(-1)
  /** Reveal: the model is "built" from the floor up behind a rising clip plane + scan line. */
  const reveal = useMemo(
    () => ({ plane: new THREE.Plane(new THREE.Vector3(0, -1, 0), 0), local: new THREE.Plane(), minY: 0, maxY: 1, pending: false }),
    [],
  )

  const measured = useRef(false)

  /** Measures the model's footprint once its meshes exist (they may load after mount). */
  const measure = () => {
    const d = device.current
    if (!d) return
    // measure in the group's local space (ignore its current mouse tilt / scale)
    const box = new THREE.Box3()
    d.updateWorldMatrix(true, true)
    const inv = new THREE.Matrix4().copy(d.parent?.matrixWorld ?? new THREE.Matrix4()).invert()
    d.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh || !m.geometry) return
      // ignore soft glows / shadows (transparent helpers) — only solid objects count
      const mat = m.material as THREE.Material | THREE.Material[]
      if (Array.isArray(mat) ? mat.every((x) => x.transparent) : mat.transparent) return
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
      const b = (m as THREE.InstancedMesh).isInstancedMesh ? ((m as THREE.InstancedMesh).computeBoundingBox(), (m as THREE.InstancedMesh).boundingBox) : m.geometry.boundingBox
      if (!b) return
      box.union(b.clone().applyMatrix4(m.matrixWorld).applyMatrix4(inv))
    })
    if (!box.isEmpty()) {
      const s = new THREE.Vector3()
      const ctr = new THREE.Vector3()
      box.getSize(s)
      box.getCenter(ctr)
      // Spin around the model's own centre (not the group origin), so it stays put
      // while rotating; fit using the widest it can get at any angle (its diagonal).
      const room = heroCenterpiece === 'workspace' || heroCenterpiece === 'workstation'
      const spanW = room ? Math.hypot(s.x, s.z) : s.x
      footprint.current = { w: spanW, h: s.y, cx: room ? 0 : ctr.x, cy: ctr.y, pivotX: room ? ctr.x : 0, pivotZ: room ? ctr.z : 0 }
      measured.current = true
      reveal.minY = box.min.y
      reveal.maxY = box.max.y
      // clip every material against the reveal plane (set before compiling, so no hitch later)
      gl.localClippingEnabled = true
      d.traverse((o) => {
        const m = o as THREE.Mesh
        if (!m.isMesh || m.userData.noClip) return
        const mats = Array.isArray(m.material) ? m.material : [m.material]
        mats.forEach((mat) => {
          mat.clippingPlanes = [reveal.plane]
          mat.needsUpdate = true
        })
      })
      // compile every shader up front so the reveal never stalls on a blank frame
      gl.compile(three, camera)
      // start the entrance on the *next* frame (compiling makes this frame long)
      reveal.pending = true
      window.dispatchEvent(new Event('hero-model-ready'))
    }
  }

  // Fallback composition (before the stage is measured).
  const wide = size.width >= 1024
  const fallback = { x: wide ? 2.5 : 0, y: wide ? 0 : -1.6, s: wide ? 1 : 0.6 }
  const target = useRef(fallback)
  const zoom = useRef(1)

  /** Fits the model inside the #hero-stage box (in world units at z = 0). */
  const computeTarget = () => {
    if (!sceneStage.valid) return fallback
    const persp = camera as THREE.PerspectiveCamera
    const halfH = Math.tan(THREE.MathUtils.degToRad(persp.fov / 2)) * 8
    const upp = (halfH * 2) / size.height // world units per pixel
    const stageW = sceneStage.w * upp
    const stageH = sceneStage.h * upp
    const f = footprint.current
    // Fit the stage (the diagonal already allows for rotation, so a little spill is fine).
    const s = Math.min((stageW * 1.35) / f.w, stageH / f.h) * 0.96 * zoom.current
    const cx = (sceneStage.x + sceneStage.w / 2 - size.width / 2) * upp
    const cy = -(sceneStage.y + sceneStage.h / 2 - size.height / 2) * upp
    return { x: cx - f.cx * s, y: cy - f.cy * s, s }
  }

  useFrame(({ clock }, dt) => {
    const t = clock.getElapsedTime()
    const k = 1 - Math.pow(0.002, dt) // frame-rate independent smoothing
    const { x, y, scroll } = sceneInput
    const g = group.current
    if (!measured.current) measure()
    zoom.current += (sceneInput.zoom - zoom.current) * (1 - Math.pow(0.001, dt))
    target.current = computeTarget()
    const { x: baseX, y: baseY, s: fitScale } = target.current
    // entrance: built from the floor up while it grows and turns into place
    if (reveal.pending) {
      reveal.pending = false
      intro.current = 0
    } else if (intro.current >= 0 && intro.current < 1) {
      intro.current = Math.min(1, intro.current + Math.min(dt, 1 / 30) / 2.4) // capped step: no jumps after a long frame
    }
    const raw = intro.current < 0 ? 0 : intro.current
    const ip = 1 - Math.pow(1 - raw, 4) // ease-out quart
    const baseScale = fitScale * (0.9 + 0.1 * ip)
    const introSpin = (1 - ip) * -0.7
    const introDrop = (1 - ip) * -0.25
    // clip level: sweeps from below the floor to above the top (slightly ahead of the easing)
    const sweep = Math.min(1, raw * 1.25)
    const level = reveal.minY - 0.05 + (reveal.maxY - reveal.minY + 0.1) * (1 - Math.pow(1 - sweep, 2))
    if (g) {
      g.visible = intro.current >= 0 || heroCenterpiece !== 'workstation'
      // Turntable: rotation only around the vertical axis, driven by dragging.
      if (!sceneInput.dragging && Math.abs(sceneInput.spinVelocity) > 0.0001) {
        sceneInput.spin += sceneInput.spinVelocity * dt * 60 // glide after release
        sceneInput.spinVelocity *= Math.pow(0.92, dt * 60)
      }
      g.rotation.y += (sceneInput.spin + introSpin - g.rotation.y) * (1 - Math.pow(0.0001, dt))
      // Fixed viewing pitch (applied outside the spin, so the turntable stays level).
      // Objects above screen centre are seen from below, so add the angle to the camera.
      const room = heroCenterpiece === 'workspace' || heroCenterpiece === 'workstation'
      g.rotation.x = room ? ROOM_PITCH + Math.atan2(g.position.y, camera.position.z) : 0
      g.position.x += (baseX - g.position.x) * k
      g.position.y += (baseY + introDrop + scroll * 1.6 - g.position.y) * k
      g.scale.setScalar(g.scale.x + (baseScale - g.scale.x) * k)
    }
    if (device.current && measured.current) {
      device.current.updateWorldMatrix(true, false)
      // plane in the model's own space (keeps y < level), then into world space
      reveal.local.set(new THREE.Vector3(0, -1, 0), raw >= 1 ? 1e6 : level)
      reveal.plane.copy(reveal.local).applyMatrix4(device.current.matrixWorld)
      revealState.plane = reveal.plane
      revealState.glow = raw > 0 && raw < 1 ? Math.sin(Math.PI * sweep) : 0
    }
    if (device.current) {
      // The room scenes stay perfectly still (no sway or bob) — they only turn when dragged.
      const still = heroCenterpiece === 'workspace' || heroCenterpiece === 'workstation'
      device.current.rotation.y = still ? 0 : Math.sin(t * 0.35) * 0.35 - (heroCenterpiece === 'phone' ? 0.25 : 0)
      device.current.rotation.z = still ? 0 : Math.sin(t * 0.25) * 0.04
      device.current.position.y = still ? 0 : Math.sin(t * 0.8) * 0.06
      device.current.position.x = -footprint.current.pivotX
      device.current.position.z = -footprint.current.pivotZ
    }
    if (light.current) {
      light.current.position.x += (x * 4 + baseX - light.current.position.x) * k
      light.current.position.y += (y * 3 - light.current.position.y) * k
    }
    camera.position.z = 8 + scroll * 1.2
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[3, 4, 5]}
        intensity={1.1}
        color={c.key}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-radius={6}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-camera-near={0.5}
        shadow-camera-far={20}
      />
      <pointLight ref={light} position={[2, 0, 3]} intensity={18} distance={9} color={c.accent} />
      <group ref={group}>
        <group ref={device}>
          {/* the workstation appears in one piece once its models (avatar, chair) are loaded */}
          {heroCenterpiece === 'workstation' ? (
            <Suspense fallback={null}>
              <Workstation shadows={shadows} />
            </Suspense>
          ) : heroCenterpiece === 'workspace' ? <Workspace shadows={shadows} /> : heroCenterpiece === 'core' ? <Core /> : <Device />}
        </group>
        {children}
      </group>
    </>
  )
}

/* ── Adaptive resolution: drop DPR if frames are slow ─────────── */

function AdaptiveDpr() {
  const setDpr = useThree((s) => s.setDpr)
  const samples = useRef<number[]>([])
  const done = useRef(false)
  useFrame((_, dt) => {
    if (done.current) return
    samples.current.push(dt)
    if (samples.current.length >= 90) {
      const avg = samples.current.reduce((a, b) => a + b, 0) / samples.current.length
      if (avg > 1 / 40) setDpr(1)
      done.current = true
    }
  })
  return null
}

/** Soft studio reflections for metals, glass and leather (no HDR file to download). */
function StudioEnvironment() {
  const gl = useThree((s) => s.gl)
  const scene = useThree((s) => s.scene)
  const c = usePalette()
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const room = new RoomEnvironment()
    const env = pmrem.fromScene(room, 0.04).texture
    scene.environment = env
    return () => {
      scene.environment = null
      env.dispose()
      room.dispose()
      pmrem.dispose()
    }
  }, [gl, scene])
  useEffect(() => {
    scene.environmentIntensity = c.envIntensity
  }, [scene, c.envIntensity])
  return null
}

export function SceneContents({ quality }: { quality: SceneQuality }) {
  const c = usePalette()
  return (
    <>
      <fog attach="fog" args={[c.fog, 7, 20]} />
      <StudioEnvironment />
      <Rig shadows={quality.shadows}>
        {/* the workspace scene is calmer: no orbits or wireframe shapes, a quieter network */}
        {heroCenterpiece !== 'workspace' && heroCenterpiece !== 'workstation' && (
          <>
            <Orbit radius={1.95} tilt={[1.25, 0.2, 0]} speed={0.5} color={c.accent} />
            <Orbit radius={2.4} tilt={[1.1, -0.5, 0.3]} speed={-0.32} color={c.accent2} />
            <FloatingShapes />
          </>
        )}
        {heroCenterpiece !== 'workstation' && <NodeNetwork count={quality.nodes} subtle={heroCenterpiece === 'workspace'} />}
      </Rig>
      <Particles count={quality.particles} />
      <AdaptiveDpr />
    </>
  )
}
