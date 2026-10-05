// Progreso continuo del scroll: 0 en la 1ª sección [data-scene], 1 en la 2ª, etc.
// Se mide por el centro de cada sección, así cada keyframe "se ve completo" con la sección centrada.
export const scroll = { target: 0, current: 0 }
let mids = []

export function measure() {
  mids = [...document.querySelectorAll('[data-scene]')].map((s) => {
    const r = s.getBoundingClientRect()
    return r.top + window.scrollY + r.height / 2
  })
}

export function readTarget() {
  if (!mids.length) measure()
  if (!mids.length) return 0
  const c = window.scrollY + window.innerHeight / 2
  if (c <= mids[0]) return 0
  for (let j = 0; j < mids.length - 1; j++) {
    if (c < mids[j + 1]) return j + (c - mids[j]) / (mids[j + 1] - mids[j])
  }
  return mids.length - 1
}

if (typeof window !== 'undefined') {
  window.addEventListener('resize', measure)
  window.addEventListener('load', measure)
  new ResizeObserver(measure).observe(document.documentElement)
}
