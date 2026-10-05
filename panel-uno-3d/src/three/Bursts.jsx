// Onomatopeyas 3D (POW! BAM! ZAP!), viñetas flotantes y confeti que entran desde los costados al scrollear.
import { use, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Center, Text3D } from '@react-three/drei'
import * as THREE from 'three'
import font from 'three/examples/fonts/helvetiker_bold.typeface.json'
import { S, damp } from '../scroll/state'
import { assetsPromise } from './assets'
import { rngOf } from './textures'
import { store } from '../store'
import { sfx } from '../audio'

const BURSTS = [
  { t: 'POW!', side: -1, y: 1.15, z: 0.5, rot: 0.2, a: '#ffd600', b: '#e8001c', ink: '#0d0b0e', seed: 1 },
  { t: 'BAM!', side: 1, y: 0.1, z: 0.7, rot: -0.16, a: '#e8001c', b: '#ffd600', ink: '#ffffff', seed: 2 },
  { t: 'ZAP!', side: -1, y: -0.55, z: 0.3, rot: 0.1, a: '#ffffff', b: '#0057d9', ink: '#0d0b0e', seed: 3 },
]
const PANELS = [
  { side: -1, y: 1.6, z: -0.6, rot: 0.35, s: 0.9 }, { side: 1, y: 1.5, z: -0.4, rot: -0.3, s: 0.8 },
  { side: -1, y: -0.3, z: -1.2, rot: 0.5, s: 0.7 }, { side: 1, y: -1.5, z: -0.8, rot: -0.4, s: 1 },
  { side: -1, y: -1.9, z: -0.2, rot: 0.25, s: 0.7 },
]

function burstShape(seed, outer = 1, inner = 0.68, n = 13) {
  const r = rngOf(seed * 17), sh = new THREE.Shape()
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, rad = (i % 2 ? inner : outer) * (1 + (r() - 0.5) * 0.16)
    const x = Math.cos(a) * rad, y = Math.sin(a) * rad * 0.8
    i ? sh.lineTo(x, y) : sh.moveTo(x, y)
  }
  sh.closePath()
  return sh
}

// pool de confeti (compartido): emitConfetti(x,y,z) lo dispara
const confettiQueue = []
export const emitConfetti = (x, y, z) => confettiQueue.push([x, y, z])

const eb = (t) => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2) }

