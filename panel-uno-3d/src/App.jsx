import { Suspense, lazy } from 'react'
import { useDeviceTier } from './hooks/useDeviceTier'
import { useSmoothScroll } from './hooks/useSmoothScroll'
import { useSceneTheme } from './hooks/useSceneTheme'
import { useComics } from './data/comics'
import Sections from './Sections'
import Fallback from './Fallback'
import Nav from './Nav'
import Detail from './Detail'
import Cursor from './Cursor'

// El Canvas se carga aparte: sin WebGL nunca se descarga three.js
const Stage = lazy(() => import('./three/Stage'))

export default function App() {
  const tier = useDeviceTier() // 'pending' | 'high' | 'medium' | 'low'
  const { comics, live } = useComics()
  useSmoothScroll()
  useSceneTheme()
  const gl = tier === 'high' || tier === 'medium'

  return (
    <>
      <Nav />
      {(tier === 'pending' || tier === 'low') && <Fallback />}
      {gl && (
        <Suspense fallback={<Fallback />}>
          <Stage tier={tier} comics={comics} />
        </Suspense>
      )}
      <Sections comics={comics} live={live} />
      <Detail comics={comics} />
      <Cursor />
    </>
  )
}
