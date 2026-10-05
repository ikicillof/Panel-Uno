// Los 10 cómics de la base de datos (Tienda_Comics.sql + portadas.sql).
// Si el backend de la tienda original está corriendo (localhost:3001) se usan sus datos en vivo;
// si no, esta copia embebida mantiene la demo funcionando.
import { useEffect, useState } from 'react'
import c1 from './covers/1.jpg'
import c2 from './covers/2.jpg'
import c3 from './covers/3.jpg'
import c4 from './covers/4.jpg'
import c5 from './covers/5.jpg'
import c6 from './covers/6.jpg'
import c7 from './covers/7.jpg'
import c8 from './covers/8.jpg'
import c9 from './covers/9.jpg'
import c10 from './covers/10.jpg'

export const COVERS = { 1: c1, 2: c2, 3: c3, 4: c4, 5: c5, 6: c6, 7: c7, 8: c8, 9: c9, 10: c10 }

export const FALLBACK_COMICS = [
  { id: 1, title: 'Batman: Año Uno', synopsis: 'El origen de Batman y Gordon.', year: 1987, featured: true, price: 18.99, publisher: 'DC Comics', franchise: 'Batman', author: 'Frank Miller', genre: 'Acción' },
  { id: 2, title: 'Spider-Man: Azul', synopsis: 'Peter recuerda a su primer amor.', year: 2002, featured: true, price: 16.5, publisher: 'Marvel Comics', franchise: 'Spider-Man', author: 'Jeph Loeb', genre: 'Aventura' },
  { id: 3, title: 'Watchmen', synopsis: 'Héroes retirados investigan un asesinato.', year: 1986, featured: true, price: 22.99, publisher: 'Image Comics', franchise: 'Watchmen', author: 'Alan Moore', genre: 'Superhéroes' },
  { id: 4, title: 'Superman: Red Son', synopsis: 'Superman crece en la Unión Soviética.', year: 2003, featured: true, price: 19.99, publisher: 'DC Comics', franchise: 'Superman', author: 'Mark Millar', genre: 'Ciencia ficción' },
  { id: 5, title: 'The Killing Joke', synopsis: 'Batman enfrenta nuevamente al Joker.', year: 1988, featured: true, price: 17.99, publisher: 'DC Comics', franchise: 'Batman', author: 'Frank Miller', genre: 'Acción' },
  { id: 6, title: 'Civil War', synopsis: 'Los héroes se dividen por una nueva ley.', year: 2006, featured: true, price: 21.5, publisher: 'Marvel Comics', franchise: 'Spider-Man', author: 'Jeph Loeb', genre: 'Fantasía' },
  { id: 7, title: 'The Dark Knight Returns', synopsis: 'Un Batman retirado vuelve a combatir.', year: 1986, featured: true, price: 24.99, publisher: 'DC Comics', franchise: 'Batman', author: 'Frank Miller', genre: 'Acción' },
  { id: 8, title: 'V for Vendetta', synopsis: 'Un revolucionario lucha contra un régimen.', year: 1988, featured: false, price: 20.99, publisher: 'Image Comics', franchise: 'Watchmen', author: 'Alan Moore', genre: 'Superhéroes' },
  { id: 9, title: 'X-Men: Dark Phoenix', synopsis: 'Jean Grey pierde el control de su poder.', year: 1980, featured: true, price: 18.75, publisher: 'Marvel Comics', franchise: 'X-Men', author: 'Chris Claremont', genre: 'Fantasía' },
  { id: 10, title: 'Invincible', synopsis: 'Un joven descubre sus poderes heredados.', year: 2003, featured: false, price: 15.99, publisher: 'Dark Horse', franchise: 'Invincible', author: 'Robert Kirkman', genre: 'Aventura' },
]

const API = 'http://localhost:3001/api'

async function fetchLive() {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), 1500)
  try {
    const res = await fetch(`${API}/comics`, { signal: ctl.signal })
    if (!res.ok) return null
    const rows = await res.json()
    if (!Array.isArray(rows) || !rows.length) return null
    return rows.map((r) => ({ ...r, price: Number(r.price) }))
  } catch {
    return null
  } finally {
    clearTimeout(t)
  }
}

export function useComics() {
  const [comics, setComics] = useState(FALLBACK_COMICS)
  const [live, setLive] = useState(false)
  useEffect(() => {
    let ok = true
    fetchLive().then((rows) => { if (ok && rows) { setComics(rows); setLive(true) } })
    return () => { ok = false }
  }, [])
  return { comics, live }
}

export const coverOf = (c) => COVERS[c.id] || c.cover
export const money = (n) => `US$ ${Number(n).toFixed(2)}`
