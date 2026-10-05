// Navegación entre las dos páginas (Inicio 3D y Catálogo) con corte de viñeta, y scroll a escenas.
import { store } from './store'
import { lenis } from './hooks/useSmoothScroll'
import { measure } from './scroll/progress'

export function scrollToId(id, immediate = false) {
  let y = 0
  if (id !== 'inicio') {
    const el = document.getElementById(id)
    if (!el) return
    const r = el.getBoundingClientRect()
    y = el.hasAttribute('data-scene') && id !== 'destacados'
      ? r.top + scrollY + r.height / 2 - innerHeight / 2
      : r.top + scrollY - 76
  }
  if (lenis) lenis.scrollTo(y, { immediate })
  else window.scrollTo({ top: y, behavior: immediate ? 'instant' : 'smooth' })
}

export function goPage(page, anchor) {
  const s = store.get()
  if (s.page === page) { if (anchor) scrollToId(anchor); return }
  store.set({ wipe: s.wipe + 1, selected: null })
  setTimeout(() => {
    store.set({ page, inCarousel: false, focus: 0, cursor: '' })
    try { history.replaceState(null, '', page === 'catalogo' ? '#catalogo' : location.pathname + location.search) } catch {}
    window.scrollTo(0, 0)
    lenis?.scrollTo(0, { immediate: true })
    requestAnimationFrame(() => requestAnimationFrame(() => { measure(); if (anchor && anchor !== 'inicio') scrollToId(anchor, true) }))
  }, 400)
}
