import { useFrame } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { revealState } from './input'
import { AvatarModel, type AvatarPose } from './AvatarModel'
import { ChairModel } from './ChairModel'
import { usePalette } from './palette'
import { Developer, Rod, STEAM_STOPS, useRadialTexture, useRoundedSlab, useWoodTexture } from './Workspace'

/**
 * Corner home-office diorama, modelled on a real developer workstation:
 * floating book shelves, a whiteboard, three monitors with real code,
 * a glass-panel PC, mechanical keyboard, desk mat, coffee, plants and an
 * LED strip along the ceiling. Everything is generated in code — no model
 * or image files are downloaded.
 *
 * Coordinates: floor at y = −0.95, desk top at y ≈ 0.02, back wall at
 * z ≈ −1.07, right wall at x ≈ 1.67. The camera looks into the corner.
 */

type V3 = [number, number, number]

/** Rotation that turns the chair model's seat toward the desk. */
const CHAIR_YAW = Math.PI

const FLOOR_Y = -0.95
const KEYS_Y = 0.05 // key tops (desk top + keyboard)

/** Where the avatar sits, rests its hands and feet (workstation space). */
const AVATAR_POSE: AvatarPose = {
  pelvis: [0.02, -0.26, 0.3],
  leftHand: [-0.1, 0.085, -0.2],
  rightHand: [0.14, 0.085, -0.2],
  leftFoot: [-0.1, FLOOR_Y + 0.06, -0.12],
  rightFoot: [0.14, FLOOR_Y + 0.06, -0.12],
  keysY: KEYS_Y,
  facing: [0, 0, -1],
  recline: 0.16, // upright, leaning slightly toward the desk
}

/** The previous code-built developer (fallback while the avatar loads). */
function CodedDeveloper() {
  return (
    <group position={[0.02, -0.02, -0.68]} rotation={[0, -Math.PI / 2, 0]}>
      <Developer />
    </group>
  )
}
const DESK_TOP = 0.022

/* ── Canvas textures: code editors, document, whiteboard ───────── */

const KOTLIN_VIEWMODEL = `@HiltViewModel
class ProjectsViewModel @Inject constructor(
    private val repository: ProjectRepository,
) : ViewModel() {

    val uiState: StateFlow<UiState> = repository
        .observeProjects()
        .map { UiState.Success(it) }
        .catch { emit(UiState.Error(it)) }
        .stateIn(
            scope = viewModelScope,
            started = WhileSubscribed(5_000),
            initialValue = UiState.Loading,
        )

    fun refresh() = viewModelScope.launch {
        repository.sync()
    }
}

@Composable
fun ProjectsScreen(vm: ProjectsViewModel = hiltViewModel()) {
    val state by vm.uiState.collectAsStateWithLifecycle()
    when (val s = state) {
        is UiState.Loading -> Loader()
        is UiState.Success -> ProjectList(s.items)
        is UiState.Error -> ErrorView(onRetry = vm::refresh)
    }
}`

const KEYWORDS = new Set([
  'class', 'fun', 'val', 'var', 'private', 'override', 'suspend', 'interface', 'when', 'is', 'return', 'constructor', 'object', 'import',
])

/**
 * Draws syntax-highlighted code onto a canvas, editor-style.
 * `limit` = how many characters have been "typed" so far (Infinity = all);
 * the view scrolls to keep the cursor visible.
 */
function drawCode(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  code: string,
  file: string,
  accent: string,
  limit = Infinity,
  cursorOn = false,
) {
  ctx.fillStyle = '#16191d'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#0f1215'
  ctx.fillRect(0, 0, w, 34)
  ctx.fillStyle = '#1d2227'
  ctx.fillRect(14, 6, 230, 28)
  ctx.fillStyle = accent
  ctx.fillRect(14, 31, 230, 3)
  ctx.font = '500 15px Consolas, "JetBrains Mono", Menlo, monospace'
  ctx.fillStyle = '#c9d1d9'
  ctx.fillText(file, 28, 25)
  ctx.fillStyle = '#121518'
  ctx.fillRect(0, 34, 46, h - 34)

  const lineH = 21
  const visible = Math.floor((h - 60) / lineH)
  const lines = code.split('\n')
  // which line the cursor is on
  let remaining = limit
  let cursorLine = lines.length - 1
  for (let i = 0; i < lines.length; i++) {
    const len = (lines[i] ?? '').length + 1
    if (remaining < len) {
      cursorLine = i
      break
    }
    remaining -= len
  }
  const first = Math.max(0, cursorLine - visible + 3)

  ctx.font = '15px Consolas, "JetBrains Mono", Menlo, monospace'
  let typed = limit
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? ''
    const y = 60 + (i - first) * lineH
    const show = i >= first && y <= h - 8
    if (show) {
      if (i === cursorLine && limit !== Infinity) {
        ctx.fillStyle = '#1c2126' // current-line highlight
        ctx.fillRect(46, y - 15, w - 46, lineH)
      }
      ctx.fillStyle = i === cursorLine ? '#9aa3ad' : '#4b535c'
      ctx.fillText(String(i + 1).padStart(2, ' '), 12, y)
    }
    let x = 58
    const tokens = line.match(/(\s+|"[^"]*"|\/\/.*|@\w+|\w+|[^\w\s])/g) ?? []
    for (const t of tokens) {
      if (typed <= 0) break
      const part = typed >= t.length ? t : t.slice(0, typed)
      typed -= t.length
      let color = '#c9d1d9'
      if (t.startsWith('//')) color = '#6a737d'
      else if (t.startsWith('"')) color = '#9ecb8f'
      else if (t.startsWith('@')) color = '#e5c07b'
      else if (KEYWORDS.has(t)) color = accent
      else if (/^[A-Z]\w*/.test(t)) color = '#7fb4e6'
      else if (/^\d/.test(t)) color = '#d19a66'
      if (show) {
        ctx.fillStyle = color
        ctx.fillText(part, x, y)
      }
      x += ctx.measureText(part).width
    }
    typed -= 1 // the newline
    if (i === cursorLine && show && limit !== Infinity && cursorOn) {
      ctx.fillStyle = '#e6e1d6'
      ctx.fillRect(x + 1, y - 14, 9, 18)
    }
    if (i >= cursorLine) break
  }
}

