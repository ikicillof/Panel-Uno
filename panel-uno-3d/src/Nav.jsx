import { useEffect, useState } from 'react'
import { store, useStore } from './store'
import { sfx } from './audio'
import { scrollToId } from './navigation'

const LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'historia', label: 'Historia' },
  { id: 'accion', label: 'Acción' },
  { id: 'carrusel', label: 'Carrusel' },
]

export default function Nav() {
  const theme = useStore((s) => s.theme)
  const sound = useStore((s) => s.sound)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const k = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [])

  const go = (e, l) => { e.preventDefault(); setOpen(false); sfx.tick(); scrollToId(l.id) }

  return (
    <header className="nav">
      <a className="logo" href="#inicio" onClick={(e) => go(e, LINKS[0])} data-cursor="link">PANEL UNO</a>
      <nav className="nav-links" aria-label="Menú principal">
        {LINKS.map((l) => <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l)} data-cursor="link">{l.label}</a>)}
      </nav>
      <div className="nav-tools">
        <button className="tool" aria-pressed={sound} onClick={() => { store.set({ sound: !sound }); if (!sound) setTimeout(() => { sfx.unlock(); sfx.tick() }, 0) }} data-cursor="link">
          <span aria-hidden="true">{sound ? '🔊' : '🔇'}</span><span className="lbl">Sonido {sound ? 'on' : 'off'}</span>
        </button>
        <button className="switch" role="switch" aria-checked={theme === 'dark'} aria-label="Modo noche" onClick={() => store.set({ theme: theme === 'dark' ? 'light' : 'dark' })} data-cursor="link" />
        <button className="burger" aria-expanded={open} aria-controls="mnav" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>
      <nav id="mnav" className="mnav" hidden={!open} aria-label="Menú móvil">
        {LINKS.map((l) => <a key={l.id} href={`#${l.id}`} onClick={(e) => go(e, l)}>{l.label}</a>)}
      </nav>
    </header>
  )
}
