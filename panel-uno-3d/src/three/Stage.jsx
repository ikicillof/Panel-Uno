import { Canvas } from '@react-three/fiber'
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei'
import { useState } from 'react'
import * as THREE from 'three'
import Experience from './Experience'

export default function Stage({ tier, comics }) {
  const high = tier === 'high'
  const max = high ? 1.75 : 1.25
  const [dpr, setDpr] = useState(max)
  return (
    <div className="stage-fixed" aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ position: [0, 0, 6.2], fov: 32, near: 0.1, far: 100 }}
        gl={{ antialias: !high, alpha: true, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        style={{ touchAction: 'pan-y' }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(max)} />
        <AdaptiveDpr pixelated={false} />
        <Experience tier={tier} comics={comics} />
      </Canvas>
    </div>
  )
}
