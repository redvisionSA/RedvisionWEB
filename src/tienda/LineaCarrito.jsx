import { Link } from 'react-router-dom'
import { useTienda } from './TiendaContext.jsx'
import { formatoPrecio } from './formato.js'
import { ImagenProducto } from './piezas.jsx'
import { IconoBasura, IconoMas, IconoMenos } from './Iconos.jsx'

/** Selector de cantidad: botones de 44 px, input a 16 px (sin zoom en iOS). */
export function Cantidad({ valor, onCambiar, etiqueta = 'Cantidad', min = 1 }) {
  return (
    <div
      className="rv-sutil inline-flex items-center rounded-pill"
    >
      <button
        type="button"
        onClick={() => onCambiar(valor - 1)}
        disabled={valor <= min}
        aria-label="Restar uno"
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-pill text-black hover:text-rv-red disabled:cursor-not-allowed disabled:opacity-35 dark:text-white"
      >
        <IconoMenos className="h-4 w-4" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={99}
        value={valor}
        onChange={(e) => onCambiar(e.target.value)}
        aria-label={etiqueta}
        className="num w-10 bg-transparent text-center font-display text-base font-semibold text-black outline-none [appearance:textfield] dark:text-white [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onCambiar(valor + 1)}
        disabled={valor >= 99}
        aria-label="Sumar uno"
        className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-pill text-black hover:text-rv-red disabled:opacity-35 dark:text-white"
      >
        <IconoMas className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function LineaCarrito({ linea, onNavegar, compacta = false }) {
  const { cambiarCantidad, quitar } = useTienda()
  const { producto, cantidad, subtotal } = linea

  if (!producto) {
    return (
      <li className="flex items-center justify-between gap-3 py-3">
        <p className="rv-muted text-sm">Un producto del carrito ya no está publicado.</p>
        <button type="button" onClick={() => quitar(linea.id)} className="rv-link text-xs font-semibold">
          Quitar
        </button>
      </li>
    )
  }

  return (
    <li className="flex gap-3 py-3.5">
      <Link to={`/producto/${producto.slug}`} onClick={onNavegar} className="group shrink-0">
        <ImagenProducto producto={producto} tamano="sm" className={`${compacta ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24'} rounded-2xl`} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link
          to={`/producto/${producto.slug}`}
          onClick={onNavegar}
          className="line-clamp-2 text-sm font-semibold leading-snug text-black hover:text-rv-red dark:text-white"
        >
          {producto.nombre}
        </Link>
        <p className="rv-muted mt-0.5 text-xs">
          {producto.sku && <span className="mr-2">Cód. {producto.sku}</span>}
          {producto.precio !== null ? `${formatoPrecio(producto.precio)} c/u` : 'Precio a confirmar'}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <Cantidad valor={cantidad} onCambiar={(n) => cambiarCantidad(producto.id, n)} etiqueta={`Cantidad de ${producto.nombre}`} />
          <div className="flex items-center gap-1">
            <span className="num font-display text-sm font-bold text-black dark:text-white">
              {subtotal !== null ? formatoPrecio(subtotal) : 'A confirmar'}
            </span>
            <button
              type="button"
              onClick={() => quitar(producto.id)}
              aria-label={`Quitar ${producto.nombre}`}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-pill text-black/50 hover:text-rv-red dark:text-white/55"
            >
              <IconoBasura className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
