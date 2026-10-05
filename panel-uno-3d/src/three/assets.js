// Carga única de fuentes y texturas; los componentes 3D la leen con use() dentro de <Suspense>.
import * as T from './textures'
import { COVERS, FALLBACK_COMICS } from '../data/comics'

async function fonts() {
  try {
    await Promise.race([
      Promise.all([document.fonts.load('120px Bangers'), document.fonts.load('700 30px Nunito')]),
      new Promise((r) => setTimeout(r, 2500)),
    ])
  } catch {}
}

export const assetsPromise = (async () => {
  await fonts()
  const covers = {}
  await Promise.all(FALLBACK_COMICS.map(async (c) => {
    try { covers[c.id] = T.coverFromImage(await T.loadImage(COVERS[c.id])) } catch {}
  }))
  const hero = T.heroCover()
  return {
    covers, hero,
    back: T.backCover(), inner: T.innerCover(), spine: T.spineTex(),
    pages: Array.from({ length: 6 }, (_, i) => T.comicPage(i + 1)),
    panels: Array.from({ length: 5 }, (_, i) => T.floatingPanel(i + 1)),
    edge: T.pageEdge(), bump: T.paperBump(), rainbow: T.rainbow(), blob: T.blobShadow(),
  }
})()
