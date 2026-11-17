import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { pedir } from './api.js'
import * as sesion from './sesion.js'
import { mapaDePrecios, stockDeSesion } from '../tienda/catalogo.js'

/**
 * CuentaContext
 * -----------------------------------------------------------------------
 * La cuenta del cliente que entro a la tienda:
 *   { username (documento o null), email, name, priceTier, link } o null.
 * Al cargar el sitio con una sesion guardada se muestra el nombre al instante
 * y se confirma contra el ERP (GET me); si el ERP la rechaza, se olvida. Ver
 * sesion.js para el manejo de los tokens.
 *
 * `canal`: precios de la lista del cliente cuando no es Gremio (el catalogo
 * publico ya es Gremio). { tier, etiqueta, precios: Map(id -> { precio,
 * precioSinIva }) } o
 * null. Los superpone TiendaContext sobre el catalogo.
 *
 * `stock`: cuantas hay de cada producto (GET me/stock), solo con sesion y
 * para todos los canales: Map(id -> { unidades, mas }) o null. El ERP la
 * topea en 10 («+10 en stock») y la guarda un minuto; aca se vuelve a pedir
 * al volver a la pestana si paso ese minuto. Sin sesion o si falla, la
 * tienda muestra los tramos publicos.
 */

/* Igual que la cache del ERP para me/stock */
const STOCK_VIGENCIA_MS = 60_000

export const LISTAS = { GREMIO: 'Gremio', MAYORISTA: 'Mayorista', DISTRIBUIDOR: 'Distribuidor' }

const CuentaContext = createContext(null)

export function CuentaProvider({ children }) {
  const [cuenta, setCuentaEstado] = useState(() => sesion.leerGuardada()?.cuenta ?? null)
  const [canal, setCanal] = useState(null)
  const [stock, setStock] = useState(null)

  const setCuenta = useCallback((datos) => {
    if (datos) sesion.guardarCuenta(datos)
    setCuentaEstado(datos)
  }, [])

  const actualizar = useCallback(async () => {
    try {
      const datos = await sesion.conSesion((token) => pedir('me', { metodo: 'GET', token }))
      setCuenta(datos)
      return datos
    } catch (error) {
      if (error.status === 401 || error.status === 400) setCuentaEstado(null)
      throw error
    }
  }, [setCuenta])

  /* Confirma la sesion guardada al entrar */
  useEffect(() => {
    if (sesion.leerGuardada()) actualizar().catch(() => {})
  }, [actualizar])

  /* Salir o entrar en otra pestana se refleja en esta */
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === sesion.CLAVE_SESION || event.key === null) setCuentaEstado(sesion.sincronizar())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  /* Precios de su lista: solo si no es Gremio. Si fallan, se ven los publicos. */
  const tier = cuenta?.priceTier
  const quien = cuenta ? cuenta.username || cuenta.email : null
  useEffect(() => {
    setCanal(null)
    if (!quien || !tier || tier === 'GREMIO') return undefined
    let vivo = true
    sesion
      .conSesion((token) => pedir('me/prices', { metodo: 'GET', token }))
      .then((r) => {
        if (vivo && r?.priceTier && r.priceTier !== 'GREMIO') {
          setCanal({ tier: r.priceTier, etiqueta: LISTAS[r.priceTier] || r.priceTier, precios: mapaDePrecios(r.prices) })
        }
      })
      .catch((error) => console.warn('[cuenta] Precios de la lista no disponibles:', error.message))
    return () => {
      vivo = false
    }
  }, [quien, tier])

  /* Cantidades en stock: al entrar y al volver a la pestana (si vencieron) */
  useEffect(() => {
    setStock(null)
    if (!quien) return undefined
    let vivo = true
    let pedido = 0
    const cargar = () => {
      pedido = Date.now()
      sesion
        .conSesion((token) => pedir('me/stock', { metodo: 'GET', token }))
        .then((r) => {
          if (vivo) setStock(stockDeSesion(r))
        })
        .catch((error) => console.warn('[cuenta] Stock no disponible:', error.message))
    }
    const alVolver = () => {
      if (document.visibilityState === 'visible' && Date.now() - pedido > STOCK_VIGENCIA_MS) cargar()
    }
    cargar()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      vivo = false
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [quien])

  const conSesionNueva = useCallback(
    async (ruta, cuerpo) => {
      const nueva = sesion.iniciar(await pedir(ruta, { cuerpo }))
      setCuentaEstado(nueva)
      return nueva
    },
    []
  )

  const valor = useMemo(
    () => ({
      cuenta,
      canal,
      stock,
      actualizar,
      ingresar: (login, password) => conSesionNueva('auth/login', { login, password }),
      activar: (token, password) => conSesionNueva('auth/activate', { token, password }),
      activarConCodigo: ({ login, code, email, password }) => conSesionNueva('auth/activate-code', { login, code, email, password }),
      registrar: ({ email, code, taxId, name, password }) => conSesionNueva('auth/register/complete', { email, code, taxId, name, password }),
      /* Cierra todas las sesiones de la cuenta en el ERP: la de aca tambien */
      restablecer: async (token, password) => {
        await pedir('auth/reset-password', { cuerpo: { token, password } })
        sesion.olvidar()
        setCuentaEstado(null)
      },
      cambiarContrasena: async (currentPassword, newPassword) => {
        const dto = await sesion.conSesion((token) => pedir('me/password', { cuerpo: { currentPassword, newPassword }, token }))
        setCuentaEstado(sesion.reemplazar(dto))
      },
      salir: async () => {
        await sesion.cerrar()
        setCuentaEstado(null)
      },
    }),
    [cuenta, canal, stock, actualizar, conSesionNueva]
  )

  return <CuentaContext.Provider value={valor}>{children}</CuentaContext.Provider>
}

export function useCuenta() {
  const ctx = useContext(CuentaContext)
  if (!ctx) throw new Error('useCuenta fuera de CuentaProvider')
  return ctx
}
