// El cómic "Panel Uno #1": tapa dura que se abre y páginas que se pasan con el scroll.
import { use, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, smoothstep } from '../scroll/state'
import { assetsPromise } from './assets'
import { sfx } from '../audio'

const W = 1.5, H = 2.2, TH = 0.2, CT = 0.03, N = 10, SEG = 16
const PW = W - 0.06, PH = H - 0.08
const SP = (TH - 2 * CT - 0.02) / N
const Z0 = TH - CT - 0.012 // z de la página de arriba
const FLIP_SPAN = (N - 1) * 0.5 + 1.8

function pageGeometry() {
  const g = new THREE.BufferGeometry()
  const cols = SEG + 1, pos = new Float32Array(cols * 2 * 3), uv = new Float32Array(cols * 2 * 2), idx = []
  for (let r = 0; r < 2; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c
    pos[i * 3 + 1] = r === 0 ? PH / 2 : -PH / 2
    uv[i * 2] = c / SEG; uv[i * 2 + 1] = r === 0 ? 1 : 0
  }
  for (let c = 0; c < SEG; c++) { const a = c, b = c + 1, d = cols + c, e = cols + c + 1; idx.push(a, d, b, b, d, e) }
  g.setIndex(idx)
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2))
  return g
}

// Curva de la página: el borde libre se adelanta al levantar y se atrasa al caer.
function bend(geo, f, off) {
  const p = geo.attributes.position.array, cols = SEG + 1, ds = PW / SEG
  const a = Math.PI * smoothstep(f), lead = 0.8 * Math.sin(2 * Math.PI * f)
  let x = 0.01, z = 0
  for (let c = 0; c < cols; c++) {
    const u = c / SEG
    const phi = Math.min(Math.PI, Math.max(0, a + lead * u))
    if (c > 0) { x += ds * Math.cos(phi); z += ds * Math.sin(phi) }
    const X = x - Math.sin(phi) * off, Z = z + Math.cos(phi) * off
    for (let r = 0; r < 2; r++) { const i = (r * cols + c) * 3; p[i] = X; p[i + 2] = Z }
  }
  geo.attributes.position.needsUpdate = true
  geo.computeVertexNormals()
  geo.computeBoundingSphere()
}

