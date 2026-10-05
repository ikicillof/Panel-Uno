// Lenis: scroll suave tipo premium. Se desactiva con "reducir movimiento".
import { useEffect } from 'react'
import Lenis from 'lenis'
import { useStore } from '../store'

export let lenis = null

export function useSmoothScroll() {
  const locked = useStore((s) => s.selected !== null)
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true })
    let raf
    const tick = (t) => { lenis?.raf(t); raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(raf); lenis?.destroy(); lenis = null }
  }, [])
  useEffect(() => { if (locked) lenis?.stop(); else lenis?.start() }, [locked])
}
