// Niebla de transición: un plano frente a la cámara con ruido animado (la "montaña que se hunde en nubes").
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { S } from '../scroll/state'

const frag = /* glsl */ `
  uniform float uTime, uFog; uniform vec3 uColor; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
  float fbm(vec2 p){ float s=0., a=.5; for(int i=0;i<5;i++){ s+=a*n(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return s; }
  void main(){
    vec2 p = vUv * vec2(3., 2.) ;
    float q = fbm(p + vec2(uTime*.06, 0.));
    float r = fbm(p*1.6 + q*2. - vec2(uTime*.05, uTime*.03));
    float dens = smoothstep(0., 1., r*1.25 + q*.35);
    // la niebla sube desde abajo: con uFog=1 cubre todo
    float edge = uFog * 1.7 - (1. - vUv.y) * .5 - 0.15;
    float a = smoothstep(0.15, 0.95, edge + (dens - .5) * 1.1);
    a = clamp(a, 0., 1.) * min(1., uFog * 3.);
    gl_FragColor = vec4(uColor, a);
    #include <colorspace_fragment>
  }
`
const vert = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`

export default function Fog() {
  const mesh = useRef()
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uTime: { value: 0 }, uFog: { value: 0 }, uColor: { value: new THREE.Color('#f5f0e8') } },
  }), [])
  useFrame((state) => {
    const m = mesh.current, cam = state.camera
    const dist = 2
    const vp = state.viewport.getCurrentViewport(cam, [0, 0, cam.position.z - dist])
    m.position.set(0, 0, cam.position.z - dist)
    m.scale.set(vp.width * 1.02, vp.height * 1.02, 1)
    m.visible = S.fog > 0.003
    mat.uniforms.uTime.value = state.clock.elapsedTime
    mat.uniforms.uFog.value = S.fog
    // el color debe coincidir con el fondo de la sección de catálogo (var --bg)
    mat.uniforms.uColor.value.set(S.theme === 'dark' ? '#0d0b0e' : '#f5f0e8')
  })
  return (
    <mesh ref={mesh} renderOrder={999} visible={false} material={mat}>
      <planeGeometry args={[1, 1]} />
    </mesh>
  )
}
