import { normalizarTexto } from './formato.js'
import { etiquetaMp } from './specs.js'

/**
 * motor.js — busqueda y filtrado facetado de la tienda.
 * -----------------------------------------------------------------------
 * Lo que hacen las tiendas de referencia, del lado del navegador:
 *
 *  - Busqueda tolerante: sin tildes ni mayusculas, plural/singular, sinonimos
 *    del rubro ("bala" = bullet, "4mp" = "4 MP", "1080p" = 2 MP) y errores de
 *    tipeo (distancia de edicion 1-2 contra el vocabulario del catalogo).
 *  - Ranking por relevancia: codigo exacto > nombre > marca/categoria > texto.
 *  - Facetas disyuntivas: dentro de un grupo se suma (OR), entre grupos se
 *    restringe (AND), y cada conteo se calcula aplicando todos los filtros
 *    MENOS el del propio grupo (asi nunca aparece una opcion que lleve a cero).
 *  - "¿Quiso decir…?" cuando la busqueda no encuentra nada.
 *
 * Con miles de productos sigue siendo instantaneo; si el catalogo crece a
 * decenas de miles, este mismo contrato se mueve a un servicio de busqueda.
 */

/* ----------------------------------------------------------- texto */
const SINONIMOS = [
  [/\b(\d+(?:[.,]\d+)?)\s?(?:mp|mpx|megapixel(?:es)?|megas?)\b/g, '$1mp'],
  [/\b4k\b/g, '8mp 4k'],
  [/\b1080p?\b/g, '2mp 1080p'],
  [/\bfull ?hd\b/g, '2mp 1080p'],
  [/\b(\d+)\s?(?:ch|canales)\b/g, '$1canales'],
  [/\bbala\b|\btubo\b/g, 'bullet'],
  [/\bdome\b/g, 'domo'],
  [/\bgrabadora?s?\b/g, 'grabador'],
  [/\bhdd\b|\bdisco rigido\b/g, 'disco'],
  [/\bwi ?fi\b|\bwireless\b/g, 'wifi'],
  [/\bfull ?color\b/g, 'fullcolor'],
  [/\bcctv\b/g, 'camara'],
  [/\bcamaras?\s+de\s+seguridad\b/g, 'camara'],
]

/* Del lado del documento se expande ("4K" -> "8mp 4k") para que lo encuentren
   las dos formas; del lado de la consulta se reduce a la forma canonica. */
export function normalizarConsulta(texto = '', { consulta = false } = {}) {
  let t = normalizarTexto(texto).replace(/[-_/]+/g, ' ')
  for (const [re, rep] of SINONIMOS) t = t.replace(re, rep)
  if (consulta) t = t.replace(/\b8mp 4k\b/g, '8mp').replace(/\b2mp 1080p\b/g, '2mp')
  return t.replace(/[^a-z0-9.,\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

const escapar = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, (c) => `\\${c}`)

/* Singular aproximado: "camaras" -> "camara", "sensores" -> "sensor" */
function raiz(token) {
  if (token.length > 5 && token.endsWith('es')) return token.slice(0, -2)
  if (token.length > 3 && token.endsWith('s')) return token.slice(0, -1)
  return token
}

function distancia(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const cur = [i]
    let minFila = i
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
      if (cur[j] < minFila) minFila = cur[j]
    }
    if (minFila > max) return max + 1
    prev = cur
  }
  return prev[b.length]
}

const tolerancia = (token) => (token.length >= 8 ? 2 : token.length >= 4 ? 1 : 0)

/** Prepara el indice una sola vez por catalogo. */
export function indexar(productos) {
  const vocabulario = new Set()
  const indice = productos.map((p) => {
    const nombre = normalizarConsulta(p.nombre)
    const sku = normalizarTexto(p.sku).replace(/[^a-z0-9]/g, '')
    const meta = normalizarConsulta([p.marca?.nombre, p.categoria?.nombre, ...(p.specs?.tecnologias || []), p.specs?.forma].filter(Boolean).join(' '))
    const desc = normalizarConsulta(p.descripcion)
    const palabras = new Set(`${nombre} ${meta} ${desc}`.split(' ').filter(Boolean).map(raiz))
    palabras.forEach((w) => w.length >= 4 && vocabulario.add(w))
    return { p, nombre, sku, meta, desc, palabras }
  })
  return { indice, vocabulario: [...vocabulario] }
}

