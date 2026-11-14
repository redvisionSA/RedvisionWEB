import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { cargarCatalogo, conPreciosDeCanal, normalizarCatalogo } from './catalogo.js'
import { useCuenta } from '../cuenta/CuentaContext.jsx'
import { registrarEvento } from './popularidad.js'

/**
 * TiendaContext
 * -----------------------------------------------------------------------
 * Estado de la tienda compartido por todas las paginas:
 *
 *   catalogo    { estado: 'cargando'|'listo'|'error'|'sin-fuente', datos }
 *   carrito     [{ id, cantidad }]   solo ids: el precio nunca viaja desde
 *                                    el navegador, lo resuelve el servidor
 *   favoritos   [id]
 *   vistos      [id]  ultimos productos abiertos (mas reciente primero)
 *
 * Carrito, favoritos y vistos persisten en localStorage del visitante. Si el
 * almacenamiento no esta disponible (modo privado, bloqueado) la tienda
 * funciona igual durante la visita.
 */

const TiendaContext = createContext(null)

const CLAVES = { carrito: 'rv-carrito-v1', favoritos: 'rv-favoritos-v1', vistos: 'rv-vistos-v1' }
const MAX_CANTIDAD = 99
const MAX_VISTOS = 12

function leer(clave, porDefecto) {
  try {
    const crudo = window.localStorage.getItem(clave)
    const valor = crudo ? JSON.parse(crudo) : porDefecto
    return Array.isArray(valor) ? valor : porDefecto
  } catch {
    return porDefecto
  }
}

function usePersistido(clave, porDefecto) {
  const [valor, setValor] = useState(() => leer(clave, porDefecto))
  useEffect(() => {
    try {
      window.localStorage.setItem(clave, JSON.stringify(valor))
    } catch {
      /* sin almacenamiento: queda en memoria */
    }
  }, [clave, valor])
  return [valor, setValor]
}

const VACIO = { estado: 'cargando', datos: normalizarCatalogo({}) }

export function TiendaProvider({ children }) {
  const [catalogoPublico, setCatalogo] = useState(VACIO)
  const { canal } = useCuenta()
  const [intento, setIntento] = useState(0)
  const [carrito, setCarrito] = usePersistido(CLAVES.carrito, [])
  const [favoritos, setFavoritos] = usePersistido(CLAVES.favoritos, [])
  const [vistos, setVistos] = usePersistido(CLAVES.vistos, [])
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [ultimoAgregado, setUltimoAgregado] = useState(null)

  useEffect(() => {
    const control = new AbortController()
    setCatalogo((c) => ({ ...c, estado: 'cargando' }))
    cargarCatalogo({ signal: control.signal })
      .then(setCatalogo)
      .catch((error) => {
        if (control.signal.aborted) return
        console.error('[tienda] No se pudo cargar el catálogo:', error)
        setCatalogo({ estado: 'error', datos: normalizarCatalogo({}) })
      })
    return () => control.abort()
  }, [intento])

  /* Con sesion de un cliente Mayorista o Distribuidor, sus precios reemplazan
     a los publicos en toda la tienda: tarjetas, ficha, buscador, filtros,
     carrito y mensaje del pedido. Al salir vuelven los publicos. */
  const catalogo = useMemo(
    () => (canal ? { ...catalogoPublico, datos: conPreciosDeCanal(catalogoPublico.datos, canal) } : catalogoPublico),
    [catalogoPublico, canal]
  )

  const reintentar = useCallback(() => setIntento((n) => n + 1), [])

  const agregar = useCallback(
    (id, cantidad = 1, { abrir = true } = {}) => {
      setCarrito((items) => {
        const existente = items.find((i) => i.id === id)
        if (existente) {
          return items.map((i) => (i.id === id ? { ...i, cantidad: Math.min(MAX_CANTIDAD, i.cantidad + cantidad) } : i))
        }
        return [...items, { id, cantidad: Math.min(MAX_CANTIDAD, cantidad) }]
      })
      registrarEvento('carrito', [id])
      setUltimoAgregado({ id, marca: Date.now() })
      if (abrir) setCarritoAbierto(true)
    },
    [setCarrito]
  )

  const cambiarCantidad = useCallback(
    (id, cantidad) => {
      const n = Math.max(0, Math.min(MAX_CANTIDAD, Math.floor(Number(cantidad) || 0)))
      setCarrito((items) => (n === 0 ? items.filter((i) => i.id !== id) : items.map((i) => (i.id === id ? { ...i, cantidad: n } : i))))
    },
    [setCarrito]
  )

  const quitar = useCallback((id) => setCarrito((items) => items.filter((i) => i.id !== id)), [setCarrito])
  const vaciar = useCallback(() => setCarrito([]), [setCarrito])

  const alternarFavorito = useCallback(
    (id) => setFavoritos((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [id, ...ids])),
    [setFavoritos]
  )

  const registrarVisto = useCallback(
    (id) => setVistos((ids) => [id, ...ids.filter((x) => x !== id)].slice(0, MAX_VISTOS)),
    [setVistos]
  )

  /* Lineas del carrito resueltas contra el catalogo. Un producto que dejo de
     publicarse queda marcado como no disponible en vez de desaparecer solo. */
  const lineas = useMemo(
    () =>
      carrito.map((item) => {
        const producto = catalogo.datos.porId.get(item.id) || null
        return {
          ...item,
          producto,
          subtotal: producto && producto.precio !== null ? producto.precio * item.cantidad : null,
        }
      }),
    [carrito, catalogo.datos]
  )

  const resumen = useMemo(() => {
    const unidades = carrito.reduce((s, i) => s + i.cantidad, 0)
    const conPrecio = lineas.filter((l) => l.subtotal !== null)
    return {
      unidades,
      subtotal: conPrecio.reduce((s, l) => s + l.subtotal, 0),
      hayAConfirmar: lineas.some((l) => l.subtotal === null),
    }
  }, [carrito, lineas])

  const valor = useMemo(
    () => ({
      catalogo,
      reintentar,
      carrito,
      lineas,
      resumen,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      favoritos,
      alternarFavorito,
      vistos,
      registrarVisto,
      carritoAbierto,
      setCarritoAbierto,
      ultimoAgregado,
    }),
    [
      catalogo,
      reintentar,
      carrito,
      lineas,
      resumen,
      agregar,
      cambiarCantidad,
      quitar,
      vaciar,
      favoritos,
      alternarFavorito,
      vistos,
      registrarVisto,
      carritoAbierto,
      ultimoAgregado,
    ]
  )

  return <TiendaContext.Provider value={valor}>{children}</TiendaContext.Provider>
}

export function useTienda() {
  const ctx = useContext(TiendaContext)
  if (!ctx) throw new Error('useTienda debe usarse dentro de <TiendaProvider>')
  return ctx
}
