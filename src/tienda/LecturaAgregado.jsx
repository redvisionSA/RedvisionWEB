import { useCallback, useEffect, useRef, useState } from 'react'
import { useTienda } from './TiendaContext.jsx'
import { GlifoOsd } from './piezas.jsx'

/**
 * Confirmación de «agregado al pedido» como lectura sobreimpresa (Aspecto 6,
 * «OSD / visor»): una franja de vidrio ahumado arriba a la derecha, debajo de la
 * barra (donde la cámara pone su texto), con la lectura en mono, el nombre y
 * «Ver pedido». Si era la última unidad, la lectura lleva el REC. Solo
 * confirma: los errores van en un Aviso dentro de la página. Si el agregado
 * abre el cajón del carrito, no hace falta. 3,5 s, pausa con mouse o foco.
 */
const DURA = 3500

export default function LecturaAgregado() {
  const { ultimoAgregado, catalogo, resumen, carritoAbierto, setCarritoAbierto } = useTienda()
  const [lectura, setLectura] = useState(null)
  const reloj = useRef(null)

  const cerrar = useCallback(() => {
    window.clearTimeout(reloj.current)
    setLectura(null)
  }, [])
  const programar = useCallback(() => {
    window.clearTimeout(reloj.current)
    reloj.current = window.setTimeout(() => setLectura(null), DURA)
  }, [])

  useEffect(() => {
    if (!ultimoAgregado) return
    const producto = catalogo.datos.porId?.get(ultimoAgregado.id)
    if (!producto) return
    setLectura({ clave: ultimoAgregado.marca, nombre: producto.nombre, ultima: producto.disponibilidad === 'ultimas' })
    programar()
  }, [ultimoAgregado, catalogo.datos.porId, programar])

  useEffect(() => () => window.clearTimeout(reloj.current), [])
  useEffect(() => {
    if (carritoAbierto) cerrar()
  }, [carritoAbierto, cerrar])

  if (!lectura) return null
  const items = resumen.unidades
  return (
    <div
      key={lectura.clave}
      className="rv-lectura-flotante"
      role="status"
      onMouseEnter={() => window.clearTimeout(reloj.current)}
      onMouseLeave={programar}
      onFocus={() => window.clearTimeout(reloj.current)}
      onBlur={programar}
    >
      <p className="rv-lectura-flotante__osd">
        {lectura.ultima ? <span className="rv-rec" aria-hidden="true" /> : <GlifoOsd forma="lleno" className="h-2 w-2" />}
        <b>{lectura.ultima ? 'Última unidad' : 'Agregado'}</b>
        <span>
          · pedido {String(items).padStart(2, '0')} {items === 1 ? 'ítem' : 'ítems'}
        </span>
      </p>
      <p className="rv-lectura-flotante__nombre">{lectura.nombre}</p>
      <button
        type="button"
        className="rv-lectura-flotante__ver"
        onClick={() => {
          cerrar()
          setCarritoAbierto(true)
        }}
      >
        Ver pedido
      </button>
    </div>
  )
}
