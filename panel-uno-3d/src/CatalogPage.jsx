// Página "Catálogo": todos los cómics con búsqueda, filtros y orden (como la tienda original).
import { useState } from 'react'
import Card from './Card'
import { store } from './store'
import { sfx } from './audio'

const SORTS = {
  title: (a, b) => a.title.localeCompare(b.title),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  year: (a, b) => b.year - a.year,
}

export default function CatalogPage({ comics, live }) {
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
    <main className="catalog page" id="catalogo-page">
      <div className="shop">
        <div className="cat-head">
          <p className="kicker">Catálogo completo</p>
          <h1 className="h-display">TIENDA</h1>
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
    </main>
  )
}
