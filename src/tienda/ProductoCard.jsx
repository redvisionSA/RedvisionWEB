import { memo, useState } from 'react'
import { Link } from 'react-router-dom'
import GlassPanel from '../components/GlassPanel.jsx'
import { useTienda } from './TiendaContext.jsx'
import { BotonFavorito, Disponibilidad, ImagenProducto, Precio, sePuedeComprar } from './piezas.jsx'
import { IconoCarrito, IconoCheck, IconoWhatsapp } from './Iconos.jsx'
import { enlaceWhatsapp, mensajeProducto } from './whatsapp.js'

/**
 * Tarjeta de producto.
 *
 * Jerarquia de lectura (escaneo en F): imagen, marca, nombre, disponibilidad,
 * precio y una sola accion. "Agregar" no saca al visitante de la lista: suma
 * al carrito y confirma en el mismo boton; el cajon lateral se abre solo con
 * el primer producto para que se entienda donde quedo.
 */
function ProductoCard({ producto, className = '' }) {
  const { agregar, carrito } = useTienda()
  const [recien, setRecien] = useState(false)
  const comprable = sePuedeComprar(producto)
  const enCarrito = carrito.some((i) => i.id === producto.id)

  function onAgregar(e) {
    e.preventDefault()
    agregar(producto.id, 1, { abrir: carrito.length === 0 })
    setRecien(true)
    window.setTimeout(() => setRecien(false), 1400)
  }

  return (
    <GlassPanel variant="strong" className={`group flex h-full flex-col overflow-hidden p-0 ${className}`} style={{ borderRadius: 24 }}>
      <Link to={`/producto/${producto.slug}`} className="flex flex-1 flex-col focus-visible:outline-none">
        <div className="relative">
          <ImagenProducto producto={producto} className="aspect-square w-full" />
          {producto.disponibilidad === 'ultimas' && (
            <span className="absolute left-3 top-3 rounded-pill bg-rv-red px-2.5 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
              Últimas unidades
            </span>
          )}
          <BotonFavorito id={producto.id} className="absolute right-3 top-3" />
        </div>

        <div className="flex flex-1 flex-col gap-1.5 px-4 pb-2 pt-3.5">
          {producto.marca && (
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-black/55 dark:text-white/60">
              {producto.marca.nombre}
            </p>
          )}
          <h3 className="text-onglass line-clamp-2 min-h-[2.5em] font-display text-sm font-semibold leading-tight group-hover:text-rv-red">
            {producto.nombre}
          </h3>
          <Disponibilidad valor={producto.disponibilidad} />
          <div className="mt-auto pt-2">
            <Precio valor={producto.precio} />
            {producto.precio !== null && <p className="rv-muted text-[11px]">Precio final, IVA incluido</p>}
          </div>
        </div>
      </Link>

      <div className="px-4 pb-4 pt-1">
        {comprable ? (
          <button
            type="button"
            onClick={onAgregar}
            className={`flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-pill font-display text-xs font-semibold uppercase tracking-wide transition-all duration-200 ease-apple active:scale-[0.97]
                        ${recien || enCarrito ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-rv-red text-white hover:bg-rv-red-press'}`}
          >
            {recien ? <IconoCheck className="h-4 w-4" /> : <IconoCarrito className="h-4 w-4" />}
            {recien ? 'Agregado' : enCarrito ? 'Sumar otro' : 'Agregar al carrito'}
          </button>
        ) : (
          <a
            href={enlaceWhatsapp(mensajeProducto(producto))}
            target="_blank"
            rel="noopener noreferrer"
            className="rv-btn-glass w-full px-3 text-xs"
          >
            <IconoWhatsapp className="h-4 w-4" />
            Consultar ingreso
          </a>
        )}
      </div>
    </GlassPanel>
  )
}

export default memo(ProductoCard)
