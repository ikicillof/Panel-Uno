// Tarjeta de cómic: misma estructura que la tienda original, con tilt y brillo holográfico.
import { useRef, useState } from 'react'
import { coverOf } from './data/comics'
import { sfx } from './audio'

export const price = (n) => `$${Number(n).toLocaleString('es-AR')}`

export default function Card({ c, onOpen }) {
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
