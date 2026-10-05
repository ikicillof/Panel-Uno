// Cambia el color de fondo y de texto según la escena (como las referencias: cada tramo con su clima).
import { useEffect } from 'react'
import { readTarget } from '../scroll/progress'
import { useStore } from '../store'

const PALETTES = {
  light: { bg: ['#f5f0e8', '#ffd600', '#0057d9', '#f5f0e8', '#f5f0e8', '#f5f0e8'], fg: ['#0d0b0e', '#0d0b0e', '#ffffff', '#0d0b0e', '#0d0b0e', '#0d0b0e'] },
  dark: { bg: ['#0d0b0e', '#241a45', '#0b1f55', '#0d0b0e', '#0d0b0e', '#0d0b0e'], fg: ['#f5f0e8', '#f5f0e8', '#f5f0e8', '#f5f0e8', '#f5f0e8', '#f5f0e8'] },
}
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16))
const mix = (a, b, t) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`

export function useSceneTheme(enabled = true) {
  const theme = useStore((s) => s.theme)
  useEffect(() => {
    if (!enabled) return
    const P = PALETTES[theme], root = document.documentElement
    let cur = readTarget(), raf
    const car = document.querySelector('#carrusel .scene-inner')
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(2, Math.max(0.001, (now - last) / 1000)); last = now
      cur += (readTarget() - cur) * (1 - Math.exp(-8 * dt))
      const i = Math.min(P.bg.length - 2, Math.max(0, Math.floor(cur))), t = Math.min(1, Math.max(0, cur - i))
      root.style.setProperty('--bg', mix(rgb(P.bg[i]), rgb(P.bg[i + 1]), t))
      root.style.setProperty('--fg', mix(rgb(P.fg[i]), rgb(P.fg[i + 1]), t))
      const ss = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x) }
      const f3 = 1 - ss((cur - 3.0) / 0.35)
      root.style.setProperty('--f3', f3.toFixed(3))
      root.style.setProperty('--f4', ss((cur - 3.55) / 0.35).toFixed(3))
      if (car) car.style.visibility = f3 < 0.01 ? 'hidden' : 'visible'
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [theme, enabled])
}