function corregir(token, vocabulario) {
  const max = tolerancia(token)
  if (!max) return null
  let mejor = null
  let mejorD = max + 1
  for (const w of vocabulario) {
    const d = distancia(token, w, max)
    if (d < mejorD) {
      mejor = w
      mejorD = d
      if (d === 1) break
    }
  }
  return mejorD <= max ? mejor : null
}

function puntuarToken(doc, token) {
  const r = raiz(token)
  if (doc.sku && doc.sku === token.replace(/[^a-z0-9]/g, '')) return 60
  if (doc.sku && token.length >= 4 && doc.sku.includes(token.replace(/[^a-z0-9]/g, ''))) return 30
  if (new RegExp(`(^| )${escapar(r)}`).test(doc.nombre)) return 10
  if (doc.nombre.includes(r)) return 6
  if (doc.meta.includes(r)) return 4
  if (doc.desc.includes(r)) return 1
  return 0
}

/**
 * Busca y ordena por relevancia.
 * Devuelve { resultados: [{p, puntaje}], correccion, aproximado }
 */
export function buscarRanking(motor, consulta) {
  const q = normalizarConsulta(consulta, { consulta: true })
  const tokens = q.split(' ').filter(Boolean)
  if (!tokens.length) return { resultados: motor.indice.map((d) => ({ p: d.p, puntaje: 0 })), correccion: null, aproximado: false }

  /* Codigo de producto escrito como sea: "DH-IPC-HFW", "dh ipc hfw", "ipchfw2441".
     Se compara la consulta compactada (sin espacios ni signos) contra el codigo
     compactado, por inclusion: no hace falta escribirlo completo ni exacto. */
  const compacta = normalizarTexto(consulta).replace(/[^a-z0-9]/g, '')
  const porCodigo = (doc) => {
    if (compacta.length < 3 || !doc.sku) return 0
    if (doc.sku === compacta) return 80
    if (doc.sku.startsWith(compacta)) return 60
    return doc.sku.includes(compacta) ? 40 : 0
  }

  const evaluar = (toks, exigirTodos) => {
    const out = []
    for (const doc of motor.indice) {
      const codigo = porCodigo(doc)
      if (codigo) {
        out.push({ p: doc.p, puntaje: codigo + (doc.p.disponibilidad === 'disponible' ? 0.5 : 0) })
        continue
      }
      let total = 0
      let coinciden = 0
      for (const t of toks) {
        const s = puntuarToken(doc, t)
        if (s > 0) {
          total += s
          coinciden++
        } else if (exigirTodos) {
          total = -1
          break
        }
      }
      if (total > 0 && (!exigirTodos || coinciden === toks.length)) out.push({ p: doc.p, puntaje: total + (doc.p.disponibilidad === 'disponible' ? 0.5 : 0) })
    }
    return out.sort((a, b) => b.puntaje - a.puntaje)
  }

  let resultados = evaluar(tokens, true)
  let correccion = null
  let aproximado = false

  if (!resultados.length) {
    const corregidos = tokens.map((t) => {
      if (motor.indice.some((d) => puntuarToken(d, t) > 0)) return t
      return corregir(raiz(t), motor.vocabulario) || t
    })
    if (corregidos.join(' ') !== tokens.join(' ')) {
      resultados = evaluar(corregidos, true)
      if (resultados.length) correccion = corregidos.join(' ')
    }
  }
  if (!resultados.length && tokens.length > 1) {
    resultados = evaluar(tokens, false)
    aproximado = resultados.length > 0
  }
  return { resultados, correccion, aproximado }
}

/* ------------------------------------------------------------- facetas */
const rangoIr = (m) => (m <= 30 ? 'Hasta 30 m' : m <= 50 ? '31 a 50 m' : m <= 80 ? '51 a 80 m' : 'Más de 80 m')
const ORDEN_IR = ['Hasta 30 m', '31 a 50 m', '51 a 80 m', 'Más de 80 m']
const fmt = (n) => String(n).replace('.', ',')

/**
 * Definicion de facetas. `valores(p)` devuelve las claves del producto para
 * ese grupo (array). `param` es la clave en la URL.
 */