const TERMINAL_LINES: [string, string][] = [
  ['$ ./gradlew assembleRelease', '#e6e1d6'],
  ['> Task :app:preBuild UP-TO-DATE', '#8b949e'],
  ['> Task :core:model:compileKotlin', '#8b949e'],
  ['> Task :core:data:kspReleaseKotlin', '#8b949e'],
  ['> Task :core:data:compileReleaseKotlin', '#8b949e'],
  ['> Task :feature:projects:compileReleaseKotlin', '#8b949e'],
  ['> Task :app:mergeReleaseResources', '#8b949e'],
  ['> Task :app:minifyReleaseWithR8', '#8b949e'],
  ['> Task :app:packageRelease', '#8b949e'],
  ['BUILD SUCCESSFUL in 41s', '#7ec27a'],
  ['186 actionable tasks: 12 executed', '#8b949e'],
  ['', '#8b949e'],
  ['$ ./gradlew testDebugUnitTest', '#e6e1d6'],
  ['ProjectsViewModelTest', '#7fb4e6'],
  ['  PASSED emits Loading then Success', '#7ec27a'],
  ['  PASSED maps errors to UiState.Error', '#7ec27a'],
  ['ProjectRepositoryTest', '#7fb4e6'],
  ['  PASSED sync upserts remote projects', '#7ec27a'],
  ['  PASSED observeAll emits sorted rows', '#7ec27a'],
  ['BUILD SUCCESSFUL in 17s', '#7ec27a'],
  ['', '#8b949e'],
  ['$ adb install app-release.apk', '#e6e1d6'],
  ['Performing Streamed Install', '#8b949e'],
  ['Success', '#7ec27a'],
]

/** A terminal that streams build output line by line. */
function drawTerminal(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, shown = Infinity, cursorOn = false) {
  ctx.fillStyle = '#0d1013'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#171b1f'
  ctx.fillRect(0, 0, w, 34)
  ;['#e0654f', '#e3b341', '#57c06d'].forEach((col, i) => {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(20 + i * 20, 17, 6, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.font = '500 14px Consolas, "JetBrains Mono", Menlo, monospace'
  ctx.fillStyle = '#8b949e'
  ctx.fillText('zsh - portfolio-app', 90, 22)
  const lineH = 24
  const visible = Math.floor((h - 60) / lineH)
  const count = Math.min(TERMINAL_LINES.length, shown)
  const first = Math.max(0, count - visible + 1)
  ctx.font = '16px Consolas, "JetBrains Mono", Menlo, monospace'
  for (let i = first; i < count; i++) {
    const [text, color] = TERMINAL_LINES[i] ?? ['', '#fff']
    const y = 62 + (i - first) * lineH
    if (text.startsWith('$')) {
      ctx.fillStyle = accent
      ctx.fillText('$', 16, y)
      ctx.fillStyle = color
      ctx.fillText(text.slice(1), 28, y)
    } else {
      ctx.fillStyle = color
      ctx.fillText(text, 16, y)
    }
  }
  if (cursorOn && shown !== Infinity) {
    const y = 62 + (count - first) * lineH
    ctx.fillStyle = '#e6e1d6'
    ctx.fillRect(16, y - 15, 9, 18)
  }
}

function drawDocument(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.fillStyle = '#e9e6df'
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = '#d6d2c9'
  ctx.fillRect(0, 0, w, 40)
  ctx.fillStyle = '#1b1f24'
  ctx.font = '600 30px "Segoe UI", Arial, sans-serif'
  ctx.fillText('Architecture notes', 30, 100)
  ctx.fillStyle = accent
  ctx.fillRect(30, 116, 120, 4)
  ctx.font = '17px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = '#3d444b'
  const lines = [
    'UI layer: Jetpack Compose screens',
    'State: ViewModel + StateFlow',
    'Domain: use cases, pure Kotlin',
    'Data: Retrofit + Room repository',
    'DI: Hilt modules per feature',
    '',
    'Performance checklist',
    '• Baseline profiles',
    '• Stable Compose parameters',
    '• Avoid main-thread I/O',
    '• Paging for long lists',
  ]
  lines.forEach((l, i) => {
    if (l === 'Performance checklist') {
      ctx.font = '600 20px "Segoe UI", Arial, sans-serif'
      ctx.fillStyle = '#1b1f24'
    } else {
      ctx.font = '17px "Segoe UI", Arial, sans-serif'
      ctx.fillStyle = '#3d444b'
    }
    ctx.fillText(l, 30, 160 + i * 34)
  })
  // grey paragraph bars to fill the page
  ctx.fillStyle = '#c9c4ba'
  for (let i = 0; i < 9; i++) ctx.fillRect(30, 560 + i * 26, w - 60 - (i % 3) * 60, 9)
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#f4f3ef'
  ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#2a2f36'
  ctx.lineWidth = 2.2
  ctx.lineJoin = 'round'
  // phone wireframes
  const phone = (x: number, y: number) => {
    ctx.strokeRect(x, y, 70, 120)
    ctx.strokeRect(x + 10, y + 14, 50, 34)
    ctx.beginPath()
    ctx.moveTo(x + 10, y + 14)
    ctx.lineTo(x + 60, y + 48)
    ctx.moveTo(x + 60, y + 14)
    ctx.lineTo(x + 10, y + 48)
    ctx.stroke()
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(x + 10, y + 62 + i * 13)
      ctx.lineTo(x + 60 - (i % 2) * 14, y + 62 + i * 13)
      ctx.stroke()
    }
  }
  const arrow = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
    const a = Math.atan2(y2 - y1, x2 - x1)
    ctx.beginPath()
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - 10 * Math.cos(a - 0.4), y2 - 10 * Math.sin(a - 0.4))
    ctx.moveTo(x2, y2)
    ctx.lineTo(x2 - 10 * Math.cos(a + 0.4), y2 - 10 * Math.sin(a + 0.4))
    ctx.stroke()
  }
  phone(40, 40)
  phone(190, 40)
  phone(340, 40)
  phone(40, 230)
  phone(190, 230)
  arrow(115, 100, 185, 100)
  arrow(265, 100, 335, 100)
  arrow(375, 165, 230, 225)
  arrow(115, 290, 185, 290)
  // handwriting-ish notes
  ctx.strokeStyle = '#3c5a8a'
  ctx.lineWidth = 1.8
  for (let i = 0; i < 6; i++) {
    ctx.beginPath()
    let x = 350
    const y = 250 + i * 18
    ctx.moveTo(x, y)
    while (x < 470 - (i % 3) * 25) {
      x += 6
      ctx.lineTo(x, y + Math.sin(x * 0.9) * 2.5)
    }
    ctx.stroke()
  }
  ctx.fillStyle = '#b5482f'
  ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif'
  ctx.fillText('App flow v2', 350, 235)
}

function useCanvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void, deps: unknown[]) {
  const texture = useMemo(() => {
    const cv = document.createElement('canvas')
    cv.width = width
    cv.height = height
    const ctx = cv.getContext('2d')
    if (ctx) draw(ctx, width, height)
    const t = new THREE.CanvasTexture(cv)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 4
    return t
    // `draw` is recreated each render; deps control regeneration explicitly.
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => texture.dispose(), [texture])
  return texture
}

/**
 * A canvas texture that is redrawn as time passes (typing / streaming output).
 * `frameAt(t)` returns the step to draw; the canvas only repaints when it changes.
 * With reduced motion (no animation frames) the finished screen stays visible.
 */
function useLiveTexture(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, step: number, cursor: boolean) => void,
  frameAt: (t: number) => number,
  deps: unknown[],
) {
  const state = useMemo(() => {
    const cv = document.createElement('canvas')
    cv.width = width
    cv.height = height
    const ctx = cv.getContext('2d')
    if (ctx) draw(ctx, width, height, Infinity, false)
    const texture = new THREE.CanvasTexture(cv)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.anisotropy = 4
    return { texture, ctx, key: '' }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => state.texture.dispose(), [state])
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const step = frameAt(t)
    const cursor = Math.floor(t * 2.2) % 2 === 0
    const key = `${step}|${cursor}`
    if (key === state.key || !state.ctx) return
    state.key = key
    draw(state.ctx, width, height, step, cursor)
    state.texture.needsUpdate = true
  })
  return state.texture
}

/* ── Room floor: wooden planks ───────────────────────────────── */

/** Oak-style plank floor drawn on a canvas (staggered boards, seams, grain). */
function drawPlanks(ctx: CanvasRenderingContext2D, size: number, base: string, seam: string) {
  const rows = 8
  const boardH = size / rows
  let seed = 21
  const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const tint = new THREE.Color(base)
  for (let r = 0; r < rows; r++) {
    let x = -rand() * size * 0.5
    while (x < size) {
      const len = size * (0.45 + rand() * 0.4)
      const c = tint.clone().offsetHSL(0, (rand() - 0.5) * 0.06, (rand() - 0.5) * 0.06)
      ctx.fillStyle = `#${c.getHexString()}`
      ctx.fillRect(x, r * boardH, len, boardH)
      // grain
      ctx.globalAlpha = 0.12
      ctx.strokeStyle = seam
      for (let g = 0; g < 6; g++) {
        const y = r * boardH + rand() * boardH
        ctx.lineWidth = 0.6 + rand()
        ctx.beginPath()
        ctx.moveTo(x, y)
        for (let gx = x; gx < x + len; gx += 16) ctx.lineTo(gx, y + Math.sin(gx * 0.03 + g) * 1.5)
        ctx.stroke()
      }
      ctx.globalAlpha = 1
      // end seam
      ctx.fillStyle = seam
      ctx.fillRect(x, r * boardH, 2, boardH)
      x += len
    }
    // long seam between rows
    ctx.fillStyle = seam
    ctx.fillRect(0, r * boardH, size, 2)
  }
}

/**
 * Glowing copper outline of the floor that rides the reveal's clip plane,
 * so the room looks "scanned" into existence from the floor up.
 */
function ScanFrame({ w, d }: { w: number; d: number }) {
  const c = usePalette()
  const group = useRef<THREE.Group>(null)
  const fill = useRef<THREE.MeshBasicMaterial>(null)
  const line = useRef<THREE.LineBasicMaterial>(null)
  const outline = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(
      [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].map(([x, z]) => new THREE.Vector3(x, 0, z)),
    )
    return g
  }, [w, d])
  useEffect(() => () => outline.dispose(), [outline])
  const p0 = useMemo(() => new THREE.Vector3(), [])
  const up = useMemo(() => new THREE.Vector3(), [])

  useFrame(() => {
    const g = group.current
    const plane = revealState.plane
    const glow = revealState.glow
    if (!g) return
    g.visible = glow > 0.01 && !!plane
    if (!plane || !g.visible) return
    // slide along local Y until the frame sits exactly on the clip plane
    g.position.y = 0
    g.updateWorldMatrix(true, false)
    p0.setFromMatrixPosition(g.matrixWorld)
    up.set(0, 1, 0).transformDirection(g.matrixWorld)
    const denom = up.dot(plane.normal)
    if (Math.abs(denom) > 1e-4) {
      const scale = g.matrixWorld.getMaxScaleOnAxis()
      g.position.y = -plane.distanceToPoint(p0) / denom / scale
    }
    if (fill.current) fill.current.opacity = 0.1 * glow
    if (line.current) line.current.opacity = 0.95 * glow
  })

  return (
    <group ref={group} visible={false}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} userData={{ noClip: true }} renderOrder={10}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial ref={fill} color={c.accent} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
      </mesh>
      <lineLoop geometry={outline} userData={{ noClip: true }} renderOrder={11}>
        <lineBasicMaterial ref={line} color={c.accent2} transparent opacity={0} depthWrite={false} toneMapped={false} />
      </lineLoop>
    </group>
  )
}

function Floor() {
  const c = usePalette()
  const shadow = useRadialTexture(STEAM_STOPS)
  const texture = useCanvasTexture(1024, 1024, (ctx, w) => drawPlanks(ctx, w, c.floorWood, c.floorSeam), [c.floorWood, c.floorSeam])
  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2.2, 1.6)
    texture.needsUpdate = true
  }, [texture])
  const W = 4.3
  const D = 3.1
  return (
    <group position={[0.05, FLOOR_Y, -0.4]}>
      {/* soft shadow under the platform */}
      <mesh position={[0, -0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 1.5, D * 1.6]} />
        <meshBasicMaterial map={shadow} color={c.shadow} transparent opacity={c.shadowOpacity * 0.8} depthWrite={false} />
      </mesh>
      {/* floor slab: plank top + darker edges */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <boxGeometry args={[W, 0.08, D]} />
        <meshStandardMaterial color={c.floorEdge} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.0005, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={texture} roughness={0.55} metalness={0.02} />
      </mesh>
      <ScanFrame w={W} d={D} />
    </group>
  )
}

/* ── Room shell ─────────────────────────────────────────────── */

function Room() {
  const c = usePalette()
  return (
    <group>
      <Floor />
      {/* soft overhead lights (the room has no walls — it floats in the hero) */}
      <pointLight position={[-0.4, 2.0, -0.4]} intensity={2.2} distance={4} color={c.led} />
      <pointLight position={[1.3, 2.0, 0.1]} intensity={1.6} distance={3.5} color={c.led} />
    </group>
  )
}

