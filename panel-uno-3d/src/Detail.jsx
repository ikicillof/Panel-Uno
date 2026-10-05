// Detalle de un cómic: entra con un "corte de viñeta" (tres franjas diagonales).
import { useEffect, useRef, useState } from 'react'
import { coverOf, money } from './data/comics'
import { store, useStore } from './store'
import { sfx } from './audio'

export default function Detail({ comics }) {
  const selected = useStore((s) => s.selected)
  const [shown, setShown] = useState(null) // id realmente visible (cambia a mitad del corte)
  const [wipeKey, setWipeKey] = useState(0)
  const [toast, setToast] = useState('')
  const cover = useRef()

  useEffect(() => {
    if (selected === shown) return
    setWipeKey((k) => k + 1)
    const t = setTimeout(() => setShown(selected), 380)
    return () => clearTimeout(t)
  }, [selected, shown])

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') store.set({ selected: null }) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const idx = comics.findIndex((c) => c.id === shown)
  const c = comics[idx]
  const go = (d) => { store.set({ selected: comics[(idx + d + comics.length) % comics.length].id }); sfx.whoosh() }
  const tilt = (e) => {
    const r = cover.current.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height, s = cover.current.style
    s.setProperty('--ry', `${(x - 0.5) * 18}deg`); s.setProperty('--rx', `${(0.5 - y) * 18}deg`); s.setProperty('--mx', `${x * 100}%`); s.setProperty('--my', `${y * 100}%`)
  }
  const want = () => { setToast('¡Demo! El carrito vive en la tienda original de Panel Uno.'); sfx.pow(); setTimeout(() => setToast(''), 2600) }

  return (
    <>
      {wipeKey > 0 && (
        <div key={wipeKey} className="wipe go" aria-hidden="true">
          <i style={{ '--i': 0 }} /><i style={{ '--i': 1 }} /><i style={{ '--i': 2 }} />
        </div>
      )}
      {c && (
        <div className="detail" role="dialog" aria-modal="true" aria-label={c.title} data-lenis-prevent onClick={(e) => { if (e.target === e.currentTarget) store.set({ selected: null }) }}>
          <div className="detail-box">
            <button className="x" onClick={() => store.set({ selected: null })} aria-label="Cerrar" data-cursor="link">×</button>
            <button className="pn prev" onClick={() => go(-1)} aria-label="Cómic anterior" data-cursor="link">‹</button>
            <button className="pn next" onClick={() => go(1)} aria-label="Cómic siguiente" data-cursor="link">›</button>
            <div ref={cover} className="detail-cover" onPointerMove={tilt} onPointerLeave={() => { cover.current.style.setProperty('--rx', '0deg'); cover.current.style.setProperty('--ry', '0deg') }}>
              <img src={coverOf(c)} alt={`Portada de ${c.title}`} />
              <span className="holo" />
            </div>
            <div>
              <span className="eyebrow">{c.franchise}</span>
              <h3>{c.title}</h3>
              <p className="lead">{c.synopsis}</p>
              <dl>
                <dt>Autor</dt><dd>{c.author}</dd>
                <dt>Editorial</dt><dd>{c.publisher}</dd>
                <dt>Año</dt><dd>{c.year}</dd>
                <dt>Género</dt><dd>{c.genre}</dd>
              </dl>
              <div className="row">
                <span className="price">{money(c.price)}</span>
                <button className="btn red" onClick={want} data-cursor="link">¡Lo quiero!</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </>
  )
}
