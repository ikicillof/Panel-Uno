// Texturas generadas con canvas 2D: tapa de Panel Uno, páginas de cómic, papel, cantos, holograma.
import * as THREE from 'three'

export const INK = '#0d0b0e'
export const PAPER = '#f6efdc'
const DISPLAY = '"Bangers", Impact, "Arial Black", sans-serif'
const BODY = '"Nunito", system-ui, sans-serif'

export function rngOf(seed) {
  let s = (seed * 2654435761) >>> 0 || 1
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s % 100000) / 100000 }
}
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')] }
export function toTex(c, { srgb = true, aniso = 8, repeat = false } = {}) {
  const t = new THREE.CanvasTexture(c)
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = aniso
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping
  return t
}

function halftone(ctx, x, y, w, h, color, step, maxR, fn) {
  ctx.fillStyle = color
  for (let j = 0; j * step < h + step; j++) {
    for (let i = 0; i * step < w + step; i++) {
      const px = x + i * step + (j % 2 ? step / 2 : 0), py = y + j * step
      const k = fn ? fn(px, py) : 1
      if (k <= 0.03) continue
      ctx.beginPath(); ctx.arc(px, py, maxR * Math.min(1, k), 0, 6.2832); ctx.fill()
    }
  }
}
function rays(ctx, cx, cy, n, r, c1, c2, rot = 0) {
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 ? c1 : c2
    ctx.beginPath(); ctx.moveTo(cx, cy)
    ctx.arc(cx, cy, r, rot + (i / n) * 6.2832, rot + ((i + 1) / n) * 6.2832); ctx.closePath(); ctx.fill()
  }
}
function starPath(ctx, cx, cy, rOut, rIn, n, rand, jit = 0.12) {
  ctx.beginPath()
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * 6.2832
    const r = (i % 2 ? rIn : rOut) * (1 + (rand() - 0.5) * jit)
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  }
  ctx.closePath()
}
function grain(ctx, w, h, amount = 0.05, seed = 7) {
  const r = rngOf(seed)
  for (let i = 0; i < w * h * 0.012; i++) {
    ctx.fillStyle = r() > 0.5 ? `rgba(0,0,0,${amount * r()})` : `rgba(255,255,255,${amount * r()})`
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2)
  }
}
function skyline(ctx, x, y, w, h, color, rand, windows) {
  ctx.fillStyle = color
  let cx = x
  while (cx < x + w) {
    const bw = 40 + rand() * 70, bh = h * (0.25 + rand() * 0.75)
    ctx.fillRect(cx, y + h - bh, bw, bh)
    if (windows) {
      ctx.fillStyle = windows
      for (let wy = y + h - bh + 14; wy < y + h - 14; wy += 26)
        for (let wx = cx + 8; wx < cx + bw - 12; wx += 20) if (rand() > 0.55) ctx.fillRect(wx, wy, 8, 12)
      ctx.fillStyle = color
    }
    cx += bw + 4
  }
}

