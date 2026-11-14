import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTienda } from './TiendaContext.jsx'
import { BotonFavorito, Disponibilidad, ImagenProducto, InvitacionStock, LogoMarca, Precio, sePuedeComprar } from './piezas.jsx'
import { IconoCarrito, IconoCheck, IconoWhatsapp } from './Iconos.jsx'
import { enlaceWhatsapp, mensajeProducto } from './whatsapp.js'
import { etiquetasClave } from './specs.js'

/**
 * Tarjeta de producto, superficie solida (la tienda no usa vidrio en las
 * tarjetas: se comparan precios y especificaciones, no se contempla).
 *
 * Jerarquia (escaneo en F): imagen, marca, nombre, especificaciones clave,
 * disponibilidad, precio y una sola accion. `vista="lista"` la acuesta para
 * comparar en fila, como en las tiendas de tecnologia.
 */
function ProductoCard({ producto, className = '', vista = 'grilla' }) {
  const { agregar, carrito } = useTienda()
  const [recien, setRecien] = useState(false)
  const comprable = sePuedeComprar(producto)
  const enCarrito = carrito.some((i) => i.id === producto.id)
  const claves = etiquetasClave(producto.specs || { tecnologias: [] })
  const lista = vista === 'lista'

  function onAgregar(e) {
    e.preventDefault()
    agregar(producto.id, 1, { abrir: carrito.length === 0 })
    setRecien(true)
    window.setTimeout(() => setRecien(false), 1400)
  }

  const boton = comprable ? (
    <button
      type="button"
      onClick={onAgregar}
      className={`flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 font-display text-xs font-semibold uppercase tracking-wide transition-colors duration-200 active:scale-[0.98]
                  ${recien || enCarrito ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-rv-red text-white hover:bg-rv-red-press'}`}
    >
      {recien ? <IconoCheck className="h-4 w-4" /> : <IconoCarrito className="h-4 w-4" />}
      {recien ? 'Agregado' : enCarrito ? 'Sumar otro' : 'Agregar'}
    </button>
  ) : (
    <a
      href={enlaceWhatsapp(mensajeProducto(producto))}
      target="_blank"
      rel="noopener noreferrer"
      className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-black/15 px-3 font-display text-xs font-semibold uppercase tracking-wide text-black hover:border-rv-red hover:text-rv-red dark:border-white/20 dark:text-white"
    >
      <IconoWhatsapp className="h-4 w-4" />
      Consultar ingreso
    </a>
  )

  return (
    <article
      className={`rv-solido rv-solido-hover group relative flex h-full overflow-hidden ${lista ? 'flex-row' : 'flex-col'} ${className}`}
    >
      {producto.marca?.identidad?.color && (
        <span className="absolute inset-x-0 top-0 z-10 h-[3px]" style={{ background: producto.marca.identidad.color }} aria-hidden="true" />
      )}
      <Link
        to={`/producto/${producto.slug}`}
        className={`relative block shrink-0 ${lista ? 'w-32 sm:w-44' : 'w-full'}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <ImagenProducto producto={producto} className={`${lista ? 'h-full min-h-[128px]' : 'aspect-square'} w-full`} />
      </Link>
      {!lista && <BotonFavorito id={producto.id} className="absolute right-2.5 top-2.5" />}

      <div className={`flex min-w-0 flex-1 ${lista ? 'flex-col gap-3 p-4 sm:flex-row sm:items-center' : 'flex-col'}`}>
        <Link to={`/producto/${producto.slug}`} className={`flex min-w-0 flex-1 flex-col gap-1.5 ${lista ? '' : 'px-3.5 pt-3 sm:px-4'}`}>
          <div className="flex h-7 items-center">
            <LogoMarca marca={producto.marca} uniforme />
          </div>
          <h3 className="line-clamp-2 min-h-[2.5em] font-display text-sm font-semibold leading-tight text-black group-hover:text-rv-red dark:text-white">
            {producto.nombre}
          </h3>
          {claves.length > 0 && (
            <ul className="flex flex-wrap gap-1" aria-label="Especificaciones clave">
              {claves.map((c) => (
                <li key={c} className="rv-sutil rounded-md px-1.5 py-0.5 text-[11px] font-medium text-black/75 dark:text-white/75">
                  {c}
                </li>
              ))}
            </ul>
          )}
          <Disponibilidad producto={producto} className="mt-1" />
          {producto.sku && lista && <p className="text-xs text-black/50 dark:text-white/50">Código {producto.sku}</p>}
        </Link>

        <div className={lista ? 'flex shrink-0 flex-col gap-2 sm:w-48 sm:items-end' : 'mt-auto px-3.5 pb-3.5 pt-2 sm:px-4 sm:pb-4'}>
          <div className={lista ? 'sm:text-right' : 'mb-2.5'}>
            <InvitacionStock producto={producto} className="mb-1 sm:ml-auto" />
            <Precio valor={producto.precio} canal={producto.canal} />
            {producto.precio !== null && <p className="text-[11px] text-black/55 dark:text-white/55">IVA incluido</p>}
          </div>
          <div className={lista ? 'flex w-full items-center gap-2' : ''}>
            {boton}
            {lista && <BotonFavorito id={producto.id} className="shrink-0 border border-black/10 dark:border-white/15" />}
          </div>
        </div>
      </div>
    </article>
  )
}

export default memo(ProductoCard)
