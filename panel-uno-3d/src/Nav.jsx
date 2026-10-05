import { store, useStore } from './store'
import { sfx } from './audio'

export default function Nav() {
  const theme = useStore((s) => s.theme)
  const sound = useStore((s) => s.sound)
  return (
    <header className="nav">
      <a className="logo" href="#inicio" data-cursor="link">PANEL UNO</a>
      <nav className="nav-links" aria-label="Secciones">
        <a href="#historia" data-cursor="link">Historia</a>
        <a href="#carrusel" data-cursor="link">Carrusel</a>
        <a href="#catalogo" data-cursor="link">Catálogo</a>
      </nav>
      <div className="nav-tools">
        <button className="tool" aria-pressed={sound} onClick={() => { store.set({ sound: !sound }); if (!sound) setTimeout(() => { sfx.unlock(); sfx.tick() }, 0) }} data-cursor="link">
          <span aria-hidden="true">{sound ? '🔊' : '🔇'}</span><span className="lbl">Sonido {sound ? 'on' : 'off'}</span>
        </button>
        <button className="switch" role="switch" aria-checked={theme === 'dark'} aria-label="Modo noche" onClick={() => store.set({ theme: theme === 'dark' ? 'light' : 'dark' })} data-cursor="link" />
      </div>
    </header>
  )
}
