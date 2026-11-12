import { Link } from 'react-router-dom'
import { DISPONIBILIDAD } from './catalogo.js'
import { formatoPrecio } from './formato.js'
import { lineaPorId } from './lineas.js'
import { useTienda } from './TiendaContext.jsx'
import { IconoCorazon } from './Iconos.jsx'

/* ------------------------------------------------------------- Precio */
export function Precio({ valor, className = '', grande = false }) {
  const texto = formatoPrecio(valor)
  if (!texto) {
    return (
      <span className={`font-display font-semibold text-black/80 dark:text-white/85 ${grande ? 'text-xl' : 'text-sm'} ${className}`}>
        Consultar precio
      </span>
    )
  }
  return (
    <span
      className={`num font-display font-bold tracking-tight text-black dark:text-white ${grande ? 'text-3xl sm:text-4xl' : 'text-lg'} ${className}`}
    >
      {texto}
    </span>
  )
}

/* ----------------------------------------------------- Disponibilidad */
const TONOS = {
  ok: 'text-black/80 dark:text-white/85',
  alerta: 'text-rv-red',
  neutro: 'text-black/65 dark:text-white/70',
  apagado: 'text-black/45 dark:text-white/45',
}

export function Disponibilidad({ valor, className = '' }) {
  const info = DISPONIBILIDAD[valor] || DISPONIBILIDAD.a_pedido
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${TONOS[info.tono]} ${className}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${info.tono === 'alerta' ? 'animate-rv-breathe bg-rv-red' : 'bg-current'}`}
        aria-hidden="true"
      />
      {info.etiqueta}
    </span>
  )
}

export function sePuedeComprar(producto) {
  return Boolean(producto) && producto.disponibilidad !== 'sin_stock'
}

/* ------------------------------------------------------ Imagen o icono */
export function ImagenProducto({ producto, className = '', tamano = 'md' }) {
  const linea = lineaPorId(producto?.linea)
  const Icono = linea?.Icono
  if (producto?.imagen) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <img
          src={producto.imagen}
          alt={producto.nombre}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain p-[8%] transition-transform duration-500 ease-apple group-hover:scale-105"
        />
      </div>
    )
  }
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(120% 90% at 30% 10%, rgba(255,255,255,0.9), rgba(255,255,255,0.55) 55%, rgba(0,0,0,0.04))',
      }}
      role="img"
      aria-label={`${producto?.nombre || 'Producto'} (imagen no disponible)`}
    >
      {Icono && (
        <Icono
          className={`text-black/25 transition-transform duration-500 ease-apple group-hover:scale-110 ${
            tamano === 'lg' ? 'h-28 w-28' : 'h-14 w-14'
          }`}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------ Favorito */
export function BotonFavorito({ id, className = '' }) {
  const { favoritos, alternarFavorito } = useTienda()
  const activo = favoritos.includes(id)
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        alternarFavorito(id)
      }}
      aria-pressed={activo}
      aria-label={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      title={activo ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      className={`inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-pill bg-white/85 shadow-sm
                  transition-all duration-200 ease-apple active:scale-90
                  ${activo ? 'text-rv-red' : 'text-black/60 hover:text-rv-red'} ${className}`}
    >
      <IconoCorazon lleno={activo} className="h-[18px] w-[18px]" />
    </button>
  )
}

/* ------------------------------------------------- Franja de demostracion */
export function AvisoDemo() {
  const { catalogo } = useTienda()
  if (!catalogo.datos.demo) return null
  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-[60] rounded-pill bg-black px-3.5 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
      Datos de demostración · sin conexión al ERP
    </div>
  )
}

/* ---------------------------------------------------------- Migas */
export function Migas({ items }) {
  return (
    <nav aria-label="Ruta de navegación" className="mb-4">
      <ol className="rv-muted flex flex-wrap items-center gap-1.5 text-xs">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true">/</span>}
            {item.to ? (
              <Link to={item.to} className="rv-link">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-black/80 dark:text-white/85">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
