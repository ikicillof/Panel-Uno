// Scroll suave a una escena (se centra la escena para que el 3D quede en su punto exacto).
import { lenis } from './hooks/useSmoothScroll'

export function scrollToId(id, immediate = false) {
  let y = 0
  if (id !== 'inicio') {
    const el = document.getElementById(id)
    if (!el) return
    const r = el.getBoundingClientRect()
    y = r.top + scrollY + r.height / 2 - innerHeight / 2
  }
  if (lenis) lenis.scrollTo(y, { immediate })
  else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' })
}
