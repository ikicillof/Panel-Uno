// Estado compartido de la escena: Experience lo calcula una vez por frame y los demás componentes lo leen.
export const S = {
  p: 0, vw: 5, vh: 3, theme: 'light',
  x: 0, y: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0, open: 0, flip: 0, cam: 6.2, bx: 0, ring: 0, ringY: 0, rr: 0, fog: 0,
}
export const smoothstep = (t) => { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t) }
export const damp = (x, y, lambda, dt) => x + (y - x) * (1 - Math.exp(-lambda * dt))
