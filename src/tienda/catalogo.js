import { lineaDe } from './lineas.js'
import { normalizarTexto, slugify } from './formato.js'
import { extraerSpecs } from './specs.js'
import { indexar } from './motor.js'
import { esGenerica, identidadDe } from './marcas.js'
import { arbolCategorias, indiceCategorias, rutaDeCategoria } from './categorias.js'

/**
 * catalogo.js
 * -----------------------------------------------------------------------
 * Unica puerta de entrada de datos de producto. La fuente es el ERP de la
 * empresa, en modo solo lectura (contrato en docs/CATALOGO_API.md):
 *
 *   VITE_CATALOGO_URL   endpoint publico del ERP con el catalogo de REDVISION
 *
 * Sin esa variable:
 *   - en desarrollo se usa un catalogo de demostracion (src/tienda/demo.js),
 *     marcado como tal en pantalla. Nunca entra al build de produccion.
 *   - en produccion la tienda queda vacia y lo dice: no se inventan productos,
 *     precios ni stock.
 */

/* Endpoint publico del ERP (no es un secreto: lo lee cualquier navegador). En
   produccion es el valor por defecto, asi un build sin la variable no deja la
   tienda vacia; en desarrollo, sin variable, se usa la demostracion. */
export const CATALOGO_PRODUCCION = 'https://api-erp.redvision.com.ar/storefront/catalog'

const URL_CATALOGO = import.meta.env.VITE_CATALOGO_URL || (import.meta.env.PROD ? CATALOGO_PRODUCCION : '')

export const DISPONIBILIDAD = {
  disponible: { etiqueta: 'Disponible', tono: 'ok' },
  ultimas: { etiqueta: 'Últimas unidades', tono: 'alerta' },
  a_pedido: { etiqueta: 'A pedido', tono: 'neutro' },
  sin_stock: { etiqueta: 'Sin stock', tono: 'apagado' },
}

/* Orden de disponibilidad para listar primero lo que se puede llevar hoy */
const PESO_DISPONIBILIDAD = { disponible: 0, ultimas: 1, a_pedido: 2, sin_stock: 3 }

function aNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null
  const n = Number(valor)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function normalizarCatalogo(crudo, { demo = false } = {}) {
  const categorias = new Map((crudo.categories || []).map((c) => [c.slug, c]))
  const marcas = new Map((crudo.brands || []).map((m) => [m.slug, m]))
  const indice = indiceCategorias(crudo.categories)

  /* Nombre completo de la categoria (con su padre) para ubicarla en una linea */
  const rutaCategoria = (slug) => {
    const partes = []
    let actual = categorias.get(slug)
    let guardia = 0
    while (actual && guardia++ < 6) {
      partes.unshift(actual.name)
      actual = actual.parent ? categorias.get(actual.parent) : null
    }
    return partes.join(' ')
  }

  const productos = (crudo.products || [])
    .filter((p) => p && p.id && p.name)
    .map((p) => {
      const categoria = categorias.get(p.category) || null
      const marcaErp = marcas.get(p.brand) || null
      /* Marca generica o alternativa: no se nombra, pero el producto va a la linea
         de su categoria (un cable generico es de Redes, una fuente de Energia) */
      const generico = esGenerica(marcaErp)
      const marca = generico ? null : marcaErp
      const textoCategoria = rutaCategoria(p.category)
      const disponibilidad = DISPONIBILIDAD[p.availability] ? p.availability : 'a_pedido'
      return {
        id: String(p.id),
        slug: p.slug || slugify(`${p.name}-${p.sku || p.id}`),
        sku: p.sku || '',
        nombre: p.name,
        descripcion: p.description || '',
        marca: marca ? { slug: marca.slug, nombre: marca.name, identidad: identidadDe(marca) } : null,
        categoria: categoria ? { slug: categoria.slug, nombre: indice.get(categoria.slug)?.nombre || categoria.name } : null,
        /* Slugs de la raiz a la hoja: navegar una categoria incluye sus descendientes */
        rutaCategoria: rutaDeCategoria(indice, p.category),
        linea: lineaDe(textoCategoria, p.name),
        imagen: p.imageUrl || null,
        precio: aNumero(p.price),
        disponibilidad,
        destacado: Boolean(p.featured),
        specs: extraerSpecs(p),
        busqueda: normalizarTexto(
          [p.name, p.sku, marca?.name, categoria?.name, textoCategoria, p.description].filter(Boolean).join(' ')
        ),
      }
    })
    .sort(
      (a, b) =>
        PESO_DISPONIBILIDAD[a.disponibilidad] - PESO_DISPONIBILIDAD[b.disponibilidad] ||
        Number(b.destacado) - Number(a.destacado) ||
        a.nombre.localeCompare(b.nombre, 'es')
    )

  return {
    productos,
    porId: new Map(productos.map((p) => [p.id, p])),
    porSlug: new Map(productos.map((p) => [p.slug, p])),
    marcas: [...marcas.values()].filter((m) => !esGenerica(m)).map((m) => ({ slug: m.slug, nombre: m.name, identidad: identidadDe(m) })),
    nombresMarca: new Map([...marcas.values()].filter((m) => !esGenerica(m)).map((m) => [m.slug, m.name])),
    nombresCategoria: new Map([...indice.values()].map((c) => [c.slug, c.nombre])),
    categorias: arbolCategorias(indice, productos),
    motor: indexar(productos),
    actualizado: crudo.updatedAt || null,
    demo,
  }
}