/* ─────────────  TAPA DE "PANEL UNO #1"  ───────────── */
export function heroCover() {
  const W = 1024, H = 1536, [c, ctx] = mk(W, H), rand = rngOf(11)
  ctx.fillStyle = '#ffd600'; ctx.fillRect(0, 0, W, H)
  rays(ctx, W / 2, H * 0.5, 28, 1800, '#ffe45c', '#ffd600', 0.1)
  halftone(ctx, 0, H * 0.55, W, H * 0.45, '#e8001c', 22, 8.5, (x, y) => (y - H * 0.55) / (H * 0.45))
  // estallido azul central
  ctx.save(); ctx.translate(0, 0)
  starPath(ctx, W / 2, H * 0.52, 430, 290, 16, rand, 0.14); ctx.fillStyle = INK; ctx.save(); ctx.translate(16, 18); ctx.fill(); ctx.restore()
  ctx.fillStyle = '#0057d9'; ctx.fill(); ctx.lineWidth = 12; ctx.strokeStyle = INK; ctx.stroke()
  ctx.restore()
  halftone(ctx, W / 2 - 330, H * 0.52 - 330, 660, 660, 'rgba(255,255,255,.22)', 20, 6, (x, y) => Math.max(0, 1 - Math.hypot(x - W / 2 + 120, y - H * 0.52 + 120) / 420))
  // número
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = `330px ${DISPLAY}`; ctx.lineJoin = 'round'
  ctx.lineWidth = 34; ctx.strokeStyle = INK; ctx.strokeText('#1', W / 2 + 6, H * 0.52 + 14)
  ctx.fillStyle = '#ffd600'; ctx.fillText('#1', W / 2, H * 0.52)
  // título
  ctx.font = `236px ${DISPLAY}`
  ctx.lineWidth = 44; ctx.strokeStyle = INK
  for (const [t, y, col] of [['PANEL', 200, '#e8001c'], ['UNO', 395, '#ffffff']]) {
    ctx.strokeText(t, W / 2 + 10, y + 12); ctx.fillStyle = INK; ctx.fillText(t, W / 2 + 12, y + 14)
    ctx.fillStyle = col; ctx.fillText(t, W / 2, y)
  }
  // skyline
  skyline(ctx, 0, H - 330, W, 230, INK, rand, '#ffd600')
  ctx.fillStyle = INK; ctx.fillRect(0, H - 110, W, 110)
  ctx.fillStyle = '#ffd600'; ctx.font = `700 40px ${BODY}`; ctx.textAlign = 'left'
  ctx.fillText('TODAS LAS HISTORIAS EN UN SOLO LUGAR', 54, H - 58)
  // sello de precio
  ctx.beginPath(); ctx.arc(W - 150, 780, 92, 0, 6.2832); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 10; ctx.strokeStyle = INK; ctx.stroke()
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = `64px ${DISPLAY}`; ctx.fillText('NUEVO', W - 150, 765); ctx.font = `700 34px ${BODY}`; ctx.fillText('ISSUE #1', W - 150, 815)
  // marco + grano
  ctx.lineWidth = 34; ctx.strokeStyle = INK; ctx.strokeRect(0, 0, W, H)
  grain(ctx, W, H, 0.08)
  return toTex(c)
}

/* ─────────────  CONTRATAPA Y INTERIOR DE TAPA  ───────────── */
export function backCover() {
  const W = 1024, H = 1536, [c, ctx] = mk(W, H), rand = rngOf(5)
  ctx.fillStyle = '#0d0b0e'; ctx.fillRect(0, 0, W, H)
  halftone(ctx, 0, 0, W, H, '#ffd60033', 24, 7, (x, y) => 0.4 + 0.6 * Math.sin(x / 90) * Math.cos(y / 90))
  ctx.textAlign = 'center'; ctx.font = `150px ${DISPLAY}`; ctx.lineWidth = 22; ctx.lineJoin = 'round'
  ctx.strokeStyle = '#e8001c'; ctx.strokeText('PANEL UNO', W / 2, 640); ctx.fillStyle = '#ffd600'; ctx.fillText('PANEL UNO', W / 2, 640)
  ctx.fillStyle = '#f5f0e8'; ctx.font = `700 40px ${BODY}`; ctx.fillText('La tienda de cómics que se lee con las manos', W / 2, 740)
  ctx.fillStyle = '#fff'; ctx.fillRect(W - 340, H - 280, 250, 160); ctx.fillStyle = INK
  for (let i = 0; i < 44; i++) ctx.fillRect(W - 325 + i * 5.4, H - 262, 2 + rand() * 2.4, 110)
  grain(ctx, W, H, 0.07, 3)
  return toTex(c)
}
export function innerCover() {
  const W = 1024, H = 1536, [c, ctx] = mk(W, H)
  ctx.fillStyle = '#efe6cf'; ctx.fillRect(0, 0, W, H)
  halftone(ctx, 0, 0, W, H, 'rgba(232,0,28,.10)', 26, 5)
  ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.font = `120px ${DISPLAY}`; ctx.fillText('ABRÍ UNA', W / 2, 560); ctx.fillText('HISTORIA', W / 2, 690)
  ctx.font = `700 38px ${BODY}`; ctx.fillStyle = '#6b6672'; ctx.fillText('Panel Uno · Edición de colección', W / 2, 770)
  grain(ctx, W, H, 0.06, 9)
  return toTex(c)
}
export function spineTex() {
  const W = 128, H = 1536, [c, ctx] = mk(W, H)
  ctx.fillStyle = '#e8001c'; ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = '#ffd600'; ctx.fillRect(0, 0, W, 90); ctx.fillRect(0, H - 90, W, 90)
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(-Math.PI / 2)
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `100px ${DISPLAY}`; ctx.lineWidth = 16; ctx.lineJoin = 'round'
  ctx.strokeStyle = INK; ctx.strokeText('PANEL UNO  ·  #1', 0, 6); ctx.fillStyle = '#fff'; ctx.fillText('PANEL UNO  ·  #1', 0, 4)
  ctx.restore(); grain(ctx, W, H, 0.1, 21)
  return toTex(c)
}

