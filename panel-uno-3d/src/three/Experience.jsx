import { Suspense, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, SMAA } from '@react-three/postprocessing'
import { S, damp } from '../scroll/state'
import { readTarget } from '../scroll/progress'
import { sample } from '../scroll/keyframes'
import { store, useStore } from '../store'
import HeroComic from './HeroComic'
import Carousel from './Carousel'
import Bursts from './Bursts'
import Fog from './Fog'

const reduce = typeof window !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export default function Experience({ tier, comics }) {
  const { viewport, camera } = useThree()
  const theme = useStore((s) => s.theme)
  const high = tier === 'high'
  const first = useRef(true)

  // Cálculo único por frame (prioridad baja = corre antes que los demás useFrame)
  useFrame((state, dt) => {
    const target = readTarget()
    S.p = reduce || first.current ? target : damp(S.p, target, 6, dt)
    first.current = false
    sample(S.p, undefined, S)
    S.vw = viewport.width; S.vh = viewport.height; S.theme = store.get().theme
    camera.position.z = S.cam
    const inC = Math.abs(S.p - 3) < 0.9 && S.ring > 0.5
    if (store.get().inCarousel !== inC) store.set({ inCarousel: inC })
  }, -10)

  const dark = theme === 'dark'
  return (
    <>
      <Environment resolution={high ? 512 : 256} frames={1}>
        <Lightformer form="rect" intensity={3.2} position={[3, 4, 5]} scale={[7, 3, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.6} color="#ffe2b4" position={[-6, 1, -2]} scale={[3, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={1.4} color="#bcd0ff" position={[6, 0, -3]} scale={[2, 6, 1]} target={[0, 0, 0]} />
        <Lightformer form="ring" intensity={2.2} position={[0, 6, 0]} scale={4} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.7} color="#ffd9a0" position={[0, -4, 3]} scale={[8, 2, 1]} target={[0, 0, 0]} />
      </Environment>
      <directionalLight position={[3, 5, 4]} intensity={dark ? 1.1 : 1.5} />
      <ambientLight intensity={dark ? 0.12 : 0.2} />
      <Suspense fallback={null}>
        <HeroComic high={high} />
        <Bursts />
        <Carousel comics={comics} />
      </Suspense>
      <Fog />
      {high && (
        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom mipmapBlur luminanceThreshold={0.95} intensity={0.22} />
          <Noise opacity={0.03} premultiply />
        </EffectComposer>
      )}
    </>
  )
}
