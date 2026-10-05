// Cursor propio: un globito amarillo que crece sobre lo tocable y dice qué hacer. Solo mouse (no touch).
import { useEffect, useRef, useState } from 'react'
import { useStore } from './store'

export default function Cursor() {
  const el = useRef()
  const label = useStore((s) => s.cursor)
  const inCarousel = useStore((s) => s.inCarousel)
  const [kind, setKind] = useState('')
  const [fine] = useState(() => matchMedia('(hover: hover) and (pointer: fine)').matches)

  useEffect(() => {
    if (!fine) return
    document.documentElement.classList.add('has-cursor')
    let x = -100, y = -100, cx = -100, cy = -100, raf
    const move = (e) => {
      x = e.clientX; y = e.clientY
      el.current.classList.add('on')
      const t = e.target.closest?.('[data-cursor]')
      setKind(t ? t.dataset.cursor : '')
    }
    const leave = () => el.current?.classList.remove('on')
    const tick = () => {
      cx += (x - cx) * 0.28; cy += (y - cy) * 0.28
      if (el.current) el.current.style.transform = `translate(${cx}px,${cy}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    window.addEventListener('pointermove', move)
    document.documentElement.addEventListener('pointerleave', leave)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('pointermove', move); document.documentElement.removeEventListener('pointerleave', leave); document.documentElement.classList.remove('has-cursor') }
  }, [fine])

  if (!fine) return null
  const text = kind === 'ver' ? 'VER' : label || (inCarousel ? 'ARRASTRÁ' : '')
  const cls = text ? 'big' : kind === 'link' ? 'link' : ''
  return <div ref={el} className={`cursor ${cls}`} aria-hidden="true">{text}</div>
}
