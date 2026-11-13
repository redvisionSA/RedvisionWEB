/**
 * POST /api/evento — cuenta un gesto de compra sobre productos (Cloudflare Pages + D1).
 * -----------------------------------------------------------------------
 * Cuerpo: { tipo: 'busqueda' | 'carrito' | 'pedido', ids: [id de producto] }.
 *
 * Sin datos personales: se guarda dia, producto, gesto y un "origen" que es el
 * hash SHA-256 de (IP + dia + sal secreta), recortado. Sirve solo para contar
 * una vez por visitante y por dia (nadie infla el ranking recargando), y no
 * permite recuperar la IP. Tabla: docs/popularidad.sql. Binding D1: `DB`.
 * Sal: variable `POPULARIDAD_SAL` (sin ella se usa una fija: el conteo sigue
 * siendo unico por dia, solo es menos resistente a abuso).
 */

const TIPOS = new Set(['busqueda', 'carrito', 'pedido'])
const ID = /^[A-Za-z0-9-]{1,64}$/

async function hash(texto) {
  const datos = new TextEncoder().encode(texto)
  const digest = await crypto.subtle.digest('SHA-256', datos)
  return [...new Uint8Array(digest)].slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('')
}

export async function onRequestPost({ request, env }) {
  const sinContenido = new Response(null, { status: 204 })
  if (!env.DB) return sinContenido

  let cuerpo
  try {
    cuerpo = await request.json()
  } catch {
    return new Response(null, { status: 400 })
  }
  const tipo = String(cuerpo?.tipo || '')
  const ids = Array.isArray(cuerpo?.ids) ? [...new Set(cuerpo.ids.map(String))].filter((x) => ID.test(x)).slice(0, 30) : []
  if (!TIPOS.has(tipo) || !ids.length) return new Response(null, { status: 400 })

  const dia = new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10) // dia de Argentina
  const ip = request.headers.get('CF-Connecting-IP') || 'sin-ip'
  const origen = await hash(`${ip}|${dia}|${env.POPULARIDAD_SAL || 'redvision-web'}`)

  const sentencia = env.DB.prepare('INSERT OR IGNORE INTO eventos (dia, producto, tipo, origen) VALUES (?1, ?2, ?3, ?4)')
  await env.DB.batch(ids.map((id) => sentencia.bind(dia, id, tipo, origen)))
  return sinContenido
}

export function onRequest() {
  return new Response(null, { status: 405, headers: { Allow: 'POST' } })
}
