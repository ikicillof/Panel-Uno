// Todo el contenido es HTML real. Cada <section data-scene> = una escena del guion (mismo orden que keyframes.js).
import { useEffect, useRef, useState } from 'react'
import { coverOf, money } from './data/comics'
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

const SORTS = {
  title: (a, b) => a.title.localeCompare(b.title),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  year: (a, b) => b.year - a.year,
}
const price = (n) => `$${Number(n).toLocaleString('es-AR')}`

function Card({ c, onOpen }) {
  const ref = useRef()
  const [added, setAdded] = useState(false)
  const out = c.stock === 0
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height
    const st = ref.current.style
    st.setProperty('--ry', `${(x - 0.5) * 10}deg`); st.setProperty('--rx', `${(0.5 - y) * 10}deg`)
    st.setProperty('--mx', `${x * 100}%`); st.setProperty('--my', `${y * 100}%`)
  }
  const leave = () => { const st = ref.current.style; st.setProperty('--ry', '0deg'); st.setProperty('--rx', '0deg') }
  const add = (e) => { e.stopPropagation(); setAdded(true); sfx.tick(); setTimeout(() => setAdded(false), 1500) }
  return (
    <article ref={ref} className="card" onPointerMove={move} onPointerLeave={leave} onClick={() => onOpen(c.id)} data-cursor="ver" tabIndex={0} role="button" aria-label={`Ver ${c.title}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onOpen(c.id) }}>
      <div className="cover">
        <img src={coverOf(c)} alt={`Portada de ${c.title}`} loading="lazy" />
        {c.stock > 0 && c.stock <= 3 && <span className="stock">¡Últimos!</span>}
        {out && <span className="stock out">Agotado</span>}
        <span className="holo" />
      </div>
      <div className="info">
        <p className="m up">{c.publisher} · {c.genre} · {c.year}</p>
        <h3 className="t">{c.title}</h3>
        <p className="m a">{c.author}</p>
        <div className="buy">
          <span className="p">{price(c.price)}</span>
          <button className={`add ${added ? 'ok' : ''}`} disabled={out} onClick={add} data-cursor="link">{added ? '¡Listo!' : out ? 'Agotado' : '+ Carrito'}</button>
        </div>
      </div>
    </article>
  )
}

export default function Sections({ comics, live }) {
  const [genre, setGenre] = useState('Todos')
  const [pub, setPub] = useState('Todos')
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('title')
  const genres = ['Todos', ...[...new Set(comics.map((c) => c.genre))].sort()]
  const pubs = ['Todos', ...[...new Set(comics.map((c) => c.publisher))].sort()]
  const ql = q.trim().toLowerCase()
  const shown = comics
    .filter((c) => (genre === 'Todos' || c.genre === genre) && (pub === 'Todos' || c.publisher === pub)
      && (!ql || c.title.toLowerCase().includes(ql) || c.author.toLowerCase().includes(ql)))
    .sort(SORTS[sort])
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
          <a className="cta" href="#catalogo" data-cursor="link">Ver catálogo</a>
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

      {/* 4 · NIEBLA */}
      <Scene id="niebla" cls="fog-scene short">
        <div>
          <h2 className="h-display rv">Entrá a la tienda</h2>
          <p className="lead rv" style={{ '--i': 1 }}>Todo el stock, ordenado y a un toque.</p>
        </div>
      </Scene>

      {/* 5 · CATÁLOGO (misma grilla y filtros que la tienda original) */}
      <section id="catalogo" data-scene className="catalog">
        <div className="shop">
          <div className="cat-head">
            <p className="kicker">Catálogo completo</p>
            <h2 className="h-display">TIENDA</h2>
            <span className="eyebrow" style={{ justifySelf: 'start' }}>{live ? 'En vivo desde la base de datos' : 'Datos de la base de datos'}</span>
          </div>
          <div className="filterbar">
            <label className="sr" htmlFor="f-q">Buscar</label>
            <input id="f-q" type="text" placeholder="Buscar cómic o autor..." value={q} onChange={(e) => setQ(e.target.value)} />
            <label className="sr" htmlFor="f-g">Género</label>
            <select id="f-g" value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((g) => <option key={g}>{g}</option>)}</select>
            <label className="sr" htmlFor="f-p">Editorial</label>
            <select id="f-p" value={pub} onChange={(e) => setPub(e.target.value)}>{pubs.map((p) => <option key={p}>{p}</option>)}</select>
            <label className="sr" htmlFor="f-s">Ordenar</label>
            <select id="f-s" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="title">Ordenar: A–Z</option><option value="price-asc">Precio: menor</option>
              <option value="price-desc">Precio: mayor</option><option value="year">Más reciente</option>
            </select>
          </div>
          <p className="count">{shown.length} resultado{shown.length !== 1 ? 's' : ''}</p>
          {shown.length === 0 ? (
            <div className="empty"><p className="h-display">SIN RESULTADOS</p><p>Probá con otros filtros</p></div>
          ) : (
            <div className="grid">{shown.map((c) => <Card key={c.id} c={c} onOpen={open} />)}</div>
          )}
          <footer className="foot">
            <span>PANEL UNO · Demo 3D</span>
            <span>{comics.length} cómics · mismos datos y estética que la tienda original</span>
          </footer>
        </div>
      </section>
    </main>
  )
}
