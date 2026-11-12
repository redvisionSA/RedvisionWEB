import { normalizarTexto } from './formato.js'

/**
 * specs.js
 * -----------------------------------------------------------------------
 * Especificaciones filtrables de cada producto.
 *
 * Fuente 1 (manda): `specs` que envia el ERP (docs/CATALOGO_API.md).
 * Fuente 2 (respaldo): lectura del nombre y la descripcion con reglas del
 * rubro ("4 MP", "Full-Color", "8 canales", "2,8 mm", "IR 30 m"...). Solo se
 * extrae lo que el texto dice; nunca se deduce un dato que no esta escrito.
 */

export const TECNOLOGIAS = [
  ['Full-Color', /full[\s-]?colou?r/],
  ['WizSense', /wizsense/],
  ['WizMind', /wizmind/],
  ['Starlight', /starlight/],
  ['Smart Dual Light', /dual[\s-]?light|luz dual|iluminacion dual/],
  ['TiOC', /\btioc\b/],
  ['ColorVu', /colorvu/],
  ['AcuSense', /acusense/],
  ['HDCVI', /hdcvi|\bcvi\b/],
  ['IP', /\bip\b|\bnvr\b/],
  ['Wi-Fi', /wi[\s-]?fi|inalambric/],
  ['PoE', /\bpoe\b|\bepoe\b/],
  ['ePoE', /\bepoe\b/],
  ['H.265+', /h\.?\s?265/],
  ['Audio / micrófono', /microfono|\baudio\b/],
  ['Lectura de patentes', /\banpr\b|\blpr\b|patente/],
  ['Reconocimiento facial', /facial/],
  ['Disuasión activa', /disuasion activa|active deterrence/],
  ['SMD', /\bsmd\b/],
]

export const FORMAS = [
  ['PTZ', /\bptz\b|speed ?dome/],
  ['Domo', /\bdomo\b|\bdome\b/],
  ['Bullet', /\bbullet\b|\bbala\b|\btubo\b/],
  ['Turret / eyeball', /turret|eyeball|torreta/],
  ['Fisheye', /fish ?eye|ojo de pez|panoramic/],
  ['Cubo / interior', /\bcubo\b|\bcube\b/],
  ['NVR', /\bnvr\b/],
  ['XVR / DVR', /\bxvr\b|\bdvr\b/],
  ['Switch', /\bswitch\b/],
  ['Lector', /\blector\b|lectora/],
  ['Panel', /\bpanel\b/],
  ['Sensor', /\bsensor\b|detector/],
  ['Fuente', /\bfuente\b/],
  ['UPS', /\bups\b/],
  ['Disco', /\bdisco\b|\bhdd\b/],
]

function primerNumero(re, texto) {
  const m = texto.match(re)
  if (!m) return null
  const n = Number(String(m[1]).replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

function resolucion(t) {
  const mp = primerNumero(/(\d+(?:[.,]\d+)?)\s?(?:mp|megapixel)/, t)
  if (mp) return mp
  if (/\b4k\b|2160p/.test(t)) return 8
  if (/\b5k\b/.test(t)) return 12
  if (/1080p|full ?hd/.test(t)) return 2
  if (/720p/.test(t)) return 1
  return null
}

function deErp(s = {}) {
  return {
    mp: Number(s.mp) || null,
    tecnologias: Array.isArray(s.technologies) ? s.technologies : null,
    forma: s.formFactor || null,
    canales: Number(s.channels) || null,
    lente: Number(s.lensMm) || null,
    ir: Number(s.irRangeM) || null,
    uso: s.environment === 'exterior' ? 'Exterior' : s.environment === 'interior' ? 'Interior' : null,
    tb: Number(s.storageTb) || null,
    puertos: Number(s.ports) || null,
    poe: typeof s.poe === 'boolean' ? s.poe : null,
  }
}

export function extraerSpecs({ name = '', description = '', specs } = {}) {
  const t = normalizarTexto(`${name} ${description}`)
  const erp = deErp(specs)

  const tecnologias = erp.tecnologias || TECNOLOGIAS.filter(([, re]) => re.test(t)).map(([n]) => n)
  const forma = erp.forma || FORMAS.find(([, re]) => re.test(normalizarTexto(name)))?.[0] || null
  const varifocal = /varifocal|motorizad/.test(t)

  return {
    mp: erp.mp ?? resolucion(t),
    tecnologias,
    forma,
    canales: erp.canales ?? primerNumero(/(\d+)\s?(?:canales|ch)\b/, t),
    lente: erp.lente ?? (varifocal ? null : primerNumero(/(\d+(?:[.,]\d+)?)\s?mm\b/, t)),
    varifocal,
    ir: erp.ir ?? primerNumero(/(?:\bir\b|infrarrojo|ilumin\w*)[^\d]{0,14}(\d{2,3})\s?m\b/, t),
    uso: erp.uso ?? (/exterior|ip6[67]|intemperie/.test(t) ? 'Exterior' : /interior/.test(t) ? 'Interior' : null),
    tb: erp.tb ?? primerNumero(/(\d+(?:[.,]\d+)?)\s?tb\b/, t),
    puertos: erp.puertos ?? primerNumero(/(\d+)\s?puertos/, t),
    poe: erp.poe ?? (/\bpoe\b|\bepoe\b/.test(t) ? true : null),
  }
}

/** Etiquetas cortas para la tarjeta (las 3 mas utiles para decidir). */
export function etiquetasClave(specs) {
  const out = []
  if (specs.mp) out.push(`${String(specs.mp).replace('.', ',')} MP`)
  if (specs.canales) out.push(`${specs.canales} canales`)
  if (specs.tb) out.push(`${String(specs.tb).replace('.', ',')} TB`)
  if (specs.puertos) out.push(`${specs.puertos} puertos`)
  const tec = specs.tecnologias.find((x) => !['IP', 'H.265+', 'PoE'].includes(x))
  if (tec) out.push(tec)
  if (specs.poe && out.length < 3) out.push('PoE')
  if (specs.lente && out.length < 3) out.push(`${String(specs.lente).replace('.', ',')} mm`)
  return out.slice(0, 3)
}

export function etiquetaMp(mp) {
  const base = `${String(mp).replace('.', ',')} MP`
  if (mp === 2) return `${base} (1080p)`
  if (mp === 8) return `${base} (4K)`
  return base
}