/* ─────────────  PÁGINAS INTERIORES  ───────────── */
const LAYOUTS = [
  [[0, 0, 1, 0.33], [0, 0.33, 0.5, 0.34], [0.5, 0.33, 0.5, 0.34], [0, 0.67, 1, 0.33]],
  [[0, 0, 0.5, 0.5], [0.5, 0, 0.5, 0.5], [0, 0.5, 1, 0.5]],
  [[0, 0, 1, 0.5], [0, 0.5, 0.34, 0.5], [0.34, 0.5, 0.33, 0.5], [0.67, 0.5, 0.33, 0.5]],
  [[0, 0, 0.6, 0.4], [0.6, 0, 0.4, 0.4], [0, 0.4, 1, 0.3], [0, 0.7, 0.5, 0.3], [0.5, 0.7, 0.5, 0.3]],
  [[0, 0, 0.4, 0.55], [0.4, 0, 0.6, 0.55], [0, 0.55, 1, 0.45]],
]
const PHRASES = ['¡AHORA!', '¿Quién anda ahí?', 'Esto recién empieza…', '¡CUIDADO!', 'Panel Uno', 'Mientras tanto…', '¡No puede ser!', 'Silencio.', '¡Allá vamos!', 'Te estaba esperando.']
const PANEL_BG = ['#ffd600', '#e8001c', '#0057d9', '#f5f0e8', '#1a1330', '#ff8a00', '#2bb673']

function panelArt(ctx, x, y, w, h, rand) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip()
  const bg = PANEL_BG[Math.floor(rand() * PANEL_BG.length)]
  ctx.fillStyle = bg; ctx.fillRect(x, y, w, h)
  const kind = Math.floor(rand() * 5)
  const dark = bg === '#1a1330' || bg === '#0057d9' || bg === '#e8001c'
  if (kind === 0) rays(ctx, x + w * (0.3 + rand() * 0.4), y + h * 0.5, 22, Math.max(w, h) * 1.4, 'rgba(255,255,255,.18)', 'rgba(0,0,0,0)', rand() * 3)
  if (kind === 1) { skyline(ctx, x, y + h * 0.35, w, h * 0.65, INK, rand, '#ffd600'); halftone(ctx, x, y, w, h * 0.5, 'rgba(255,255,255,.25)', 14, 4, (_, py) => 1 - (py - y) / (h * 0.5)) }
  if (kind === 2) { starPath(ctx, x + w * 0.5, y + h * 0.5, Math.min(w, h) * 0.42, Math.min(w, h) * 0.26, 12, rand); ctx.fillStyle = dark ? '#ffd600' : '#e8001c'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke() }
  if (kind === 3) halftone(ctx, x, y, w, h, dark ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.22)', 16, 6, (px, py) => Math.max(0, Math.sin((px - x) / w * 3.1) * 0.8 + (py - y) / h * 0.4))
  if (kind === 4) { // figura: círculo + capa
    const cx = x + w * (0.35 + rand() * 0.3), cy = y + h * 0.58
    ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(cx - w * 0.2, y + h); ctx.quadraticCurveTo(cx, cy - h * 0.2, cx + w * 0.2, y + h); ctx.fill()
    ctx.beginPath(); ctx.arc(cx, cy - h * 0.18, Math.min(w, h) * 0.13, 0, 6.2832); ctx.fillStyle = '#f2c9a0'; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke()
  }
  // globo de texto
  if (rand() > 0.25 && w > 150) {
    const t = PHRASES[Math.floor(rand() * PHRASES.length)]
    ctx.font = `${Math.min(46, w / 6)}px ${DISPLAY}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    const tw = ctx.measureText(t).width + 34, th = 66, bx = x + 16 + rand() * Math.max(1, w - tw - 32), by = y + 16 + rand() * Math.max(1, h * 0.35)
    ctx.fillStyle = '#fff'; ctx.strokeStyle = INK; ctx.lineWidth = 5
    ctx.beginPath(); ctx.roundRect(bx, by, tw, th, 26); ctx.fill(); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(bx + tw * 0.25, by + th - 2); ctx.lineTo(bx + tw * 0.2, by + th + 24); ctx.lineTo(bx + tw * 0.4, by + th - 2); ctx.fillStyle = '#fff'; ctx.fill()
    ctx.fillStyle = INK; ctx.fillText(t, bx + tw / 2, by + th / 2 + 3)
  } else if (h > 140) {
    ctx.fillStyle = '#ffd600'; ctx.fillRect(x + 12, y + 12, Math.min(w - 24, 260), 40); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.strokeRect(x + 12, y + 12, Math.min(w - 24, 260), 40)
    ctx.fillStyle = INK; ctx.font = `700 22px ${BODY}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText('MIENTRAS TANTO…', x + 24, y + 33)
  }
  ctx.restore()
  ctx.lineWidth = 9; ctx.strokeStyle = INK; ctx.strokeRect(x, y, w, h)
}

