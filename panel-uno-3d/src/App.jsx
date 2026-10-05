import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useDeviceTier } from './hooks/useDeviceTier'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useSceneTheme } from './hooks/useSceneTheme'
import { useComics } from './data/comics'
import { useStore } from './store'
import { goPage } from './navigation'
import Sections from './Sections'
import CatalogPage from './CatalogPage'
import Fallback from './Fallback'
import Nav from './Nav'
import Detail from './Detail'
import Cursor from './Cursor'
import Wipe from './Wipe'

// El Canvas se carga aparte: sin WebGL nunca se descarga three.js
const Stage = lazy(() => import('./three/Stage'))

export default function App() {
  const tier = useDeviceTier() // 'pending' | 'high' | 'medium' | 'low'
  const { comics, live } = useComics()
  const page = useStore((s) => s.page)
  useSmoothScroll()
  useSceneTheme(page === 'inicio')
  const gl = tier === 'high' || tier === 'medium'
  // Inicio solo muestra los destacados (campo "Destacado" de la base de datos)
  const featured = useMemo(() => { const f = comics.filter((c) => c.featured); return f.length >= 3 ? f : comics }, [comics])

  useEffect(() => {
    const onHash = () => {
      if (location.hash === '#catalogo') goPage('catalogo')
      else if (location.hash === '' || location.hash === '#inicio') goPage('inicio')
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <>
      <Nav />
      {page === 'inicio' ? (
        <>
          {(tier === 'pending' || tier === 'low') && <Fallback />}
          {gl && (
            <Suspense fallback={<Fallback />}>
              <Stage tier={tier} comics={featured} />
            </Suspense>
          )}
          <Sections featured={featured} total={comics.length} />
        </>
      ) : (
        <CatalogPage comics={comics} live={live} />
      )}
      <Detail comics={comics} />
      <Cursor />
      <Wipe />
    </>
  )
}