export const FACETAS = [
  { id: 'marca', param: 'marca', titulo: 'Marca', valores: (p) => (p.marca ? [p.marca.slug] : []), etiqueta: (v, ctx) => ctx.marcas.get(v) || v, buscable: true },
  { id: 'tec', param: 'tec', titulo: 'Tecnología', valores: (p) => p.specs.tecnologias },
  { id: 'mp', param: 'mp', titulo: 'Resolución', valores: (p) => (p.specs.mp ? [String(p.specs.mp)] : []), etiqueta: (v) => etiquetaMp(Number(v)), orden: 'numerico' },
  { id: 'forma', param: 'forma', titulo: 'Tipo de equipo', valores: (p) => (p.specs.forma ? [p.specs.forma] : []) },
  { id: 'canales', param: 'canales', titulo: 'Canales', valores: (p) => (p.specs.canales ? [String(p.specs.canales)] : []), etiqueta: (v) => `${v} canales`, orden: 'numerico' },
  { id: 'lente', param: 'lente', titulo: 'Lente', valores: (p) => (p.specs.varifocal ? ['varifocal'] : p.specs.lente ? [String(p.specs.lente)] : []), etiqueta: (v) => (v === 'varifocal' ? 'Varifocal / motorizada' : `${fmt(v)} mm`), orden: 'numerico' },
  { id: 'ir', param: 'ir', titulo: 'Alcance de visión nocturna', valores: (p) => (p.specs.ir ? [rangoIr(p.specs.ir)] : []), orden: ORDEN_IR },
  { id: 'uso', param: 'uso', titulo: 'Instalación', valores: (p) => (p.specs.uso ? [p.specs.uso] : []) },
  { id: 'tb', param: 'tb', titulo: 'Capacidad', valores: (p) => (p.specs.tb ? [String(p.specs.tb)] : []), etiqueta: (v) => `${fmt(v)} TB`, orden: 'numerico' },
  { id: 'puertos', param: 'puertos', titulo: 'Puertos', valores: (p) => (p.specs.puertos ? [String(p.specs.puertos)] : []), etiqueta: (v) => `${v} puertos`, orden: 'numerico' },
  /* La categoria no es una faceta: se navega por el arbol (`/productos/:categoria`) */
]

export const PARAMS_FACETAS = FACETAS.map((f) => f.param)

/** Lee la seleccion desde la URL. */
export function leerSeleccion(params) {
  const sel = {}
  for (const f of FACETAS) {
    const v = (params.get(f.param) || '').split(',').filter(Boolean)
    if (v.length) sel[f.id] = new Set(v)
  }
  const precio = (params.get('precio') || '').match(/^(\d*)-(\d*)$/)
  return {
    facetas: sel,
    precioMin: precio && precio[1] ? Number(precio[1]) : null,
    precioMax: precio && precio[2] ? Number(precio[2]) : null,
    stock: params.get('stock') === '1',
  }
}

function pasaFacetas(p, facetas, excepto) {
  for (const f of FACETAS) {
    if (f.id === excepto) continue
    const sel = facetas[f.id]
    if (!sel) continue
    if (!f.valores(p).some((v) => sel.has(v))) return false
  }
  return true
}

function pasaPrecio(p, min, max) {
  if (min === null && max === null) return true
  if (p.precio === null) return false
  return (min === null || p.precio >= min) && (max === null || p.precio <= max)
}

const pasaStock = (p, stock) => !stock || p.disponibilidad === 'disponible' || p.disponibilidad === 'ultimas'

export function filtrar(productos, sel) {
  return productos.filter((p) => pasaFacetas(p, sel.facetas, null) && pasaPrecio(p, sel.precioMin, sel.precioMax) && pasaStock(p, sel.stock))
}

