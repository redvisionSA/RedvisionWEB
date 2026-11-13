/**
 * GET /api/populares — los productos mas buscados y cotizados de los ultimos 7 dias.
 * -----------------------------------------------------------------------
 * Puntaje: busqueda 1, carrito 3, pedido 5 (cada visitante cuenta una vez por
 * dia, producto y gesto; ver evento.js). Respuesta: { ids: [...], dias: 7 },
 * cacheada 10 minutos. Sin base configurada: { ids: [] } y el inicio usa los
 * destacados. De paso borra lo de mas de 30 dias (no hace falta guardarlo).
 */

export async function onRequestGet({ env }) {
  const cabeceras = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=600' }
  if (!env.DB) return new Response(JSON.stringify({ ids: [], dias: 7 }), { headers: cabeceras })

  const { results } = await env.DB.prepare(
    `SELECT producto, SUM(CASE tipo WHEN 'pedido' THEN 5 WHEN 'carrito' THEN 3 ELSE 1 END) AS puntos
       FROM eventos
      WHERE dia >= date('now', '-3 hours', '-7 days')
      GROUP BY producto
      ORDER BY puntos DESC, producto
      LIMIT 16`
  ).all()

  if (Math.random() < 0.02) {
    await env.DB.prepare(`DELETE FROM eventos WHERE dia < date('now', '-30 days')`).run()
  }

  return new Response(JSON.stringify({ ids: (results || []).map((r) => r.producto), dias: 7 }), { headers: cabeceras })
}
