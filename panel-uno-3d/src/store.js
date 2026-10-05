// Estado global mínimo (tema, sonido, cómic elegido, cursor) sin librerías.
import { useSyncExternalStore } from 'react'

let theme = 'light'
try {
  theme = localStorage.getItem('p1-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
} catch {}

let page = 'inicio'
try { if (location.hash === '#catalogo') page = 'catalogo' } catch {}
const state = { theme, sound: false, selected: null, focus: 0, cursor: '', inCarousel: false, page, wipe: 0 }
const subs = new Set()

export const store = {
  get: () => state,
  set(patch) {
    let changed = false
    for (const k in patch) if (state[k] !== patch[k]) { state[k] = patch[k]; changed = true }
    if (changed) subs.forEach((f) => f())
    if ('theme' in patch) {
      document.documentElement.dataset.theme = state.theme
      try { localStorage.setItem('p1-theme', state.theme) } catch {}
    }
  },
}
if (typeof document !== 'undefined') document.documentElement.dataset.theme = state.theme

export function useStore(sel) {
  return useSyncExternalStore((cb) => { subs.add(cb); return () => subs.delete(cb) }, () => sel(state))
}
