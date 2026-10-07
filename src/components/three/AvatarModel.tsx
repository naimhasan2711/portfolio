import { useFrame, useLoader } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js'

/**
 * Rigged avatar (public/models/avatar.glb), posed procedurally so it sits in
 * the chair and types. The model ships in a T-pose with no animations, so the
 * pose is solved every frame with simple two-bone IK:
 *   • arms reach the keyboard, elbows hanging down and out
 *   • legs reach the floor in front of the chair, knees forward
 *   • fingers aim at the keys and tap on their own rhythms
 *
 * All targets are given in the parent (workstation) space and converted
 * to world space at runtime, so the scene can rotate / zoom freely.
 */
export const AVATAR_URL = '/models/avatar.glb'

const UNITS_PER_METRE = 1.29
const P = 'Fbx01_'

type V3 = [number, number, number]

export interface AvatarPose {
  /** Where the pelvis sits (workstation space). */
  pelvis: V3
  /** Wrist targets for the left / right hand (workstation space). */
  leftHand: V3
  rightHand: V3
  /** Ankle targets (workstation space). */
  leftFoot: V3
  rightFoot: V3
  /** Height of the key tops (workstation space y). */
  keysY: number
  /** Direction the avatar faces (workstation space, e.g. [0, 0, -1]). */
  facing: V3
  /** How far the shoulders sit ahead of (+) or behind (−) the pelvis. */
  recline: number
}

/* ── tiny IK helpers (world space) ─────────────────────────────── */

const _a = new THREE.Vector3()
const _b = new THREE.Vector3()
const _c = new THREE.Vector3()
const _q = new THREE.Quaternion()
const _qw = new THREE.Quaternion()
const _qp = new THREE.Quaternion()

/** Rotates `bone` so that the direction to `child` points at `target`. */
function aim(bone: THREE.Object3D, child: THREE.Object3D, target: THREE.Vector3, weight = 1) {
  bone.updateWorldMatrix(true, true)
  const from = bone.getWorldPosition(_a)
  const cur = child.getWorldPosition(_b).sub(from).normalize()
  const want = _c.copy(target).sub(from).normalize()
  if (cur.lengthSq() < 1e-8 || want.lengthSq() < 1e-8) return
  _q.setFromUnitVectors(cur, want)
  if (weight < 1) _q.slerp(new THREE.Quaternion(), 1 - weight)
  bone.getWorldQuaternion(_qw)
  _qw.premultiply(_q)
  bone.parent?.getWorldQuaternion(_qp)
  bone.quaternion.copy(_qp.invert().multiply(_qw))
  bone.updateWorldMatrix(false, true)
}

/** Analytic two-bone IK: root → mid → end reaches `target`, bending toward `pole`. */
function twoBone(root: THREE.Object3D, mid: THREE.Object3D, end: THREE.Object3D, target: THREE.Vector3, pole: THREE.Vector3) {
  root.updateWorldMatrix(true, true)
  const S = root.getWorldPosition(new THREE.Vector3())
  const M = mid.getWorldPosition(new THREE.Vector3())
  const E = end.getWorldPosition(new THREE.Vector3())
  const a = S.distanceTo(M)
  const b = M.distanceTo(E)
  const toT = target.clone().sub(S)
  const d = THREE.MathUtils.clamp(toT.length(), Math.abs(a - b) + 1e-4, a + b - 1e-4)
  const u = toT.normalize()
  const x = (a * a - b * b + d * d) / (2 * d)
  const h = Math.sqrt(Math.max(a * a - x * x, 0))
  const p = pole.clone().sub(u.clone().multiplyScalar(pole.dot(u))).normalize()
  const elbow = S.clone().add(u.clone().multiplyScalar(x)).add(p.multiplyScalar(h))
  aim(root, mid, elbow)
  aim(mid, end, S.clone().add(u.multiplyScalar(d)))
}

/**
 * Procedural eye material. The iris faces the model's +z (forward) direction;
 * colour is chosen from the angle between the surface point and that axis.
 */