/* ── Shelves with books, plants and objects ───────────────────── */

const BOOK_COLORS = ['#1f3b5a', '#c9a227', '#8c2f2a', '#2f6b5e', '#e8e2d4', '#151719', '#6b7a3a', '#b5653b', '#3d4b8a', '#d8c9a3', '#4a2c2a', '#2b2f33']

interface BookSpec {
  x: number
  y: number
  z: number
  w: number
  h: number
  d: number
  color: string
  tilt: number
}

/** Fills a shelf span with books (deterministic layout). */
function shelfBooks(x0: number, x1: number, y: number, z: number, seed: number): BookSpec[] {
  let s = seed
  const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
  const out: BookSpec[] = []
  let x = x0
  while (x < x1) {
    const w = 0.022 + rand() * 0.03
    const h = 0.17 + rand() * 0.11
    const color = BOOK_COLORS[Math.floor(rand() * BOOK_COLORS.length)] ?? '#333'
    out.push({ x: x + w / 2, y: y + h / 2, z, w, h, d: 0.16 + rand() * 0.04, color, tilt: 0 })
    x += w + 0.002
  }
  // lean the last book against its neighbour
  const last = out[out.length - 1]
  if (last) last.tilt = -0.18
  return out
}

function Books({ books }: { books: BookSpec[] }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    books.forEach((b, i) => {
      o.position.set(b.x, b.y, b.z)
      o.rotation.set(0, 0, b.tilt)
      o.scale.set(b.w, b.h, b.d)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, col.set(b.color))
    })
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [books])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, books.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.75} />
    </instancedMesh>
  )
}

/** Potted plant: a pot and a loose cluster of leaves. */
function Plant({ position, scale = 1, seed = 1 }: { position: V3; scale?: number; seed?: number }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const COUNT = 22
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    let s = seed * 97
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    for (let i = 0; i < COUNT; i++) {
      const a = rand() * Math.PI * 2
      const up = 0.4 + rand() * 0.9
      o.position.set(Math.cos(a) * 0.03, 0.08 + rand() * 0.05, Math.sin(a) * 0.03)
      o.rotation.set(Math.sin(a) * up, a, Math.cos(a) * up)
      o.scale.set(0.018, 0.09 + rand() * 0.06, 0.006)
      o.translateY(0.5)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, col.setHSL(0.27 + rand() * 0.05, 0.45, 0.24 + rand() * 0.12))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [seed])
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.045, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.04, 0.09, 20]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.6} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} castShadow>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

/** Trailing ivy hanging from a shelf corner. */
function Ivy({ position }: { position: V3 }) {
  const ref = useRef<THREE.InstancedMesh>(null)
  const COUNT = 90
  useLayoutEffect(() => {
    const m = ref.current
    if (!m) return
    let s = 41
    const rand = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    const strands = 5
    for (let i = 0; i < COUNT; i++) {
      const strand = i % strands
      const t = Math.floor(i / strands) / (COUNT / strands)
      const len = 0.5 + strand * 0.18
      o.position.set(Math.sin(t * 6 + strand) * 0.05 + strand * 0.025 - 0.05, -t * len, Math.cos(t * 5 + strand) * 0.04)
      o.rotation.set(rand() * 3, rand() * 3, rand() * 3)
      const size = 0.022 + rand() * 0.01
      o.scale.set(size, size * 0.4, size)
      o.updateMatrix()
      m.setMatrixAt(i, o.matrix)
      m.setColorAt(i, col.setHSL(0.28 + rand() * 0.05, 0.5, 0.22 + rand() * 0.14))
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [])
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.055, 0.1, 20]} />
        <meshStandardMaterial color="#d9d4ca" roughness={0.6} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, COUNT]} castShadow>
        <sphereGeometry args={[1, 7, 5]} />
        <meshStandardMaterial roughness={0.7} />
      </instancedMesh>
    </group>
  )
}

function Shelves() {
  const c = usePalette()
  const wood = useWoodTexture(c.wood, c.woodGrain)
  const shelfZ = -0.94
  const levels = [0.86, 1.3, 1.74]
  const books = useMemo(
    () => [
      ...shelfBooks(-1.6, -0.95, levels[0]! + 0.018, shelfZ, 11),
      ...shelfBooks(-0.35, 0.18, levels[0]! + 0.018, shelfZ, 23),
      ...shelfBooks(-1.62, -0.55, levels[1]! + 0.018, shelfZ, 7),
      ...shelfBooks(0.12, 0.42, levels[1]! + 0.018, shelfZ, 31),
      ...shelfBooks(-1.6, -0.62, levels[2]! + 0.018, shelfZ, 5),
    ],
    // levels is constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    // freestanding open bookcase, set just behind the desk
    <group position={[0, 0, -0.3]}>
      {/* uprights + top cap */}
      {[-1.69, 0.59].map((x) => (
        <mesh key={x} position={[x, (FLOOR_Y + 1.98) / 2, shelfZ]} castShadow receiveShadow>
          <boxGeometry args={[0.035, 1.98 - FLOOR_Y, 0.29]} />
          <meshStandardMaterial map={wood} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[-0.55, 1.98, shelfZ]} castShadow>
        <boxGeometry args={[2.315, 0.035, 0.29]} />
        <meshStandardMaterial map={wood} roughness={0.5} />
      </mesh>
      {levels.map((y) => (
        <group key={y}>
          <mesh position={[-0.55, y, shelfZ]} castShadow receiveShadow>
            <boxGeometry args={[2.25, 0.035, 0.27]} />
            <meshStandardMaterial map={wood} roughness={0.5} />
          </mesh>
        </group>
      ))}
      <Books books={books} />

      {/* objects between the books */}
      <Plant position={[-0.75, levels[0]! + 0.018, shelfZ]} seed={3} />
      {/* picture frame */}
      <group position={[-0.62, levels[0]! + 0.17, shelfZ - 0.04]} rotation={[-0.12, 0.15, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.29, 0.02]} />
          <meshStandardMaterial color="#141618" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.011]}>
          <planeGeometry args={[0.17, 0.23]} />
          <meshStandardMaterial color="#7d8b96" roughness={0.3} metalness={0.1} />
        </mesh>
      </group>
      {/* camera */}
      <group position={[0.36, levels[0]! + 0.06, shelfZ]}>
        <mesh castShadow>
          <boxGeometry args={[0.13, 0.08, 0.06]} />
          <meshStandardMaterial color="#1a1c1f" roughness={0.4} metalness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.032, 0.05, 20]} />
          <meshStandardMaterial color="#0e0f11" roughness={0.3} metalness={0.5} />
        </mesh>
      </group>
      {/* speaker + stacked boxes */}
      <mesh position={[-0.12, levels[1]! + 0.12, shelfZ]} castShadow>
        <boxGeometry args={[0.13, 0.2, 0.13]} />
        <meshStandardMaterial color="#1a1c1f" roughness={0.5} />
      </mesh>
      <mesh position={[-0.35, levels[1]! + 0.06, shelfZ]} castShadow>
        <boxGeometry args={[0.24, 0.08, 0.18]} />
        <meshStandardMaterial color="#d7d1c6" roughness={0.7} />
      </mesh>
      <mesh position={[-0.35, levels[1]! + 0.13, shelfZ]} castShadow>
        <boxGeometry args={[0.2, 0.06, 0.16]} />
        <meshStandardMaterial color="#b5653b" roughness={0.7} />
      </mesh>
      <Plant position={[-0.35, levels[2]! + 0.018, shelfZ]} seed={9} scale={0.9} />
      <mesh position={[-0.1, levels[2]! + 0.1, shelfZ]} castShadow>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color="#1a1c1f" roughness={0.5} />
      </mesh>
      <Ivy position={[0.42, levels[2]! + 0.018, shelfZ]} />
    </group>
  )
}

