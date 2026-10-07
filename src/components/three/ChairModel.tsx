import { useLoader } from '@react-three/fiber'
import { useEffect, useMemo } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js'

/**
 * Gaming chair loaded from a glTF model (public/models/gaming-chair.glb).
 *
 * The original download was 27 MB; it was optimised with gltf-transform
 * (1K WebP textures, simplified mesh, meshopt compression) to ~0.5 MB.
 * The model is in metres with its base at y = 0.
 */
export const CHAIR_URL = '/models/gaming-chair.glb'

/** Scene units per metre (desk top ≈ 0.75 m above the floor ≈ 0.97 units). */
const UNITS_PER_METRE = 1.29

export function ChairModel({ shadows = false }: { shadows?: boolean }) {
  const gltf = useLoader(GLTFLoader, CHAIR_URL, (loader) => {
    loader.setMeshoptDecoder(MeshoptDecoder)
  })
  const scene = useMemo(() => gltf.scene.clone(true), [gltf])

  useEffect(() => {
    scene.traverse((o) => {
      const m = o as THREE.Mesh
      if (!m.isMesh) return
      m.castShadow = shadows
      m.receiveShadow = shadows
    })
  }, [scene, shadows])

  return <primitive object={scene} scale={UNITS_PER_METRE} />
}
