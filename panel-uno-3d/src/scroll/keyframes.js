// UN keyframe por cada <section data-scene>, en el mismo orden (guion aprobado):
// 0 Héroe · 1 Se abre · 2 Onomatopeyas · 3 Carrusel · 4 Niebla · 5 Catálogo
// x,y,scale,rot*: el cómic protagonista · open/flip: tapa y páginas (0..1) · bx: onomatopeyas y viñetas entrando
// ring/ringY/rr: carrusel (presencia, altura, giro en radianes) · fog: niebla
export const KEYFRAMES = [
  { x: 0, y: 0.05, scale: 1,    rotX: 0.12,  rotY: -0.5, rotZ: 0.05, open: 0, flip: 0, cam: 6.2, bx: 0, ring: 0, ringY: 0,    rr: -3,   fog: 0 },
  { x: 0, y: -0.2, scale: 1,    rotX: -0.5,  rotY: 0,    rotZ: 0,    open: 1, flip: 0, cam: 6.2, bx: 0, ring: 0, ringY: 0,    rr: -3,   fog: 0 },
  { x: 0, y: -0.3, scale: 0.92, rotX: -0.55, rotY: 0.15, rotZ: 0,    open: 1, flip: 1, cam: 6.2, bx: 1, ring: 0, ringY: 0,    rr: -3,   fog: 0 },
  { x: 0, y: 4.2,  scale: 0.5,  rotX: -0.4,  rotY: 1.2,  rotZ: 0.3,  open: 1, flip: 1, cam: 6.2, bx: 0, ring: 1, ringY: 0,    rr: 0,    fog: 0 },
  { x: 0, y: 6,    scale: 0.2,  rotX: -0.4,  rotY: 1.6,  rotZ: 0.3,  open: 1, flip: 1, cam: 6.2, bx: 0, ring: 1, ringY: -0.5, rr: 3.4,  fog: 1 },
  { x: 0, y: 6,    scale: 0.2,  rotX: -0.4,  rotY: 1.6,  rotZ: 0.3,  open: 1, flip: 1, cam: 6.2, bx: 0, ring: 1, ringY: -3,   rr: 5,    fog: 1 },
]

const smooth = (t) => t * t * (3 - 2 * t)

export function sample(p, frames = KEYFRAMES, out = {}) {
  const n = frames.length - 1
  const c = Math.max(0, Math.min(n, p))
  const i = Math.min(n - 1, Math.floor(c))
  const f = smooth(c - i)
  const a = frames[i], b = frames[i + 1]
  for (const k in a) out[k] = a[k] + (b[k] - a[k]) * f
  return out
}