/** Opciones y conteos de cada faceta (disyuntivo). Oculta grupos sin eleccion real. */
export function calcularFacetas(productos, sel, ctx) {
  return FACETAS.map((f) => {
    const elegidas = sel.facetas[f.id] || new Set()
    const conteo = new Map()
    for (const p of productos) {
      if (!pasaFacetas(p, sel.facetas, f.id) || !pasaPrecio(p, sel.precioMin, sel.precioMax) || !pasaStock(p, sel.stock)) continue
      for (const v of new Set(f.valores(p))) conteo.set(v, (conteo.get(v) || 0) + 1)
    }
    elegidas.forEach((v) => !conteo.has(v) && conteo.set(v, 0))
    let opciones = [...conteo.entries()].map(([valor, n]) => ({
      valor,
      n,
      etiqueta: f.etiqueta ? f.etiqueta(valor, ctx) : valor,
      activa: elegidas.has(valor),
      marca: f.id === 'marca' ? ctx.listaMarcas?.find((m) => m.slug === valor) : undefined,
    }))
    if (f.orden === 'numerico') opciones.sort((a, b) => (a.valor === 'varifocal') - (b.valor === 'varifocal') || Number(a.valor) - Number(b.valor))
    else if (Array.isArray(f.orden)) opciones.sort((a, b) => f.orden.indexOf(a.valor) - f.orden.indexOf(b.valor))
    else opciones.sort((a, b) => b.n - a.n || String(a.etiqueta).localeCompare(String(b.etiqueta), 'es'))
    const visible = opciones.length > 1 || elegidas.size > 0
    return { ...f, opciones, visible, activas: elegidas.size }
  })
}

/** Rango de precios disponible y un histograma de 24 barras. */
export function rangoPrecios(productos, sel) {
  const precios = productos
    .filter((p) => p.precio !== null && pasaFacetas(p, sel.facetas, null) && pasaStock(p, sel.stock))
    .map((p) => p.precio)
  if (!precios.length) return null
  const min = Math.floor(Math.min(...precios))
  const max = Math.ceil(Math.max(...precios))
  const barras = 24
  const ancho = Math.max(1, (max - min) / barras)
  const histograma = Array(barras).fill(0)
  precios.forEach((v) => histograma[Math.min(barras - 1, Math.floor((v - min) / ancho))]++)
  return { min, max, histograma, ancho }
}

/** Chips de filtros activos, para mostrarlos y quitarlos de a uno. */
export function chipsActivos(sel, facetas, formatoPrecio) {
  const chips = []
  for (const f of facetas) {
    for (const o of f.opciones) if (o.activa) chips.push({ clave: `${f.id}:${o.valor}`, param: f.param, valor: o.valor, texto: `${f.titulo}: ${o.etiqueta}` })
  }
  if (sel.precioMin !== null || sel.precioMax !== null) {
    const desde = sel.precioMin !== null ? formatoPrecio(sel.precioMin) : 'mínimo'
    const hasta = sel.precioMax !== null ? formatoPrecio(sel.precioMax) : 'máximo'
    chips.push({ clave: 'precio', param: 'precio', valor: null, texto: `Precio: ${desde} a ${hasta}` })
  }
  if (sel.stock) chips.push({ clave: 'stock', param: 'stock', valor: null, texto: 'Con stock para entrega' })
  return chips
}

export const ORDENES = [
  { id: 'relevancia', etiqueta: 'Más relevantes' },
  { id: 'precio-asc', etiqueta: 'Menor precio' },
  { id: 'precio-desc', etiqueta: 'Mayor precio' },
  { id: 'mp-desc', etiqueta: 'Mayor resolución' },
  { id: 'disponible', etiqueta: 'Entrega inmediata primero' },
  { id: 'nombre', etiqueta: 'Nombre (A-Z)' },
]

const PESO_DISP = { disponible: 0, ultimas: 1, a_pedido: 2, sin_stock: 3 }

export function ordenarLista(items, orden) {
  const lista = [...items]
  const conPrecio = (a, b, f) => (a.precio === null) - (b.precio === null) || (a.precio !== null && b.precio !== null ? f(a.precio, b.precio) : 0)
  switch (orden) {
    case 'precio-asc':
      return lista.sort((a, b) => conPrecio(a, b, (x, y) => x - y))
    case 'precio-desc':
      return lista.sort((a, b) => conPrecio(a, b, (x, y) => y - x))
    case 'mp-desc':
      return lista.sort((a, b) => (b.specs.mp || 0) - (a.specs.mp || 0))
    case 'disponible':
      return lista.sort((a, b) => PESO_DISP[a.disponibilidad] - PESO_DISP[b.disponibilidad])
    case 'nombre':
      return lista.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    default:
      return lista
  }
}