export default function Bursts() {
  const A = use(assetsPromise)
  const burstRefs = useRef([]), panelRefs = useRef([]), pops = useRef(new Float32Array(BURSTS.length))
  const dots = useRef(), conf = useRef()
  const shapes = useMemo(() => BURSTS.map((b) => ({
    front: new THREE.ExtrudeGeometry(burstShape(b.seed), { depth: 0.16, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 1 }),
    back: new THREE.ExtrudeGeometry(burstShape(b.seed, 1.1, 0.76), { depth: 0.1, bevelEnabled: false, curveSegments: 1 }),
  })), [])
  const tmp = useMemo(() => new THREE.Object3D(), [])
  const amb = useMemo(() => Array.from({ length: 70 }, (_, i) => { const r = rngOf(i + 3); return { x: (r() - 0.5) * 9, y: (r() - 0.5) * 5, z: -1.5 + r() * 2.5, s: 0.5 + r() * 1.3, sp: 0.1 + r() * 0.25, ph: r() * 6.28 } }), [])
  const parts = useMemo(() => Array.from({ length: 320 }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), life: 0, rot: 0, rv: 0, s: 1 })), [])
  const pi = useRef(0)
  const col = useMemo(() => new THREE.Color(), [])

  useEffect(() => {
    const palette = ['#ffd600', '#e8001c', '#0057d9', '#ffffff', '#2bb673', '#ff8a00']
    for (let i = 0; i < parts.length; i++) { col.set(palette[i % palette.length]); conf.current.setColorAt(i, col) }
    const dc = ['#ffd600', '#e8001c', '#ffffff', '#0057d9']
    for (let i = 0; i < amb.length; i++) { col.set(dc[i % 4]); dots.current.setColorAt(i, col) }
    conf.current.instanceColor.needsUpdate = true; dots.current.instanceColor.needsUpdate = true
  }, [parts, amb, col])

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    const bx = Math.min(1, Math.max(0, S.bx)), vw = S.vw
    const sc = Math.min(1, vw / 5.4) * 0.95
    const e = eb(bx)
    BURSTS.forEach((b, i) => {
      const g = burstRefs.current[i]; if (!g) return
      pops.current[i] = damp(pops.current[i], 0, 5, dt)
      const rest = b.side * Math.max(0.8, vw / 2 - 1.05 * sc), out = b.side * (vw / 2 + 2.6)
      g.visible = bx > 0.002
      g.position.set(THREE.MathUtils.lerp(out, rest, e), b.y * Math.min(1, vw / 3) + Math.sin(t * 1.1 + i) * 0.06, b.z)
      g.rotation.set(0.08 * Math.sin(t + i), b.side * -0.35 * (1 - bx), b.rot + Math.sin(t * 0.9 + i) * 0.05 + (1 - bx) * b.side * 0.8)
      g.scale.setScalar(sc * (0.9 + pops.current[i] * 0.35) * (0.4 + 0.6 * bx))
    })
    PANELS.forEach((p, i) => {
      const g = panelRefs.current[i]; if (!g) return
      const b = Math.min(1, Math.max(0, (bx - 0.1 * i) / (1 - 0.1 * i)))
      const ee = eb(b), rest = p.side * Math.max(1.4, vw / 2 - 0.5 * sc), out = p.side * (vw / 2 + 2.2)
      g.visible = bx > 0.002
      g.position.set(THREE.MathUtils.lerp(out, rest, ee), p.y * Math.min(1, vw / 3.5) + Math.sin(t * 0.8 + i * 2) * 0.1, p.z)
      g.rotation.set(0.1 * Math.sin(t * 0.6 + i), p.rot * (0.6 + 0.4 * Math.sin(t * 0.5 + i)), p.rot * 0.4)
      g.scale.setScalar(p.s * sc * 1.15 * (0.3 + 0.7 * b))
    })
    // puntos de trama flotando (ambiente)
    const d = dots.current
    d.visible = bx > 0.002
    amb.forEach((a, i) => {
      tmp.position.set(a.x * Math.max(0.5, vw / 5.5), ((a.y + t * a.sp + 3) % 6) - 3, a.z)
      tmp.scale.setScalar(a.s * bx * 0.9 * (0.6 + 0.4 * Math.sin(t * 2 + a.ph)))
      tmp.updateMatrix(); d.setMatrixAt(i, tmp.matrix)
    })
    d.instanceMatrix.needsUpdate = true
    // confeti
    while (confettiQueue.length) {
      const [x, y, z] = confettiQueue.shift()
      for (let k = 0; k < 90; k++) {
        const q = parts[pi.current++ % parts.length], th = Math.random() * 6.28, ph = Math.random() * 3.14, sp = 1.5 + Math.random() * 3.6
        q.p.set(x, y, z); q.v.set(Math.sin(ph) * Math.cos(th) * sp, Math.cos(ph) * sp + 1.2, Math.sin(ph) * Math.sin(th) * sp * 0.6)
        q.life = 1.4 + Math.random() * 1.2; q.rot = Math.random() * 6; q.rv = (Math.random() - 0.5) * 12; q.s = 0.7 + Math.random() * 0.9
      }
    }
    const c = conf.current
    parts.forEach((q, i) => {
      if (q.life > 0) {
        q.life -= dt; q.v.y -= 4.5 * dt; q.v.multiplyScalar(1 - 1.1 * dt); q.p.addScaledVector(q.v, dt); q.rot += q.rv * dt
        tmp.position.copy(q.p); tmp.rotation.set(q.rot, q.rot * 0.7, q.rot * 1.3); tmp.scale.setScalar(q.s * Math.min(1, q.life * 2))
      } else tmp.scale.setScalar(0)
      tmp.updateMatrix(); c.setMatrixAt(i, tmp.matrix)
    })
    c.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      {BURSTS.map((b, i) => (
        <group
          key={b.t} ref={(el) => (burstRefs.current[i] = el)} visible={false}
          onPointerOver={(e) => { e.stopPropagation(); store.set({ cursor: '¡TOCÁ!' }) }}
          onPointerOut={() => store.set({ cursor: '' })}
          onClick={(e) => {
            e.stopPropagation()
            pops.current[i] = 1
            const w = burstRefs.current[i].getWorldPosition(new THREE.Vector3())
            emitConfetti(w.x, w.y, w.z + 0.3); sfx.pow()
          }}
        >
          <mesh geometry={shapes[i].back} position={[0.07, -0.08, -0.14]}><meshStandardMaterial color="#0d0b0e" roughness={0.6} /></mesh>
          <mesh geometry={shapes[i].front} position={[0, 0, -0.08]}><meshPhysicalMaterial color={b.a} roughness={0.35} clearcoat={0.8} clearcoatRoughness={0.2} /></mesh>
          <Center position={[0, 0, 0.14]} rotation={[0, 0, 0.08]}>
            <Text3D font={font} size={0.46} height={0.1} bevelEnabled bevelSize={0.014} bevelThickness={0.025} bevelSegments={3} curveSegments={5} letterSpacing={0.03}>
              {b.t}
              <meshPhysicalMaterial color={b.b} roughness={0.3} clearcoat={0.9} clearcoatRoughness={0.15} />
            </Text3D>
          </Center>
        </group>
      ))}
      {PANELS.map((p, i) => (
        <group key={i} ref={(el) => (panelRefs.current[i] = el)} visible={false}>
          <mesh position={[0, 0, -0.03]}><boxGeometry args={[1.5, 1.14, 0.05]} /><meshStandardMaterial color="#0d0b0e" roughness={0.6} /></mesh>
          <mesh><planeGeometry args={[1.38, 1.02]} /><meshStandardMaterial map={A.panels[i % A.panels.length]} roughness={0.7} /></mesh>
        </group>
      ))}
      <instancedMesh ref={dots} args={[null, null, amb.length]} frustumCulled={false}>
        <circleGeometry args={[0.04, 12]} /><meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={conf} args={[null, null, parts.length]} frustumCulled={false}>
        <planeGeometry args={[0.1, 0.06]} /><meshBasicMaterial side={THREE.DoubleSide} toneMapped={false} />
      </instancedMesh>
    </>
  )
}
