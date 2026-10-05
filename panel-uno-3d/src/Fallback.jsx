// Sin WebGL (o ahorro de datos): la tapa de Panel Uno como imagen. El resto de la web (HTML real) funciona igual.
import { useEffect, useState } from 'react'
import { heroCover } from './three/textures'

export default function Fallback() {
  const [src, setSrc] = useState('')
  useEffect(() => {
    document.fonts?.load('120px Bangers').finally(() => setSrc(heroCover().image.toDataURL('image/jpeg', 0.85)))
  }, [])
  return <div className="fallback" aria-hidden="true">{src && <img src={src} alt="" />}</div>
}
