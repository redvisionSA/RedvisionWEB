/**
 * api.js — cuentas de clientes de la tienda
 * -----------------------------------------------------------------------
 * Habla con el modulo de cuentas del ERP (contrato: CONTRACTS.md del ERP,
 * seccion «customer_portal»):
 *
 *   VITE_CUENTAS_URL   base de la tienda en el ERP, sin barra final
 *
 * Sin la variable se usa la de produccion. Solo pueden entrar clientes de
 * los puntos de venta (Gremio, Mayorista, Distribuidor) que el vendedor dio
 * de alta. Sin cookies: el CORS del ERP no acepta credenciales.
 *
 * Los errores llegan con un `message` en castellano pensado para mostrarse
 * tal cual; aca solo se completa lo que la API no puede decir (sin red,
 * modulo apagado).
 */

export const CUENTAS_PRODUCCION = 'https://api-erp.redvision.com.ar/shop/redvision'

const BASE = (import.meta.env.VITE_CUENTAS_URL || CUENTAS_PRODUCCION).replace(/\/+$/, '')

export class ErrorCuenta extends Error {
  constructor(status, message, code) {
    super(message)
    this.status = status
    this.code = code
  }
}

const MENSAJES = {
  0: 'No se pudo conectar con el servidor. Verifique su conexión e intente nuevamente.',
  /* `/shop/*` responde 404 mientras las cuentas estan apagadas en el ERP */
  404: 'El acceso de clientes todavía no está habilitado. Consulte a su vendedor.',
  429: 'Demasiados intentos seguidos. Espere un minuto e intente nuevamente.',
}
const MENSAJE_GENERICO = 'No se pudo completar la operación. Intente nuevamente en unos minutos.'

/**
 * POST (o GET) a la API de cuentas. Devuelve el JSON, o null en 202/204.
 * Lanza ErrorCuenta con el mensaje listo para mostrar.
 */
export async function pedir(ruta, { metodo = 'POST', cuerpo, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  let respuesta
  try {
    respuesta = await fetch(`${BASE}/${ruta}`, {
      method: metodo,
      headers,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      credentials: 'omit',
      cache: 'no-store',
      signal,
    })
  } catch (error) {
    if (error?.name === 'AbortError') throw error
    throw new ErrorCuenta(0, MENSAJES[0])
  }

  if (respuesta.status === 202 || respuesta.status === 204) return null
  const datos = await respuesta.json().catch(() => null)
  if (respuesta.ok) return datos

  const status = respuesta.status
  const mensaje = status === 404 ? MENSAJES[404] : (typeof datos?.message === 'string' && datos.message) || MENSAJES[status] || MENSAJE_GENERICO
  throw new ErrorCuenta(status, mensaje, datos?.code)
}