/* Catalogo con los productos reemplazados (precios o stock de la sesion):
   mismos mapas e indice de busqueda, apuntando a los productos nuevos. */
function conProductos(datos, productos) {
  const porId = new Map(productos.map((p) => [p.id, p]))
  return {
    ...datos,
    productos,
    porId,
    porSlug: new Map(productos.map((p) => [p.slug, p])),
    motor: { ...datos.motor, indice: datos.motor.indice.map((e) => ({ ...e, p: porId.get(e.p.id) })) },
  }
}

/**
 * Precios de la lista del cliente con sesion, superpuestos por id al catalogo
 * publico (lista Gremio). `canal` = { etiqueta, precios: Map(id -> numero) }
 * o null. Un producto sin precio en su lista queda en «Consultar precio»:
 * nunca se le muestra el precio Gremio como si fuera el suyo.
 */
export function conPreciosDeCanal(datos, canal) {
  if (!canal) return datos
  return conProductos(
    datos,
    datos.productos.map((p) => ({ ...p, precio: canal.precios.get(p.id) ?? null, canal: canal.etiqueta }))
  )
}

/** Precios del ERP (`[{ id, price }]`, string decimal) a Map(id -> numero). */
export function mapaDePrecios(lista) {
  return new Map((lista || []).map((x) => [String(x.id), aNumero(x.price)]).filter(([, precio]) => precio !== null))
}

/* Hasta cuantas unidades el tramo es «ultimas» (STOREFRONT_LOW_STOCK del ERP) */
const POCAS_UNIDADES = 3

/**
 * Stock del ERP para un cliente con sesion (`GET me/stock`:
 * `{ cap, stock: [{ id, units, more }] }`, topeado en `cap`) a
 * Map(id -> { unidades, mas }). Lo que no figura no tiene nada disponible.
 */
export function stockDeSesion(respuesta) {
  const filas = Array.isArray(respuesta?.stock) ? respuesta.stock : []
  return new Map(
    filas
      .filter((x) => x && x.id && Number.isInteger(x.units) && x.units > 0)
      .map((x) => [String(x.id), { unidades: x.units, mas: Boolean(x.more) }])
  )
}

/**
 * Cantidades del cliente con sesion superpuestas por id al catalogo publico.
 * El ERP las arma con la misma regla que los tramos pero cada minuto (el
 * catalogo, cada 5), asi que el tramo se recalcula con ellas: un producto que
 * no figura ya no tiene unidades (queda «a pedido», salvo el que el catalogo
 * da sin stock). `stock` = Map(id -> { unidades, mas }) o null (sin sesion).
 */
export function conStockDeSesion(datos, stock) {
  if (!stock) return datos
  return conProductos(
    datos,
    datos.productos.map((p) => {
      const s = stock.get(p.id) || null
      const disponibilidad = s
        ? s.mas || s.unidades > POCAS_UNIDADES
          ? 'disponible'
          : 'ultimas'
        : p.disponibilidad === 'sin_stock'
          ? 'sin_stock'
          : 'a_pedido'
      return { ...p, stock: s, disponibilidad }
    })
  )
}

export async function cargarCatalogo({ signal } = {}) {
  if (URL_CATALOGO) {
    const respuesta = await fetch(URL_CATALOGO, { signal, headers: { Accept: 'application/json' } })
    if (!respuesta.ok) throw new Error(`Catálogo: HTTP ${respuesta.status}`)
    return { estado: 'listo', datos: normalizarCatalogo(await respuesta.json()) }
  }

  if (import.meta.env.DEV) {
    const { default: demo } = await import('./demo.js')
    return { estado: 'listo', datos: normalizarCatalogo(demo, { demo: true }) }
  }

  return { estado: 'sin-fuente', datos: normalizarCatalogo({}) }
}
