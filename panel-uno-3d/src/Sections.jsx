// Todo el contenido es HTML real. Cada <section data-scene> = una escena del guion (mismo orden que keyframes.js).
import { useEffect, useRef, useState } from 'react'
import { money } from './data/comics'
import { scrollToId } from './navigation'
import { store, useStore } from './store'
import { sfx } from './audio'

function useActive(ref) {
  useEffect(() => {
    const el = ref.current
    const io = new IntersectionObserver(([e]) => { el.dataset.active = e.isIntersecting ? 'true' : 'false' }, { threshold: 0.4 })
    io.observe(el)
    return () => io.disconnect()
  }, [ref])
}
function Scene({ id, cls = '', children }) {
  const ref = useRef()
  useActive(ref)
  return (
    <section ref={ref} id={id} data-scene className={`scene ${cls}`}>
      <div className="scene-inner">{children}</div>
    </section>
  )
}

function FocusCard({ comics }) {
  const i = useStore((s) => s.focus)
  const c = comics[i] || comics[0]
  return (
    <div className="focus-card pe" aria-live="polite">
      <span className="t">{c.title}</span>
      <span className="m">{c.author} · {c.publisher} · {c.year}</span>
      <span className="p">{money(c.price)}</span>
      <button className="btn" data-cursor="link" onClick={() => { store.set({ selected: c.id }); sfx.whoosh() }}>Ver detalle</button>
    </div>
  )
}

export default function Sections({ comics }) {
  const open = (id) => { store.set({ selected: id }); sfx.whoosh() }

  return (
    <main>
      {/* 0 · HÉROE */}
      <Scene id="inicio" cls="hero">
        <h1 className="sr">Panel Uno, la tienda de cómics</h1>
        <span className="h-display t-l rv" aria-hidden="true">PANEL</span>
        <span className="h-display t-r rv" aria-hidden="true" style={{ '--i': 1 }}>UNO</span>
        <div className="bottom-l rv" style={{ '--i': 3 }}>
          <p className="bubble">La tienda de cómics que se lee con las manos.</p>
        </div>
        <div className="bottom-r rv" style={{ '--i': 4 }}>
          <a className="cta" href="#carrusel" onClick={(e) => { e.preventDefault(); scrollToId('carrusel') }} data-cursor="link">Ver carrusel</a>
          <span className="scroll-hint">Scrolleá</span>
        </div>
      </Scene>

      {/* 1 · SE ABRE */}
      <Scene id="historia">
        <div className="top-head">
          <span className="eyebrow rv">Capítulo 01</span>
          <h2 className="h-display rv" style={{ '--i': 1 }}>Abrí una historia</h2>
        </div>
        <div className="bottom-note">
          <p className="lead rv" style={{ '--i': 2 }}>Tapa dura, papel y tinta. Diez cómics clásicos de la base de datos de Panel Uno, listos para hojear.</p>
        </div>
      </Scene>

      {/* 2 · ONOMATOPEYAS */}
      <Scene id="accion">
        <div className="top-head">
          <span className="eyebrow rv">Capítulo 02</span>
          <h2 className="h-display rv" style={{ '--i': 1 }}>¡Acción en cada página!</h2>
        </div>
        <div className="bottom-note">
          <p className="lead rv" style={{ '--i': 2 }}>Pasan las hojas, entran los golpes. Probá tocar una onomatopeya.</p>
        </div>
      </Scene>

      {/* 3 · CARRUSEL */}
      <Scene id="carrusel" cls="tall">
        <div className="top-head">
          <span className="eyebrow rv">Capítulo 03</span>
          <h2 className="h-display rv" style={{ '--i': 1 }}>Elegí tu próximo cómic</h2>
        </div>
        <div className="bottom-note">
          <FocusCard comics={comics} />
          <span className="chip rv" style={{ '--i': 3 }}>Arrastrá o scrolleá · tocá una portada</span>
        </div>
      </Scene>

      {/* 4 · CIERRE (el carrusel sigue girando detrás) */}
      <Scene id="fin" cls="short">
        <div className="fin-bar rv">
          <span>PANEL UNO · Demo 3D</span>
          <span>{comics.length} cómics · mismos datos y estética que la tienda original</span>
        </div>
      </Scene>
    </main>
  )
}