/* ── Desk, cabinets and items ─────────────────────────────────── */

function Cabinet({ x }: { x: number }) {
  const c = usePalette()
  const h = 0.93
  return (
    <group position={[x, FLOOR_Y + h / 2, -0.66]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, h, 0.72]} />
        <meshStandardMaterial color={c.cabinet} roughness={0.55} metalness={0.15} />
      </mesh>
      {[0.3, 0.02, -0.28].map((y) => (
        <group key={y}>
          {/* drawer seam */}
          <mesh position={[0, y - 0.14, 0.361]}>
            <planeGeometry args={[0.48, 0.006]} />
            <meshBasicMaterial color="#000" transparent opacity={0.45} />
          </mesh>
          {/* recessed handle */}
          <mesh position={[0, y + 0.08, 0.362]}>
            <boxGeometry args={[0.16, 0.012, 0.01]} />
            <meshStandardMaterial color={c.chrome} metalness={0.9} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

interface MonitorProps {
  position: V3
  rotationY: number
  width: number
  height: number
  texture: THREE.Texture
  standHeight: number
  children?: ReactNode
}

function Monitor({ position, rotationY, width, height, texture, standHeight, children }: MonitorProps) {
  const c = usePalette()
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* stand */}
      <mesh position={[0, 0.006, -0.04]} castShadow>
        <boxGeometry args={[0.2, 0.012, 0.15]} />
        <meshStandardMaterial color={c.body} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, standHeight / 2, -0.07]} castShadow>
        <boxGeometry args={[0.05, standHeight, 0.025]} />
        <meshStandardMaterial color={c.body} metalness={0.7} roughness={0.35} />
      </mesh>
      {/* panel */}
      <group position={[0, standHeight + height / 2 - 0.02, -0.04]}>
        <mesh castShadow>
          <boxGeometry args={[width + 0.025, height + 0.025, 0.03]} />
          <meshStandardMaterial color="#0d0f12" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.0155]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {children}
      </group>
    </group>
  )
}

function Keyboard() {
  const keys = useRef<THREE.InstancedMesh>(null)
  const ROWS = 5
  const COLS = 15
  useLayoutEffect(() => {
    const m = keys.current
    if (!m) return
    const o = new THREE.Object3D()
    const col = new THREE.Color()
    let i = 0
    for (let r = 0; r < ROWS; r++) {
      for (let k = 0; k < COLS; k++) {
        const space = r === ROWS - 1 && k >= 4 && k <= 10
        o.position.set(-0.24 + k * 0.034, 0.016, -0.065 + r * 0.032)
        o.scale.set(space ? (k === 7 ? 7.6 : 0.0001) : 1, 1, 1)
        o.updateMatrix()
        m.setMatrixAt(i, o.matrix)
        const accent = (r === 0 && k === 0) || (r === 2 && k === 14) || (r === 3 && k === 14)
        const light = r === 0 || k === 0 || k === 14
        m.setColorAt(i, col.set(accent ? '#d9622b' : light ? '#9aa1a8' : '#3a3f45'))
        i++
      }
    }
    m.instanceMatrix.needsUpdate = true
    if (m.instanceColor) m.instanceColor.needsUpdate = true
  }, [])
  return (
    <group position={[0.02, DESK_TOP + 0.004, -0.36]} rotation={[0, 0.04, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.54, 0.022, 0.18]} />
        <meshStandardMaterial color="#1c1f23" metalness={0.4} roughness={0.4} />
      </mesh>
      <instancedMesh ref={keys} args={[undefined, undefined, ROWS * COLS]} castShadow>
        <boxGeometry args={[0.029, 0.014, 0.028]} />
        <meshStandardMaterial roughness={0.5} />
      </instancedMesh>
    </group>
  )
}

