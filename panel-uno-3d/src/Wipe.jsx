// Corte de viñeta: tres franjas diagonales. Se dispara cada vez que cambia store.wipe.
import { useStore } from './store'

export default function Wipe() {
  const key = useStore((s) => s.wipe)
  if (!key) return null
  return (
    <div key={key} className="wipe go" aria-hidden="true">
      <i style={{ '--i': 0 }} /><i style={{ '--i': 1 }} /><i style={{ '--i': 2 }} />
    </div>
  )
}
