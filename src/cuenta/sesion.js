import { ErrorCuenta, pedir } from './api.js'

/**
 * sesion.js — la sesion del cliente en este navegador
 * -----------------------------------------------------------------------
 * - accessToken (15 min): solo en memoria, nunca en almacenamiento.
 * - refreshToken (30 dias, rotativo): en localStorage junto con los datos
 *   de la cuenta para el encabezado. Cada renovacion devuelve uno nuevo y el
 *   anterior queda usado: si se reusa uno viejo, el ERP cierra TODAS las
 *   sesiones de la cuenta.
 *
 * Por eso la renovacion corre bajo un candado entre pestanas (Web Locks) y
 * siempre lee el refreshToken vigente del almacenamiento justo antes de
 * usarlo: dos pestanas que renuevan a la vez lo hacen en fila, cada una con
 * el ultimo token, y nunca mandan uno ya usado.
 */

const CLAVE = 'rv-cuenta-v1'
const CANDADO = 'rv-cuenta-sesion'
const MARGEN_MS = 30_000 // renovar un poco antes del vencimiento

let acceso = null // { token, vence, usuario }

/* Usuario (documento) o, en una cuenta sin cliente, su correo */
const identidad = (cuenta) => cuenta?.username || cuenta?.email || null

export function leerGuardada() {
  try {
    const crudo = window.localStorage.getItem(CLAVE)
    const valor = crudo ? JSON.parse(crudo) : null
    return valor?.refreshToken ? valor : null
  } catch {
    return null
  }
}

function guardar(valor) {
  try {
    if (valor) window.localStorage.setItem(CLAVE, JSON.stringify(valor))
    else window.localStorage.removeItem(CLAVE)
  } catch {
    /* sin almacenamiento: la sesion dura lo que dure la pestana */
  }
}

function conCandado(fn) {
  if (typeof navigator !== 'undefined' && navigator.locks?.request) return navigator.locks.request(CANDADO, fn)
  return fn()
}

/** La clave de localStorage, para escuchar cambios de otras pestanas. */
export const CLAVE_SESION = CLAVE

/** Guarda la sesion que devolvio el ERP (login, activacion, renovacion). */
function abrir(dto) {
  acceso = { token: dto.accessToken, vence: Date.now() + dto.expiresIn * 1000 - MARGEN_MS, usuario: identidad(dto.account) }
  guardar({ refreshToken: dto.refreshToken, cuenta: dto.account })
  return dto.account
}

/**
 * Sesion nueva desde un formulario (ingresar, activar). Si este navegador ya
 * tenia otra, se cierra en el ERP para no dejarla viva.
 */
export function iniciar(dto) {
  const previa = leerGuardada()
  const cuenta = abrir(dto)
  if (previa && previa.refreshToken !== dto.refreshToken) {
    pedir('auth/logout', { cuerpo: { refreshToken: previa.refreshToken } }).catch(() => {})
  }
  return cuenta
}

/** Sesion que reemplaza a la actual de la misma cuenta (cambio de contrasena). */
export const reemplazar = abrir

/** Datos frescos de la cuenta (GET me) para el encabezado de la proxima visita. */
export function guardarCuenta(cuenta) {
  const guardada = leerGuardada()
  if (guardada) guardar({ ...guardada, cuenta })
}

/**
 * accessToken vigente (renueva si hace falta) o null si no hay sesion o no se
 * pudo renovar. Para pasarselo a /api/pedido, que lee los precios de la lista
 * del cliente en el ERP con el.
 */
export async function tokenVigente() {
  try {
    return await conSesion(async (token) => token)
  } catch {
    return null
  }
}

/** Olvida la sesion local sin llamar al ERP (ya la cerro el, p. ej. al restablecer). */
export function olvidar() {
  acceso = null
  guardar(null)
}

/**
 * Otra pestana cambio la sesion guardada. Si salio o entro con otra cuenta,
 * el accessToken de esta pestana ya no corresponde. Devuelve la cuenta vigente.
 */
export function sincronizar() {
  const guardada = leerGuardada()
  if (!guardada || identidad(guardada.cuenta) !== acceso?.usuario) acceso = null
  return guardada?.cuenta ?? null
}

/**
 * Renueva el accessToken. `fallido` es el token que el ERP acaba de
 * rechazar: si mientras se esperaba el candado otra llamada ya consiguio uno
 * distinto y vigente, se usa ese y no se gasta otro refreshToken.
 * Devuelve la cuenta, o null si no hay sesion.
 */
function renovar(fallido = null) {
  return conCandado(async () => {
    if (acceso && acceso.vence > Date.now() && acceso.token !== fallido) return leerGuardada()?.cuenta ?? null
    const guardada = leerGuardada()
    if (!guardada) {
      acceso = null
      return null
    }
    try {
      return abrir(await pedir('auth/refresh', { cuerpo: { refreshToken: guardada.refreshToken } }))
    } catch (error) {
      /* 401: vencida, cerrada o reusada; 400: token roto. Sin red o 5xx: se conserva. */
      if (error.status === 401 || error.status === 400) olvidar()
      throw error
    }
  })
}

/**
 * Corre `fn(accessToken)` con un token vigente; si el ERP lo rechaza (401)
 * renueva una sola vez y reintenta.
 */
export async function conSesion(fn) {
  if (!acceso || acceso.vence <= Date.now()) await renovar()
  if (!acceso) throw new ErrorCuenta(401, 'Ingrese a su cuenta.')
  const token = acceso.token
  try {
    return await fn(token)
  } catch (error) {
    if (error.status !== 401) throw error
    await renovar(token)
    if (!acceso) throw error
    return fn(acceso.token)
  }
}

/** Cierra la sesion en este navegador y en el ERP. */
export function cerrar() {
  return conCandado(async () => {
    const guardada = leerGuardada()
    olvidar()
    if (guardada) await pedir('auth/logout', { cuerpo: { refreshToken: guardada.refreshToken } }).catch(() => {})
  })
}
