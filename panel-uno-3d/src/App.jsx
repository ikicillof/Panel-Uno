import { Suspense, lazy, useMemo } from 'react'
import { useDeviceTier } from './hooks/useDeviceTier'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useSceneTheme } from './hooks/useSceneTheme'
import { useComics } from './data/comics'
import Sections from './Sections'
import Fallback from './Fallback'
import Nav from './Nav'
import Detail from './Detail'
import Cursor from './Cursor'
import Wipe from './Wipe'

// El Canvas se carga aparte: sin WebGL nunca se descarga three.js
const Stage = lazy(() => import('./three/Stage'))

export default function App() {
  const tier = useDeviceTier() // 'pending' | 'high' | 'medium' | 'low'
  const { comics } = useComics()
  useSmoothScroll()
  useSceneTheme()
  const gl = tier === 'high' || tier === 'medium'
  // El carrusel muestra los cómics destacados de la base de datos (campo "Destacado")
  const featured = useMemo(() => { const f = comics.filter((c) => c.featured); return f.length >= 3 ? f : comics }, [comics])

  return (
    <>
      <Nav />
      {(tier === 'pending' || tier === 'low') && <Fallback />}
      {gl && (
        <Suspense fallback={<Fallback />}>
          <Stage tier={tier} comics={featured} />
        </Suspense>
      )}
      <Sections comics={featured} />
      <Detail comics={featured} />
      <Cursor />
      <Wipe />
    </>
  )
}
