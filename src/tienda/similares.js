import { sePuedeComprar } from './piezas.jsx'

/**
 * similares.js — productos parecidos y compatibles.
 * -----------------------------------------------------------------------
 * Reglas fijas sobre las especificaciones (src/tienda/specs.js), sin datos
 * del navegador ni del visitante:
 *
 *   similares    misma linea y, en lo posible, mismo tipo de equipo. Nunca
 *                baja la resolucion ni los canales del original. Suma por
 *                tecnologias compartidas, misma marca, precio cercano y
 *                disponibilidad para entrega.
 *   compatibles  lo que el equipo necesita al lado: camara IP -> NVR, switch
 *                PoE y disco; camara HDCVI -> XVR, fuente y disco; grabador ->
 *                disco y camaras de su tecnologia; switch -> cable y camaras IP.
 *
 * Complementa la equivalencia de Hikvision que calcula el ERP (rama de Kike,
 * "Equivalencias por nomenclatura"): cuando esa equivalencia llegue al
 * catalogo publico, va primero.
 */

const GENERICAS = new Set(['IP', 'H.265+', 'PoE', 'Audio / micrófono'])
const PESO_DISP = { disponible: 2, ultimas: 1, a_pedido: 0, sin_stock: -5 }

function puntajeSimilar(base, c) {
  const a = base.specs || {}
  const b = c.specs || {}
  if (a.mp && b.mp && b.mp < a.mp) return null // nunca menos resolucion
  if (a.canales && b.canales && b.canales < a.canales) return null // ni menos canales
  if (a.tb && b.tb && b.tb < a.tb) return null

  let s = 0
  if (a.forma && b.forma) s += a.forma === b.forma ? 4 : -2
  if (base.categoria?.slug && base.categoria.slug === c.categoria?.slug) s += 2
  if (a.mp && b.mp) s += b.mp === a.mp ? 2 : 1
  if (a.canales && b.canales) s += b.canales === a.canales ? 2 : 1
  const tecs = new Set((a.tecnologias || []).filter((t) => !GENERICAS.has(t)))
  for (const t of b.tecnologias || []) if (tecs.has(t)) s += 1.5
  if ((a.tecnologias || []).includes('HDCVI') !== (b.tecnologias || []).includes('HDCVI')) return null // otro sistema
  if (base.marca?.slug && base.marca.slug === c.marca?.slug) s += 1
  if (base.precio && c.precio) s += 1.5 * (1 - Math.min(1, Math.abs(c.precio - base.precio) / base.precio))
  s += PESO_DISP[c.disponibilidad] ?? 0
  return s
}

export function similares(base, productos, n = 10) {
  if (!base) return []
  return productos
    .filter((c) => c.id !== base.id && c.linea === base.linea && sePuedeComprar(c))
    .map((c) => ({ c, s: puntajeSimilar(base, c) }))
    .filter((x) => x.s !== null && x.s >= 3)
    .sort((x, y) => y.s - x.s)
    .slice(0, n)
    .map((x) => x.c)
}

/** Alternativas con entrega inmediata para un producto que no la tiene. */
export function alternativasConStock(base, productos, n = 6) {
  if (!base || base.disponibilidad === 'disponible') return []
  return similares(base, productos, 40)
    .filter((c) => c.disponibilidad === 'disponible' || c.disponibilidad === 'ultimas')
    .slice(0, n)
}

/* --------------------------------------------------------- compatibles */
const tiene = (p, tec) => (p.specs?.tecnologias || []).includes(tec)
const forma = (p) => p.specs?.forma || ''
const esCamara = (p) => p.linea === 'cctv' && /Domo|Bullet|PTZ|Turret|Fisheye|Cubo/.test(forma(p))
const esGrabador = (p) => /NVR|XVR/.test(forma(p))

function reglas(base) {
  if (esCamara(base) && tiene(base, 'HDCVI')) {
    return [(c) => forma(c) === 'XVR / DVR', (c) => forma(c) === 'Fuente', (c) => forma(c) === 'Disco']
  }
  if (esCamara(base)) {
    return [(c) => forma(c) === 'NVR', (c) => forma(c) === 'Switch' && c.specs?.poe, (c) => forma(c) === 'Disco']
  }
  if (esGrabador(base)) {
    const hdcvi = forma(base) === 'XVR / DVR'
    return [(c) => forma(c) === 'Disco', (c) => esCamara(c) && tiene(c, 'HDCVI') === hdcvi]
  }
  if (forma(base) === 'Switch') {
    return [(c) => c.linea === 'redes' && /cable|utp|patch/i.test(c.nombre), (c) => esCamara(c) && !tiene(c, 'HDCVI')]
  }
  return null
}

export function compatibles(base, productos, lineasComplemento = [], n = 10) {
  if (!base) return []
  const disponibles = productos.filter((c) => c.id !== base.id && sePuedeComprar(c))
  const r = reglas(base)
  const orden = (a, b) => (PESO_DISP[b.disponibilidad] ?? 0) - (PESO_DISP[a.disponibilidad] ?? 0)
  if (r) {
    /* Un poco de cada necesidad, en orden: primero lo imprescindible */
    const grupos = r.map((regla) => disponibles.filter(regla).sort(orden))
    const out = []
    for (let i = 0; out.length < n && grupos.some((g) => g[i]); i++) for (const g of grupos) if (g[i] && out.length < n) out.push(g[i])
    if (out.length >= 3) return out
  }
  return disponibles.filter((c) => lineasComplemento.includes(c.linea)).sort(orden).slice(0, n)
}