export function makeEyeMaterial(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox()
  const center = geometry.boundingBox!.getCenter(new THREE.Vector3())
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.25, metalness: 0 })
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uEyeCenter = { value: center }
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nuniform vec3 uEyeCenter;\nvarying vec3 vEyeDir;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvEyeDir = normalize(position - uEyeCenter);')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vEyeDir;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        float a = acos(clamp(normalize(vEyeDir).z, -1.0, 1.0));
        vec3 sclera = vec3(0.84, 0.8, 0.76);
        vec3 irisOuter = vec3(0.13, 0.07, 0.04);
        vec3 irisInner = vec3(0.34, 0.2, 0.1);
        vec3 iris = mix(irisInner, irisOuter, smoothstep(0.2, 0.5, a));
        vec3 col = mix(iris, sclera, smoothstep(0.5, 0.56, a));
        col = mix(vec3(0.02), col, smoothstep(0.19, 0.23, a));
        // soft shading toward the corners of the eye
        col *= mix(1.0, 0.82, smoothstep(0.9, 1.4, a));
        diffuseColor.rgb = col;`,
      )
  }
  return mat
}

/* ── component ─────────────────────────────────────────────────── */

export function AvatarModel({ pose, shadows = false, children }: { pose: AvatarPose; shadows?: boolean; children?: ReactNode }) {
  const gltf = useLoader(GLTFLoader, AVATAR_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder)
  })
  const scene = useMemo(() => cloneSkinned(gltf.scene), [gltf])
  const holder = useRef<THREE.Group>(null)
  const headAnchor = useRef<THREE.Group>(null)

  const rig = useMemo(() => {
    const get = (n: string) => scene.getObjectByName(P + n) ?? null
    const find = (prefix: string) => {
      let hit: THREE.Object3D | null = null
      scene.traverse((o) => {
        if (!hit && o.name.startsWith(P + prefix)) hit = o
      })
      return hit as THREE.Object3D | null
    }
    const finger = (side: 'L' | 'R', i: number) => ({
      base: find(`${side}_Finger${i}_`),
      mid: find(`${side}_Finger${i}1_`),
      tip: find(`${side}_Finger${i}2_`),
      nub: find(`${side}_Finger${i}Nub_`),
    })
    const bones = {
      pelvis: find('Pelvis_'),
      spine1: find('Spine1_'),
      spine2: find('Spine2_'),
      head: find('Head_'),
      neck: find('Neck_'),
      L: { upper: find('L_UpperArm_'), fore: find('L_Forearm_'), hand: find('L_Hand_'), thigh: find('L_Thigh_'), calf: find('L_Calf_'), foot: find('L_Foot_'), toe: find('L_Toe0_') },
      R: { upper: find('R_UpperArm_'), fore: find('R_Forearm_'), hand: find('R_Hand_'), thigh: find('R_Thigh_'), calf: find('R_Calf_'), foot: find('R_Foot_'), toe: find('R_Toe0_') },
      fingers: { L: [1, 2, 3, 4].map((i) => finger('L', i)), R: [1, 2, 3, 4].map((i) => finger('R', i)) },
      thumbs: { L: finger('L', 0), R: finger('R', 0) },
    }
    void get
    // remember the rest pose so every frame starts from the same state
    const rest = new Map<THREE.Object3D, THREE.Quaternion>()
    scene.traverse((o) => {
      if ((o as THREE.Bone).isBone) rest.set(o, o.quaternion.clone())
    })
    return { bones, rest }
  }, [scene])

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      // The visible eye surface is the "Eye_trans" shell, exported as flat grey
      // (white "zombie" eyes). Paint a procedural eye on it: pupil, brown iris, sclera.
      if ((m.material as THREE.Material).name === 'Eye_trans') {
        m.material = makeEyeMaterial(m.geometry)
        m.castShadow = false
        m.receiveShadow = false
        m.frustumCulled = false
        return
      }
      m.castShadow = shadows
      m.receiveShadow = shadows
      m.frustumCulled = false // skinned bounds don't follow the procedural pose
    })
  }, [scene, shadows])

  // Place the model so its pelvis lands on the seat (computed once, in rest pose).
  const offset = useMemo(() => {
    scene.updateMatrixWorld(true)
    const pelvis = rig.bones.pelvis
    const p = pelvis ? pelvis.getWorldPosition(new THREE.Vector3()) : new THREE.Vector3(0, 0.95, 0)
    return p
  }, [scene, rig])

  const yaw = Math.atan2(-pose.facing[0], -pose.facing[2]) + Math.PI // model faces +z

  useFrame(({ clock }) => {
    const h = holder.current
    if (!h?.parent) return
    const t = clock.getElapsedTime()
    const { bones, rest } = rig
    rest.forEach((q, b) => b.quaternion.copy(q))
    h.updateWorldMatrix(true, true)

    const toWorld = (v: V3 | THREE.Vector3) => (v instanceof THREE.Vector3 ? v.clone() : new THREE.Vector3(...v)).applyMatrix4(h.parent!.matrixWorld)
    const dirToWorld = (v: V3) => new THREE.Vector3(...v).transformDirection(h.parent!.matrixWorld)
    const fwd = new THREE.Vector3(...pose.facing).normalize()
    const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0)).normalize()

    // reclined against the backrest, with gentle breathing
    if (bones.spine1 && bones.head) {
      const lean = new THREE.Vector3(...pose.pelvis).add(new THREE.Vector3(0, 0.9, 0)).addScaledVector(fwd, pose.recline + Math.sin(t * 1.1) * 0.006)
      aim(bones.spine1, bones.head, toWorld(lean), 0.85)
    }

    // legs: knees forward, feet flat in front of the chair
    for (const side of ['L', 'R'] as const) {
      const leg = bones[side]
      if (!leg.thigh || !leg.calf || !leg.foot) continue
      const foot = side === 'L' ? pose.leftFoot : pose.rightFoot
      twoBone(leg.thigh, leg.calf, leg.foot, toWorld(foot), dirToWorld([fwd.x, 0.6, fwd.z]))
      if (leg.toe) aim(leg.foot, leg.toe, toWorld(new THREE.Vector3(...foot).addScaledVector(fwd, 0.25).setY(foot[1] - 0.04)))
    }

    // arms + hands: wrists drift over the keys, elbows hang down and out
    for (const side of ['L', 'R'] as const) {
      const arm = bones[side]
      if (!arm.upper || !arm.fore || !arm.hand) continue
      const s = side === 'L' ? -1 : 1
      const base = new THREE.Vector3(...(side === 'L' ? pose.leftHand : pose.rightHand))
      const drift = right.clone().multiplyScalar(Math.sin(t * 0.55 + s * 1.3) * 0.025).addScaledVector(fwd, Math.sin(t * 1.7 + s) * 0.01)
      const wrist = base.add(drift).setY(base.y + Math.max(0, Math.sin(t * 0.8 + s)) * 0.012)
      const pole = dirToWorld([right.x * s * 0.6, -1, right.z * s * 0.6])
      twoBone(arm.upper, arm.fore, arm.hand, toWorld(wrist), pole)

      // palm points along the keyboard, fingers toward the far keys
      const fingers = bones.fingers[side]
      const middle = fingers[1]?.base
      if (middle) aim(arm.hand, middle, toWorld(wrist.clone().addScaledVector(fwd, 0.12).setY(pose.keysY + 0.03)))

      fingers.forEach((f, i) => {
        if (!f.base || !f.mid || !f.tip) return
        const rate = 5.5 + ((i * 7 + (s > 0 ? 3 : 5)) % 5) * 0.9
        const press = Math.pow(Math.max(0, Math.sin(t * rate + i * 2.17 + (s > 0 ? 0 : 1.3))), 10)
        const spread = (i - 1.5) * 0.028 * (s > 0 ? 1 : -1)
        const keyPoint = wrist.clone().addScaledVector(fwd, 0.17).addScaledVector(right, spread)
        keyPoint.y = pose.keysY + 0.012 - press * 0.012
        aim(f.base, f.mid, toWorld(keyPoint.clone().addScaledVector(fwd, -0.03).setY(keyPoint.y + 0.02)))
        aim(f.mid, f.tip, toWorld(keyPoint))
        if (f.nub) aim(f.tip, f.nub, toWorld(keyPoint.clone().addScaledVector(fwd, 0.02).setY(keyPoint.y - 0.02)))
      })
      const thumb = bones.thumbs[side]
      if (thumb.base && thumb.mid) {
        const press = Math.pow(Math.max(0, Math.sin(t * 2.4 + s)), 14)
        const tp = wrist.clone().addScaledVector(fwd, 0.1).addScaledVector(right, -s * 0.03)
        tp.y = pose.keysY + 0.01 - press * 0.01
        aim(thumb.base, thumb.mid, toWorld(tp))
      }
    }

    // head: tilted forward to look at the monitors (more when reclined), small nod
    if (bones.head && bones.neck) {
      bones.head.rotateOnWorldAxis(right.clone().transformDirection(h.parent.matrixWorld), 0.12 + Math.sin(t * 0.7) * 0.03)
    }

    // keep the headset (or anything passed as children) locked to the head
    if (headAnchor.current && bones.head) {
      bones.head.updateWorldMatrix(true, false)
      const p = bones.head.getWorldPosition(new THREE.Vector3())
      headAnchor.current.position.copy(h.parent.worldToLocal(p))
    }
  })

  const s = UNITS_PER_METRE
  return (
    <>
      <group ref={holder} position={pose.pelvis} rotation={[0, yaw, 0]}>
        <primitive object={scene} scale={s} position={[-offset.x * s, -offset.y * s, -offset.z * s]} />
      </group>
      <group ref={headAnchor} rotation={[0, yaw, 0]}>
        {children}
      </group>
    </>
  )
}