export default function HeroComic({ high }) {
  const A = use(assetsPromise)
  const root = useRef(), rot = useRef(), inner = useRef(), coverHinge = useRef(), blob = useRef(), blockR = useRef(), blockL = useRef()
  const pageRefs = useRef([])
  const lastCount = useRef(0)

  const M = useMemo(() => {
    const paper = { roughness: 0.92, bumpMap: A.bump, bumpScale: 0.6 }
    const edge = (rep) => { const t = A.edge.clone(); t.repeat.set(1, rep); t.needsUpdate = true; return new THREE.MeshStandardMaterial({ map: t, roughness: 0.95 }) }
    const hide = new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false })
    const flipTex = (t) => { const c = t.clone(); c.wrapS = THREE.RepeatWrapping; c.repeat.x = -1; c.offset.x = 1; c.needsUpdate = true; return c }
    const side = new THREE.MeshStandardMaterial({ color: '#2a2630', roughness: 0.7 })
    return {
      coverFront: new THREE.MeshPhysicalMaterial({ map: A.hero, roughness: 0.46, clearcoat: 0.6, clearcoatRoughness: 0.3, bumpMap: A.bump, bumpScale: 0.25, envMapIntensity: 0.9 }),
      inner: new THREE.MeshStandardMaterial({ map: A.inner, ...paper }),
      back: new THREE.MeshPhysicalMaterial({ map: A.back, roughness: 0.5, clearcoat: 0.4 }),
      side,
      spine: new THREE.MeshPhysicalMaterial({ map: A.spine, roughness: 0.5, clearcoat: 0.5 }),
      front: A.pages.map((t) => new THREE.MeshStandardMaterial({ map: t, ...paper })),
      backFace: A.pages.map((t) => new THREE.MeshStandardMaterial({ map: flipTex(t), side: THREE.BackSide, ...paper })),
      blockR: [edge(1), edge(1), edge(0.2), edge(0.2), hide, hide],
      blockL: [edge(1), edge(1), edge(0.2), edge(0.2), hide, hide],
    }
  }, [A])
  const geos = useMemo(() => Array.from({ length: N }, () => { const g = pageGeometry(); return g }), [])
  const cache = useRef(new Float32Array(N).fill(-1))

  useFrame((state) => {
    const g = root.current
    const vw = S.vw, openE = smoothstep(S.open)
    // Escala por ancho de pantalla: cerrado entra en vertical, abierto ocupa el doble
    const portrait = S.vh > S.vw * 1.1
    const fit = Math.min(1.12, THREE.MathUtils.lerp(vw / (portrait ? 2.7 : 2.1), vw / 3.7, openE))
    g.position.set(S.x, S.y + (portrait ? 0.35 + 0.6 * openE : 0), 0)
    g.scale.setScalar(S.scale * fit)
    g.visible = S.scale > 0.03
    if (!g.visible) return
    const t = state.clock.elapsedTime
    const idle = 1 - Math.min(1, S.p * 1.4)
    rot.current.rotation.set(
      S.rotX + state.pointer.y * -0.1 + Math.sin(t * 0.7) * 0.03,
      S.rotY + Math.sin(t * 0.35) * 0.18 * idle + state.pointer.x * 0.22,
      S.rotZ
    )
    rot.current.position.y = Math.sin(t * 0.9) * 0.05 * (1 - openE * 0.6)
    inner.current.position.x = -(W / 2) * (1 - openE)
    coverHinge.current.rotation.y = -Math.PI * openE * 0.998
    // páginas
    const tt = S.flip * FLIP_SPAN
    let sum = 0
    for (let k = 0; k < N; k++) {
      const f = Math.min(1, Math.max(0, (tt - k * 0.5) / 1.8))
      sum += smoothstep(f)
      if (Math.abs(cache.current[k] - f) > 1e-4) { cache.current[k] = f; bend(geos[k], f, Z0 - k * SP - TH / 2) }
    }
    const count = sum
    const c = Math.floor(count + 0.2)
    if (c !== lastCount.current) { if (S.p > 0.2 && S.p < 3.2) sfx.flip(); lastCount.current = c }
    const dR = Math.max(0.001, Z0 + 0.005 - 0.04 - count * SP), dL = count * SP + 0.005
    blockR.current.scale.z = dR; blockR.current.position.z = 0.04 + dR / 2
    blockL.current.scale.z = dL; blockL.current.position.z = 0.04 + dL / 2
    blockL.current.visible = count > 0.02
    // sombra blanda
    blob.current.material.opacity = 0.5 * (1 - openE * 0.35)
    blob.current.scale.set(2.6 + openE * 2.2, 1.7, 1)
  })

  return (
    <group ref={root}>
      <mesh ref={blob} position={[0, -1.75, -0.4]} rotation={[-Math.PI / 2 + 0.25, 0, 0]} renderOrder={-1}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial map={A.blob} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      <group ref={rot}>
        <group ref={inner}>
          {/* contratapa */}
          <mesh position={[W / 2, 0, CT / 2]} material={[M.side, M.side, M.side, M.side, M.inner, M.back]}>
            <boxGeometry args={[W, H, CT]} />
          </mesh>
          {/* lomo redondeado */}
          <mesh position={[0, 0, TH / 2]} scale={[0.35, 1, 1]} material={M.spine}>
            <cylinderGeometry args={[TH / 2, TH / 2, H, 24, 1, false, Math.PI, Math.PI]} />
          </mesh>
          {/* cantos de páginas (derecha e izquierda) */}
          <mesh ref={blockR} position={[0.01 + (PW - 0.02) / 2, 0, 0.1]} material={M.blockR}>
            <boxGeometry args={[PW - 0.02, PH - 0.02, 1]} />
          </mesh>
          <mesh ref={blockL} position={[-0.01 - (PW - 0.02) / 2, 0, 0.1]} material={M.blockL}>
            <boxGeometry args={[PW - 0.02, PH - 0.02, 1]} />
          </mesh>
          {/* páginas */}
          <group position={[0, 0, TH / 2]}>
            {geos.map((geo, k) => (
              <group key={k}>
                <mesh geometry={geo} material={M.front[k % M.front.length]} />
                <mesh geometry={geo} material={M.backFace[(k + 3) % M.backFace.length]} />
              </group>
            ))}
          </group>
          {/* tapa */}
          <group ref={coverHinge} position={[0, 0, TH / 2]}>
            <mesh position={[W / 2, 0, TH / 2 - CT / 2]} material={[M.side, M.side, M.side, M.side, M.coverFront, M.inner]}>
              <boxGeometry args={[W, H, CT]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  )
}
