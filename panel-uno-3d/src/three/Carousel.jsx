// Carrusel 3D: anillo de portadas reales. Se mueve con el scroll, se arrastra con inercia y al tocar una se abre su detalle.
import { use, useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S, damp } from '../scroll/state'
import { assetsPromise } from './assets'
import { store } from '../store'
import { sfx } from '../audio'

const BW = 1.2, BH = 1.8, BT = 0.12
const drag = { off: 0, vel: 0, down: false, lastX: 0, lastT: 0 }

export default function Carousel({ comics }) {
  const A = use(assetsPromise)
  const N = comics.length
  const step = (Math.PI * 2) / N
  const R = 3.3
  const group = useRef()
  const slots = useRef([])
  const hover = useRef(-1)
  const hv = useRef(new Float32Array(64))

  const mats = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ map: A.edge, roughness: 0.95 })
    const dark = new THREE.MeshStandardMaterial({ color: '#2a2630', roughness: 0.7 })
    const back = new THREE.MeshPhysicalMaterial({ map: A.back, roughness: 0.5, clearcoat: 0.4 })
    const spine = new THREE.MeshPhysicalMaterial({ color: '#e8001c', roughness: 0.5, clearcoat: 0.4 })
    return comics.map((c) => ({
      front: new THREE.MeshPhysicalMaterial({
        map: A.covers[c.id] || A.hero, roughness: 0.4, clearcoat: 0.7, clearcoatRoughness: 0.25,
        iridescence: 0, iridescenceIOR: 1.35, iridescenceThicknessRange: [120, 700], bumpMap: A.bump, bumpScale: 0.25,
      }),
      holo: new THREE.MeshBasicMaterial({ map: A.rainbow, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }),
      list: [edge, spine, edge, edge, null, back], dark,
    }))
  }, [A, comics])
  mats.forEach((m) => { m.list[4] = m.front })

  // arrastre con el dedo/mouse (solo cuando el carrusel está en pantalla)
  useEffect(() => {
    const down = (e) => {
      if (!store.get().inCarousel || !(e.target instanceof HTMLCanvasElement)) return
      drag.down = true; drag.lastX = e.clientX; drag.lastT = performance.now()
    }
    const move = (e) => {
      if (!drag.down) return
      const now = performance.now(), dx = e.clientX - drag.lastX, dt = Math.max(1, now - drag.lastT) / 1000
      const k = 0.0075
      drag.off += dx * k
      drag.vel = THREE.MathUtils.lerp(drag.vel, (dx * k) / dt, 0.5)
      drag.lastX = e.clientX; drag.lastT = now
    }
    const up = () => { drag.down = false }
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointerdown', down); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
  }, [])

  useFrame((state, dt) => {
    const g = group.current
    const p = S.ring
    g.visible = p > 0.01
    if (!g.visible) return
    const e = 1 - Math.pow(1 - Math.min(1, p), 3)
    const fit = Math.min(1, S.vw / 3.4) * (0.35 + 0.65 * e) * (1 - 0.3 * S.sink)
    g.scale.setScalar(fit)
    g.position.set(0, S.ringY + 0.28 * Math.min(1, S.ring) + (1 - e) * -1.2 - S.sink * 2.6, -R * fit)
    g.rotation.x = 0.1
    // inercia
    if (!drag.down) { drag.off += drag.vel * dt; drag.vel *= Math.exp(-2.6 * dt) }
    const total = S.rr + drag.off
    const t = state.clock.elapsedTime
    let best = -2, bi = 0
    for (let i = 0; i < N; i++) {
      const s = slots.current[i]; if (!s) continue
      const ang = i * step + total
      const h = (hv.current[i] = damp(hv.current[i], hover.current === i ? 1 : 0, 9, dt))
      s.position.set(Math.sin(ang) * R, Math.sin(t * 0.8 + i * 1.7) * 0.06 + h * 0.08, Math.cos(ang) * R + h * 0.35)
      s.rotation.y = ang
      s.scale.setScalar(1 + h * 0.12)
      s.children[0].rotation.set(-state.pointer.y * 0.2 * h, state.pointer.x * 0.28 * h, 0)
      const m = mats[i]
      m.front.iridescence = h
      m.holo.opacity = h * 0.5
      const c = Math.cos(ang); if (c > best) { best = c; bi = i }
    }
    A.rainbow.offset.set(state.pointer.x * 0.35 + t * 0.03, state.pointer.y * 0.35)
    const sc = store.get()
    if (sc.focus !== bi) { store.set({ focus: bi }); sfx.tick() }
  })

  return (
    <group ref={group} visible={false}>
      {comics.map((c, i) => (
        <group key={c.id} ref={(el) => (slots.current[i] = el)}>
          <group>
            <mesh
              material={mats[i].list}
              onPointerOver={(e) => { e.stopPropagation(); hover.current = i; document.body.style.cursor = ''; store.set({ cursor: 'VER' }) }}
              onPointerOut={() => { if (hover.current === i) hover.current = -1; store.set({ cursor: '' }) }}
              onClick={(e) => { e.stopPropagation(); if (e.delta > 8) return; store.set({ selected: c.id }); sfx.whoosh() }}
            >
              <boxGeometry args={[BW, BH, BT]} />
            </mesh>
            <mesh position={[0, 0, BT / 2 + 0.002]} material={mats[i].holo} raycast={() => null}>
              <planeGeometry args={[BW, BH]} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}
