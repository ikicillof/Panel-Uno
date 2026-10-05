// Es una demo para llamar la atención: casi todos los dispositivos reciben el 3D completo.
// high   → postprocesado + dpr alto (escritorio)
// medium → misma escena sin postprocesado (celulares y equipos más flojos)
// low    → sin WebGL o "ahorro de datos": versión estática (Fallback.jsx)
// ?tier=low|medium|high fuerza el nivel para probar.
import { useEffect, useState } from 'react'

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

export function useDeviceTier() {
  const [tier, setTier] = useState('pending')
  useEffect(() => {
    const force = new URLSearchParams(location.search).get('tier')
    if (force) return setTier(force)
    if (!hasWebGL() || navigator.connection?.saveData) return setTier('low')
    const mobile = matchMedia('(max-width: 820px), (pointer: coarse)').matches
    const weak = (navigator.deviceMemory ?? 8) < 3 || (navigator.hardwareConcurrency ?? 8) < 3
    setTier(mobile || weak ? 'medium' : 'high')
  }, [])
  return tier
}
