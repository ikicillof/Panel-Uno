// Sonidos sintetizados con WebAudio (sin archivos). Apagado por defecto: lo activa el botón del menú.
import { store } from './store'

let ctx, noise
function ac() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)()
    const len = ctx.sampleRate * 0.6
    noise = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = noise.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}
const on = () => store.get().sound

function burst({ freq, q = 1, dur = 0.18, vol = 0.25, type = 'bandpass', sweep = 0 }) {
  const c = ac(), t = c.currentTime
  const src = c.createBufferSource(); src.buffer = noise
  const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(freq, t); f.Q.value = q
  if (sweep) f.frequency.exponentialRampToValueAtTime(Math.max(60, freq + sweep), t + dur)
  const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  src.connect(f).connect(g).connect(c.destination); src.start(t, Math.random() * 0.3, dur + 0.05)
}

function thump(freq = 140, dur = 0.22, vol = 0.4) {
  const c = ac(), t = c.currentTime
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(freq, t); o.frequency.exponentialRampToValueAtTime(40, t + dur)
  const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02)
}

export const sfx = {
  flip() { if (on()) burst({ freq: 3800, q: 0.7, dur: 0.16, vol: 0.18, sweep: -1800 }) },
  pow() { if (on()) { thump(160, 0.28, 0.5); burst({ freq: 1400, q: 0.5, dur: 0.22, vol: 0.28, type: 'lowpass' }) } },
  whoosh() { if (on()) burst({ freq: 400, q: 0.8, dur: 0.45, vol: 0.2, sweep: 2600 }) },
  tick() { if (on()) burst({ freq: 2400, q: 4, dur: 0.05, vol: 0.12 }) },
  unlock() { if (on()) ac() },
}