export function comicPage(seed, W = 768, H = 1152) {
  const [c, ctx] = mk(W, H), rand = rngOf(seed * 97 + 13)
  ctx.fillStyle = PAPER; ctx.fillRect(0, 0, W, H)
  const m = 40, g = 16, L = LAYOUTS[Math.floor(rand() * LAYOUTS.length)]
  for (const [fx, fy, fw, fh] of L) panelArt(ctx, m + fx * (W - 2 * m) + g / 2, m + fy * (H - 2 * m) + g / 2, fw * (W - 2 * m) - g, fh * (H - 2 * m) - g, rand)
  ctx.fillStyle = 'rgba(80,60,20,.08)'; ctx.fillRect(0, 0, W, H)
  grain(ctx, W, H, 0.07, seed + 40)
  // sombra de lomo hacia el borde interno (se ajusta por cara con repeat.x = -1)
  const gr = ctx.createLinearGradient(0, 0, 80, 0); gr.addColorStop(0, 'rgba(0,0,0,.28)'); gr.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = gr; ctx.fillRect(0, 0, 80, H)
  return toTex(c)
}

/* ─────────────  PANEL FLOTANTE (viñeta suelta)  ───────────── */
export function floatingPanel(seed) {
  const W = 640, H = 480, [c, ctx] = mk(W, H), rand = rngOf(seed * 131 + 3)
  panelArt(ctx, 0, 0, W, H, rand)
  grain(ctx, W, H, 0.06, seed)
  return toTex(c)
}

/* ─────────────  CANTO DE PÁGINAS Y PAPEL  ───────────── */
export function pageEdge() {
  const W = 64, H = 256, [c, ctx] = mk(W, H)
  ctx.fillStyle = '#efe6cc'; ctx.fillRect(0, 0, W, H)
  const r = rngOf(8)
  for (let y = 0; y < H; y += 3) { ctx.fillStyle = `rgba(120,95,50,${0.14 + r() * 0.2})`; ctx.fillRect(0, y, W, 1) }
  const t = toTex(c, { aniso: 4, repeat: true })
  return t
}
export function paperBump() {
  const W = 256, H = 256, [c, ctx] = mk(W, H), r = rngOf(3)
  ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H)
  for (let i = 0; i < 5000; i++) { const v = 100 + r() * 60; ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3) }
  return toTex(c, { srgb: false, repeat: true })
}

/* ─────────────  PORTADAS REALES  ───────────── */
export function coverFromImage(img) {
  const W = 512, H = 768, [c, ctx] = mk(W, H)
  const s = Math.max(W / img.width, H / img.height)
  ctx.drawImage(img, (W - img.width * s) / 2, (H - img.height * s) / 2, img.width * s, img.height * s)
  // lomo con pliegue y brillo de papel satinado
  let g = ctx.createLinearGradient(0, 0, 46, 0); g.addColorStop(0, 'rgba(0,0,0,.45)'); g.addColorStop(0.35, 'rgba(255,255,255,.12)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, 46, H)
  g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, 'rgba(255,255,255,.14)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.22)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  grain(ctx, W, H, 0.05, 2)
  return toTex(c)
}
export function loadImage(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src })
}

/* ─────────────  HOLOGRAMA (arcoíris)  ───────────── */
export function rainbow() {
  const W = 512, H = 512, [c, ctx] = mk(W, H)
  const g = ctx.createLinearGradient(0, 0, W, H)
  ;['#ff3d81', '#ffd600', '#3dffb1', '#3db8ff', '#b34dff', '#ff3d81', '#ffd600', '#3dffb1'].forEach((col, i, a) => g.addColorStop(i / (a.length - 1), col))
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
  const t = toTex(c, { aniso: 2, repeat: true })
  return t
}

/* ─────────────  SOMBRA BLANDA  ───────────── */
export function blobShadow() {
  const S = 256, [c, ctx] = mk(S, S)
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2)
  g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, S, S)
  return toTex(c, { srgb: false })
}