function PcTower() {
  const c = usePalette()
  const fans = useRef<(THREE.Mesh | null)[]>([])
  useFrame((_, dt) => fans.current.forEach((f) => f && (f.rotation.z += dt * 2.5)))
  const W = 0.44
  const H = 0.5
  const D = 0.48
  return (
    <group position={[1.28, DESK_TOP + H / 2, -0.66]} rotation={[0, -0.25, 0]}>
      {/* case shell */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#0c0d0f" metalness={0.6} roughness={0.35} transparent opacity={0.0001} />
      </mesh>
      {[
        [0, H / 2 - 0.01, 0, W, 0.02, D],
        [0, -H / 2 + 0.01, 0, W, 0.02, D],
        [W / 2 - 0.01, 0, 0, 0.02, H, D],
        [0, 0, -D / 2 + 0.01, W, H, 0.02],
      ].map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x!, y!, z!]} castShadow>
          <boxGeometry args={[w!, h!, d!]} />
          <meshStandardMaterial color="#0c0d0f" metalness={0.6} roughness={0.35} />
        </mesh>
      ))}
      {/* motherboard + GPU + cooler */}
      <mesh position={[0.15, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D - 0.06, H - 0.06]} />
        <meshStandardMaterial color="#15181c" roughness={0.6} />
      </mesh>
      <mesh position={[0.02, -0.07, 0.02]}>
        <boxGeometry args={[0.22, 0.06, 0.34]} />
        <meshStandardMaterial color="#202429" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[-0.09, -0.07, 0.02]}>
        <boxGeometry args={[0.005, 0.012, 0.3]} />
        <meshBasicMaterial color={c.led} toneMapped={false} />
      </mesh>
      {/* front fans (glowing rings) */}
      {[0.14, 0, -0.14].map((y, i) => (
        <group key={y} position={[0, y, D / 2 - 0.03]}>
          <mesh>
            <torusGeometry args={[0.055, 0.007, 10, 40]} />
            <meshBasicMaterial color={i === 1 ? c.accent2 : c.led} toneMapped={false} />
          </mesh>
          <mesh
            ref={(m) => {
              fans.current[i] = m
            }}
          >
            <circleGeometry args={[0.05, 7]} />
            <meshStandardMaterial color="#25292e" roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* CPU cooler ring */}
      <mesh position={[0.12, 0.1, -0.05]} rotation={[0, -Math.PI / 2, 0]}>
        <torusGeometry args={[0.05, 0.006, 10, 36]} />
        <meshBasicMaterial color={c.led} toneMapped={false} />
      </mesh>
      {/* tempered-glass side panel facing the room */}
      <mesh position={[-W / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshPhysicalMaterial color="#9aa7b4" metalness={0} roughness={0.05} transparent opacity={0.16} clearcoat={1} />
      </mesh>
      {/* front glass */}
      <mesh position={[0, 0, D / 2]}>
        <planeGeometry args={[W, H]} />
        <meshPhysicalMaterial color="#9aa7b4" roughness={0.05} transparent opacity={0.12} clearcoat={1} />
      </mesh>
      <pointLight position={[0, 0.05, 0.05]} intensity={0.3} distance={0.6} color={c.accent2} />
    </group>
  )
}

function Book({ position, size, color, rotationY = 0 }: { position: V3; size: V3; color: string; rotationY?: number }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* page block on the open side */}
      <mesh position={[0, 0, size[2] / 2 + 0.0005]}>
        <planeGeometry args={[size[0] - 0.01, size[1] * 0.75]} />
        <meshStandardMaterial color="#efe9dc" roughness={0.9} />
      </mesh>
    </group>
  )
}

function CoffeeMug() {
  const c = usePalette()
  const steamTex = useRadialTexture(STEAM_STOPS)
  const puffs = useRef<(THREE.Sprite | null)[]>([])
  const COUNT = 5
  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    puffs.current.forEach((s, i) => {
      if (!s) return
      const p = (t * 0.3 + i / COUNT) % 1
      s.position.set(Math.sin(t * 1.3 + i * 1.7) * 0.02 * p, 0.11 + p * 0.38, Math.cos(t + i) * 0.015 * p)
      const size = 0.045 + p * 0.14
      s.scale.set(size, size * 1.3, 1)
      ;(s.material as THREE.SpriteMaterial).opacity = Math.sin(Math.PI * p) * 0.3
    })
  })
  return (
    <group position={[-0.56, DESK_TOP, -0.4]}>
      <mesh position={[0, 0.055, 0]} castShadow>
        <cylinderGeometry args={[0.042, 0.038, 0.105, 32, 1, true]} />
        <meshPhysicalMaterial color="#f1eee8" roughness={0.25} clearcoat={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.003, 0]}>
        <cylinderGeometry args={[0.038, 0.038, 0.006, 32]} />
        <meshStandardMaterial color="#f1eee8" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.095, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial color="#3b2416" roughness={0.15} />
      </mesh>
      <mesh position={[0.046, 0.055, 0]}>
        <torusGeometry args={[0.024, 0.007, 10, 20, Math.PI]} />
        <meshStandardMaterial color="#f1eee8" roughness={0.3} />
      </mesh>
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

