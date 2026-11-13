import { useEffect, useState } from 'react'

/**
 * popularidad.js — "lo más buscado y cotizado" de la tienda.
 * -----------------------------------------------------------------------
 * El navegador avisa, sin datos personales, tres gestos sobre un producto:
 *   busqueda  lo eligio desde el buscador
 *   carrito   lo agrego al carrito (cotizacion)
 *   pedido    lo incluyo en un pedido confirmado
 * functions/api/evento.js los cuenta por dia (uno por visitante, producto y
 * gesto) y functions/api/populares.js devuelve el ranking de los ultimos 7
 * dias. Si la base no esta configurada, el inicio cae a los destacados.
 */

export function registrarEvento(tipo, ids) {
  const lista = [...new Set((ids || []).filter(Boolean).map(String))].slice(0, 30)
  if (!lista.length || import.meta.env.DEV) return
  const cuerpo = JSON.stringify({ tipo, ids: lista })
  try {
    if (navigator.sendBeacon?.('/api/evento', new Blob([cuerpo], { type: 'application/json' }))) return
    fetch('/api/evento', { method: 'POST', body: cuerpo, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {})
  } catch {
    /* la estadistica nunca rompe la compra */
  }
}

let cache = null
export function usePopulares() {
  const [ids, setIds] = useState(cache)
  useEffect(() => {
    if (cache || import.meta.env.DEV) return undefined
    let vivo = true
    fetch('/api/populares')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        cache = Array.isArray(json?.ids) ? json.ids.map(String) : []
        if (vivo) setIds(cache)
      })
      .catch(() => vivo && setIds([]))
    return () => {
      vivo = false
    }
  }, [])
  return ids
}
