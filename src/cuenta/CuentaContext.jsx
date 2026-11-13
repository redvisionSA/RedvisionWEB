import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { pedir } from './api.js'
import * as sesion from './sesion.js'

/**
 * CuentaContext
 * -----------------------------------------------------------------------
 * La cuenta del cliente que entro a la tienda: { username, email, name } o
 * null. Al cargar el sitio con una sesion guardada se muestra el nombre al
 * instante y se confirma contra el ERP (GET me); si el ERP la rechaza, se
 * olvida. Ver sesion.js para el manejo de los tokens.
 */

const CuentaContext = createContext(null)

export function CuentaProvider({ children }) {
  const [cuenta, setCuenta] = useState(() => sesion.leerGuardada()?.cuenta ?? null)

  const actualizar = useCallback(async () => {
    try {
      const datos = await sesion.conSesion((token) => pedir('me', { metodo: 'GET', token }))
      setCuenta(datos)
      return datos
    } catch (error) {
      if (error.status === 401 || error.status === 400) setCuenta(null)
      throw error
    }
  }, [])

  /* Confirma la sesion guardada al entrar */
  useEffect(() => {
    if (sesion.leerGuardada()) actualizar().catch(() => {})
  }, [actualizar])

  /* Salir o entrar en otra pestana se refleja en esta */
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === sesion.CLAVE_SESION || event.key === null) setCuenta(sesion.sincronizar())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const conSesionNueva = useCallback(async (ruta, cuerpo) => {
    const nueva = sesion.iniciar(await pedir(ruta, { cuerpo }))
    setCuenta(nueva)
    return nueva
  }, [])

  const valor = useMemo(
    () => ({
      cuenta,
      actualizar,
      ingresar: (login, password) => conSesionNueva('auth/login', { login, password }),
      activar: (token, password) => conSesionNueva('auth/activate', { token, password }),
      activarConCodigo: ({ login, code, email, password }) => conSesionNueva('auth/activate-code', { login, code, email, password }),
      /* Cierra todas las sesiones de la cuenta en el ERP: la de aca tambien */
      restablecer: async (token, password) => {
        await pedir('auth/reset-password', { cuerpo: { token, password } })
        sesion.olvidar()
        setCuenta(null)
      },
      cambiarContrasena: async (currentPassword, newPassword) => {
        const dto = await sesion.conSesion((token) => pedir('me/password', { cuerpo: { currentPassword, newPassword }, token }))
        setCuenta(sesion.reemplazar(dto))
      },
      salir: async () => {
        await sesion.cerrar()
        setCuenta(null)
      },
    }),
    [cuenta, actualizar, conSesionNueva]
  )

  return <CuentaContext.Provider value={valor}>{children}</CuentaContext.Provider>
}

export function useCuenta() {
  const ctx = useContext(CuentaContext)
  if (!ctx) throw new Error('useCuenta fuera de CuentaProvider')
  return ctx
}