function Desk() {
  const c = usePalette()
  const wood = useWoodTexture(c.wood, c.woodGrain)
  const top = useRoundedSlab(3.2, 0.82, 0.03, 0.035, 0.008)
  const mat = useRoundedSlab(1.25, 0.44, 0.03, 0.004, 0.002)
  const accent = c.accent
  // centre monitor: Kotlin typed out at a human pace, pausing at the end before the next pass
  const typingCycle = KOTLIN_VIEWMODEL.length / 18 + 4
  const code1 = useLiveTexture(
    1024,
    600,
    (ctx, w, h, step, cursor) => drawCode(ctx, w, h, KOTLIN_VIEWMODEL, 'ProjectsViewModel.kt', accent, step, cursor),
    (t) => {
      const local = t % typingCycle
      // ~18 chars/s with small bursts and hesitations
      return Math.max(0, Math.min(KOTLIN_VIEWMODEL.length, Math.floor(local * 18 + Math.sin(local * 3.1) * 6)))
    },
    [accent],
  )
  // right monitor: a terminal streaming a build + test run
  const code2 = useLiveTexture(
    640,
    800,
    (ctx, w, h, step, cursor) => drawTerminal(ctx, w, h, accent, step, cursor),
    (t) => Math.floor((t * 1.1) % (TERMINAL_LINES.length + 5)),
    [accent],
  )
  const doc = useCanvasTexture(480, 820, (ctx, w, h) => drawDocument(ctx, w, h, accent), [accent])
  useEffect(() => {
    wood.repeat.set(2.5, 0.8)
  }, [wood])

  return (
    <group>
      {/* walnut desk top */}
      <mesh geometry={top} position={[0.04, 0, -0.64]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={wood} roughness={0.42} />
      </mesh>
      <Cabinet x={-1.28} />
      <Cabinet x={1.33} />

      {/* desk mat */}
      <mesh geometry={mat} position={[0.1, DESK_TOP + 0.002, -0.4]} rotation={[-Math.PI / 2, 0, 0.04]} receiveShadow>
        <meshStandardMaterial color={c.mat} roughness={0.95} />
      </mesh>

      {/* three monitors: portrait doc (left), code on a book riser (centre), tall code (right) */}
      <Monitor position={[-1.15, DESK_TOP, -0.74]} rotationY={0.38} width={0.42} height={0.72} texture={doc} standHeight={0.12} />
      <group position={[-0.32, DESK_TOP, -0.84]}>
        <Book position={[0, 0.02, 0]} size={[0.36, 0.04, 0.26]} color="#2b3d5a" />
        <Book position={[0.01, 0.06, 0]} size={[0.34, 0.04, 0.25]} color="#d9d2c1" rotationY={0.04} />
        <Book position={[0, 0.098, 0]} size={[0.32, 0.036, 0.24]} color="#7d2f26" rotationY={-0.03} />
      </group>
      <Monitor position={[-0.32, DESK_TOP + 0.116, -0.8]} rotationY={0.12} width={0.86} height={0.5} texture={code1} standHeight={0.1}>
        {/* monitor light bar */}
        <mesh position={[0, 0.27, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.5, 16]} />
          <meshStandardMaterial color="#121417" metalness={0.6} roughness={0.3} />
        </mesh>
        <pointLight position={[0, 0.25, 0.25]} intensity={0.8} distance={1.2} color={c.led} />
      </Monitor>
      <Monitor position={[0.55, DESK_TOP, -0.78]} rotationY={-0.18} width={0.5} height={0.66} texture={code2} standHeight={0.12} />

      <PcTower />
      {/* books next to the tower */}
      <Book position={[0.93, DESK_TOP + 0.02, -0.45]} size={[0.24, 0.04, 0.17]} color="#151719" rotationY={-0.1} />
      <Book position={[0.93, DESK_TOP + 0.06, -0.45]} size={[0.23, 0.04, 0.16]} color="#c9a227" rotationY={0.05} />

      <Keyboard />
      {/* mouse */}
      <mesh position={[0.48, DESK_TOP + 0.016, -0.36]} scale={[0.75, 0.45, 1.2]} castShadow>
        <sphereGeometry args={[0.045, 24, 16]} />
        <meshStandardMaterial color="#141618" roughness={0.4} metalness={0.2} />
      </mesh>
      <CoffeeMug />
      {/* books at the front-left corner */}
      <Book position={[-1.0, DESK_TOP + 0.02, -0.42]} size={[0.3, 0.04, 0.22]} color="#e8e2d4" rotationY={0.25} />
      <Book position={[-0.97, DESK_TOP + 0.06, -0.43]} size={[0.28, 0.04, 0.2]} color="#151719" rotationY={0.12} />
      <mesh position={[-0.97, DESK_TOP + 0.081, -0.43]} rotation={[-Math.PI / 2, 0, -0.12]}>
        <planeGeometry args={[0.2, 0.06]} />
        <meshStandardMaterial color="#c9a227" roughness={0.7} />
      </mesh>
      {/* sticky notes + small speaker puck + headphones on the riser */}
      <mesh position={[0.22, DESK_TOP + 0.003, -0.62]} rotation={[-Math.PI / 2, 0, 0.3]}>
        <planeGeometry args={[0.07, 0.07]} />
        <meshStandardMaterial color="#f2d36b" roughness={0.8} />
      </mesh>
      <mesh position={[-0.8, DESK_TOP + 0.045, -0.5]} castShadow>
        <cylinderGeometry args={[0.035, 0.038, 0.09, 24]} />
        <meshStandardMaterial color="#141618" roughness={0.5} />
      </mesh>
      <mesh position={[-0.32, DESK_TOP + 0.14, -0.7]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.07, 0.016, 10, 24, Math.PI]} />
        <meshStandardMaterial color="#141618" roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ── Whiteboard and chair ─────────────────────────────────────── */

function Whiteboard() {
  const board = useCanvasTexture(512, 380, drawWhiteboard, [])
  return (
    // on a mobile stand to the right of the desk, angled toward the room
    <group position={[1.72, 0.95, -0.5]} rotation={[0, -Math.PI / 2 + 0.25, 0]}>
      {[-0.56, 0.56].map((x) => (
        <group key={x}>
          <Rod from={[x, FLOOR_Y - 0.95 + 0.03, 0]} to={[x, 0.42, 0]} radius={0.012} color="#9aa1a8" />
          <Rod from={[x, FLOOR_Y - 0.95 + 0.03, -0.2]} to={[x, FLOOR_Y - 0.95 + 0.03, 0.2]} radius={0.012} color="#9aa1a8" />
          {[-0.2, 0.2].map((z) => (
            <mesh key={z} position={[x, FLOOR_Y - 0.95 + 0.012, z]}>
              <sphereGeometry args={[0.018, 12, 8]} />
              <meshStandardMaterial color="#111" roughness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh castShadow>
        <boxGeometry args={[1.18, 0.86, 0.02]} />
        <meshStandardMaterial color="#c9ced3" metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.011]}>
        <planeGeometry args={[1.14, 0.82]} />
        <meshStandardMaterial map={board} roughness={0.25} />
      </mesh>
      {/* marker tray + markers */}
      <mesh position={[0, -0.45, 0.03]}>
        <boxGeometry args={[0.5, 0.015, 0.05]} />
        <meshStandardMaterial color="#c9ced3" metalness={0.8} roughness={0.3} />
      </mesh>
      {['#1b1f24', '#b5482f'].map((col, i) => (
        <mesh key={col} position={[0.05 + i * 0.12, -0.435, 0.035]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.008, 0.008, 0.1, 10]} />
          <meshStandardMaterial color={col} roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

/** Racing-style gaming chair silhouette (width along x, height along y, origin at the bottom). */
function racingBackShape() {
  const sh = new THREE.Shape()
  sh.moveTo(-0.17, 0)
  sh.lineTo(0.17, 0)
  sh.quadraticCurveTo(0.23, 0.22, 0.25, 0.5) // flared side bolster
  sh.quadraticCurveTo(0.26, 0.62, 0.17, 0.67) // shoulder wing
  sh.lineTo(0.15, 0.71)
  sh.quadraticCurveTo(0.19, 0.86, 0, 0.9) // headrest
  sh.quadraticCurveTo(-0.19, 0.86, -0.15, 0.71)
  sh.lineTo(-0.17, 0.67)
  sh.quadraticCurveTo(-0.26, 0.62, -0.25, 0.5)
  sh.quadraticCurveTo(-0.23, 0.22, -0.17, 0)
  // belt slots in the headrest
  ;[-0.085, 0.085].forEach((x) => {
    const hole = new THREE.Path()
    hole.moveTo(x - 0.03, 0.735)
    hole.lineTo(x + 0.03, 0.735)
    hole.quadraticCurveTo(x + 0.04, 0.735, x + 0.04, 0.755)
    hole.lineTo(x + 0.04, 0.765)
    hole.quadraticCurveTo(x + 0.04, 0.785, x + 0.03, 0.785)
    hole.lineTo(x - 0.03, 0.785)
    hole.quadraticCurveTo(x - 0.04, 0.785, x - 0.04, 0.765)
    hole.lineTo(x - 0.04, 0.755)
    hole.quadraticCurveTo(x - 0.04, 0.735, x - 0.03, 0.735)
    sh.holes.push(hole)
  })
  return sh
}

function GamingChair() {
  const c = usePalette()
  const black = <meshPhysicalMaterial color="#141518" roughness={0.42} clearcoat={0.35} clearcoatRoughness={0.45} sheen={0.3} sheenColor="#3a3d42" />
  const accent = <meshPhysicalMaterial color={c.accent} roughness={0.4} clearcoat={0.3} />
  const backGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(racingBackShape(), { depth: 0.07, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 5, curveSegments: 18 })
    g.translate(0, 0, -0.035)
    return g
  }, [])
  useEffect(() => () => backGeo.dispose(), [backGeo])
  const seat = useRoundedSlab(0.48, 0.48, 0.1, 0.06, 0.025)
  const armPad = useRoundedSlab(0.26, 0.07, 0.03, 0.02, 0.008)

  // copper racing stripes down the backrest (thin strips on the front face)
  const stripes = [-0.105, 0.105]

  return (
    // pulled up to the keyboard, back toward the viewer (chair "front" faces −x locally)
    <group position={[0.02, 0, 0.36]} rotation={[0, -Math.PI / 2, 0]}>
      {/* bucket seat with raised side bolsters */}
      <mesh geometry={seat} position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, Math.PI / 2]}>
        {black}
      </mesh>
      {[1, -1].map((side) => (
        <group key={side}>
          <mesh position={[0.0, -0.37, 0.215 * side]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.04, 0.36, 6, 14]} />
            {black}
          </mesh>
          {/* copper piping along the bolster */}
          <mesh position={[0.0, -0.335, 0.215 * side]} rotation={[0, 0, Math.PI / 2]}>
            <capsuleGeometry args={[0.006, 0.36, 4, 8]} />
            {accent}
          </mesh>
        </group>
      ))}
      {/* copper insert on the seat */}
      <mesh position={[-0.02, -0.387, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, 0.06]} />
        {accent}
      </mesh>

      {/* tall racing backrest, reclined a touch */}
      <group position={[0.25, -0.4, 0]} rotation={[0, 0, -0.14]}>
        <mesh geometry={backGeo} rotation={[0, -Math.PI / 2, 0]}>
          {black}
        </mesh>
        {stripes.map((z) => (
          <mesh key={z} position={[-0.067, 0.34, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[0.035, 0.5]} />
            {accent}
          </mesh>
        ))}
        {/* the same stripes on the back, plus a copper logo badge on the headrest */}
        {stripes.map((z) => (
          <mesh key={`b${z}`} position={[0.067, 0.34, z]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.035, 0.5]} />
            {accent}
          </mesh>
        ))}
        <mesh position={[0.067, 0.64, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.032, 24]} />
          {accent}
        </mesh>
        {/* neck pillow + lumbar pillow */}
        <mesh position={[-0.085, 0.66, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.04, 0.16, 6, 14]} />
          {black}
        </mesh>
        <mesh position={[-0.09, 0.18, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.045, 0.22, 6, 14]} />
          {black}
        </mesh>
        <mesh position={[-0.12, 0.18, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.2, 0.012]} />
          {accent}
        </mesh>
      </group>
      {/* recline mechanism */}
      <Rod from={[0.17, -0.45, 0]} to={[0.24, -0.38, 0]} radius={0.02} color="#2a2d31" metalness={0.6} roughness={0.35} />

      {/* 4D armrests */}
      {[1, -1].map((side) => (
        <group key={side}>
          <Rod from={[0.06, -0.44, 0.27 * side]} to={[0.06, -0.2, 0.27 * side]} radius={0.016} color="#1b1d20" metalness={0.5} roughness={0.35} />
          <mesh geometry={armPad} position={[0.02, -0.19, 0.27 * side]} rotation={[-Math.PI / 2, 0, 0]}>
            {black}
          </mesh>
        </group>
      ))}

      {/* class-4 gas lift with a cover, aluminium five-star base, large casters */}
      <Rod from={[0, -0.86, 0]} to={[0, -0.47, 0]} radius={0.03} radiusEnd={0.024} color="#16181b" metalness={0.5} roughness={0.35} />
      <Rod from={[0, -0.6, 0]} to={[0, -0.5, 0]} radius={0.034} color={c.chrome} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3
        const end: V3 = [Math.cos(a) * 0.3, -0.87, Math.sin(a) * 0.3]
        return (
          <group key={i}>
            <Rod from={[0, -0.85, 0]} to={end} radius={0.02} radiusEnd={0.014} color="#16181b" metalness={0.6} roughness={0.3} />
            <mesh position={[end[0], -0.915, end[2]]} rotation={[Math.PI / 2, 0, a]}>
              <torusGeometry args={[0.022, 0.012, 10, 18]} />
              <meshStandardMaterial color="#0e0f11" roughness={0.4} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

/* ── Scene ────────────────────────────────────────────────────── */

export function Workstation({ shadows = false }: { shadows?: boolean }) {
  const root = useRef<THREE.Group>(null)

  // Opaque, lit meshes cast and receive real shadows when enabled.
  useEffect(() => {
    root.current?.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      const mat = m.material as THREE.Material
      const lit = !(mat instanceof THREE.MeshBasicMaterial) && !mat.transparent
      m.castShadow = shadows && lit
      m.receiveShadow = shadows && lit
    })
  }, [shadows])

  return (
    // viewed from the front-left, looking into the corner
    <group ref={root} position={[0.05, -0.5, 0]} rotation={[0, 0.55, 0]} scale={1.0}>
      <Room />
      <Shelves />
      <Whiteboard />
      <Desk />
      {/* real chair model (≈0.5 MB); the coded gaming chair is used only if it fails to load */}
      <ErrorBoundary fallback={<GamingChair />}>
        <>
          <group position={[0.02, FLOOR_Y, 0.36]} rotation={[0, CHAIR_YAW, 0]}>
            <ChairModel shadows={shadows} />
          </group>
        </>
      </ErrorBoundary>
      {/* the developer, seated at the keyboard (Developer faces −x, so turn it to face −z) */}
      {/* rigged avatar (≈0.5 MB), posed to sit and type; the coded developer is used only if it fails to load */}
      <ErrorBoundary fallback={<CodedDeveloper />}>
        <>
          <AvatarModel pose={AVATAR_POSE} shadows={shadows} />
        </>
      </ErrorBoundary>
    </group>
  )
}
