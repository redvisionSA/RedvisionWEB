import { AL_FINAL, esAlFinal, LINEAS_VIEJAS, NOMBRE_VISIBLE, PRIORIDAD } from '../datos/categorias.js'

/**
 * categorias.js
 * -----------------------------------------------------------------------
 * Arbol de categorias del ERP para navegar la tienda (encabezado, catalogo,
 * migas, inicio y pie). El orden se configura en `src/datos/categorias.js`.
 *
 * El ERP manda `categories: [{ slug, name, parent }]` (las usadas y sus
 * padres) y cada producto su `category` (slug). Una categoria abarca a todas
 * sus descendientes: «CCTV» lista tambien lo de «CCTV > NVR > Pro».
 */

const comparar = new Intl.Collator('es', { sensitivity: 'base', numeric: true }).compare

function peso(slug) {
  const i = PRIORIDAD.indexOf(slug)
  if (i >= 0) return i
  const j = AL_FINAL.indexOf(slug)
  if (j >= 0) return 20000 + j
  return esAlFinal(slug) ? 30000 : 10000
}

export function ordenarCategorias(nodos) {
  return [...nodos].sort((a, b) => peso(a.slug) - peso(b.slug) || comparar(a.nombre, b.nombre))
}

/** Indice plano slug -> { slug, nombre, padre }. Un padre que no vino se trata como raiz. */
export function indiceCategorias(crudas) {
  const indice = new Map()
  for (const c of crudas || []) {
    if (!c || !c.slug) continue
    indice.set(c.slug, { slug: c.slug, nombre: NOMBRE_VISIBLE[c.slug] || c.name || c.slug, padre: c.parent || null })
  }
  for (const c of indice.values()) if (c.padre && !indice.has(c.padre)) c.padre = null
  return indice
}

/** Slugs de la raiz hasta `slug` inclusive (a prueba de ciclos). */
export function rutaDeCategoria(indice, slug) {
  const ruta = []
  const vistos = new Set()
  let actual = indice.get(slug)
  while (actual && !vistos.has(actual.slug)) {
    vistos.add(actual.slug)
    ruta.unshift(actual.slug)
    actual = actual.padre ? indice.get(actual.padre) : null
  }
  return ruta
}

/** Cuantos productos de `lista` caen en cada categoria (contando descendientes). */
export function contarPorCategoria(lista) {
  const conteo = new Map()
  for (const p of lista) for (const s of p.rutaCategoria || []) conteo.set(s, (conteo.get(s) || 0) + 1)
  return conteo
}

/**
 * Arbol visible: solo categorias con productos, cada nivel ordenado.
 * Devuelve { raices, porSlug } con nodos { slug, nombre, padre, hijos, n }.
 */
export function arbolCategorias(indice, productos) {
  const conteo = contarPorCategoria(productos)
  const porSlug = new Map()
  for (const c of indice.values()) {
    const n = conteo.get(c.slug) || 0
    if (n > 0) porSlug.set(c.slug, { ...c, hijos: [], n })
  }
  const raices = []
  for (const nodo of porSlug.values()) {
    const padre = nodo.padre ? porSlug.get(nodo.padre) : null
    if (padre) padre.hijos.push(nodo)
    else raices.push(nodo)
  }
  for (const nodo of porSlug.values()) nodo.hijos = ordenarCategorias(nodo.hijos)
  return { raices: ordenarCategorias(raices), porSlug }
}

/** Nodos de la raiz hasta `slug` (para migas). */
export function cadenaDeCategoria(arbol, slug) {
  const cadena = []
  const vistos = new Set()
  let actual = arbol?.porSlug.get(slug)
  while (actual && !vistos.has(actual.slug)) {
    vistos.add(actual.slug)
    cadena.unshift(actual)
    actual = actual.padre ? arbol.porSlug.get(actual.padre) : null
  }
  return cadena
}

export const enlaceCategoria = (slug) => (slug ? `/productos/${encodeURIComponent(slug)}` : '/productos')

/**
 * Que hacer con el slug de `/productos/:categoria`:
 *   { nodo }              categoria del ERP con productos
 *   { redirigir: slug }   link viejo de linea -> su categoria equivalente
 *   { inexistente: true } no existe (o quedo sin productos)
 */
export function resolverCategoria(arbol, slug) {
  if (!slug) return {}
  const nodo = arbol?.porSlug.get(slug)
  if (nodo) return { nodo }
  const destino = LINEAS_VIEJAS[slug]
  if (destino && arbol?.porSlug.has(destino)) return { redirigir: destino }
  return { inexistente: true }
}
