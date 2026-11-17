import { Link } from 'react-router-dom'
import { DISPONIBILIDAD } from './catalogo.js'
import { medidaLogo } from './marcas.js'
import { formatoPrecio } from './formato.js'
import { lineaPorId } from './lineas.js'
import { useTienda } from './TiendaContext.jsx'
import { IconoCorazon } from './Iconos.jsx'
import { useCuenta } from '../cuenta/CuentaContext.jsx'

/* ------------------------------------------------------------- Precio */
/* `canal`: lista del cliente con sesion («Mayorista», «Distribuidor»); se
   indica junto al precio para que nunca se confunda con el publico. */
export function Precio({ valor, canal = null, className = '', grande = false }) {
  const texto = formatoPrecio(valor)
  const lista = canal ? (
    <span className={`block font-display font-semibold uppercase tracking-wide text-black/60 dark:text-white/65 ${grande ? 'mt-1 text-xs' : 'text-[10px]'}`}>Precio {canal}</span>
  ) : null
  if (!texto) {
    return (
      <span className={`inline-block font-display font-semibold text-black/80 dark:text-white/85 ${grande ? 'text-xl' : 'text-sm'} ${className}`}>
        Consultar precio
        {lista}
      </span>
    )
  }
  return (
    <span className={`inline-block ${className}`}>
      <span className={`num font-display font-bold tracking-tight text-black dark:text-white ${grande ? 'text-3xl sm:text-4xl' : 'text-lg'}`}>{texto}</span>
      {lista}
    </span>
  )
}

/* ----------------------------------------------------- Disponibilidad */
/* Lectura OSD (Aspecto 6, «OSD / visor»): la disponibilidad se lee como el
   texto que la cámara sobreimprime en la imagen. Rectángulo de 2 px sin
   relleno, mono en mayúsculas y un glifo cuya FORMA dice el estado:
   ■ disponible · ● REC últimas unidades (parpadea tres veces y queda fijo) ·
   □ a pedido · ✕ sin stock (rojo lleno). El estado nunca depende solo del
   color. Piezas propias de REDVISION: la tienda de Control Red habla otro
   idioma («tablero de instalador»); al portar código, traducir la pieza. */
export function GlifoOsd({ forma, className = 'h-2.5 w-2.5' }) {
  if (forma === 'rec') return <span className="rv-rec" aria-hidden="true" />
  return (
    <svg viewBox="0 0 10 10" className={`shrink-0 ${className}`} aria-hidden="true">
      {forma === 'lleno' && <rect width="10" height="10" fill="currentColor" />}
      {forma === 'hueco' && <rect x="1" y="1" width="8" height="8" fill="none" stroke="currentColor" strokeWidth="2" />}
      {forma === 'cruz' && <path d="M1 1l8 8M9 1L1 9" stroke="currentColor" strokeWidth="2" />}
      {forma === 'triangulo' && (
        <>
          <path d="M5 .8 9.6 9H.4z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M5 4v2.2" stroke="currentColor" strokeWidth="1.3" />
        </>
      )}
    </svg>
  )
}

const GLIFO_DISPONIBILIDAD = { ok: 'lleno', alerta: 'rec', neutro: 'hueco', apagado: 'cruz' }

/**
 * Texto de la cantidad que el ERP da a un cliente con sesion
 * (`{ unidades, mas }`, topeada en 10): «3 en stock», «Última en stock»,
 * «+10 en stock». Sin sesion no hay cantidad: null.
 */
export function textoStock(stock) {
  if (!stock || !(stock.unidades > 0)) return null
  if (stock.mas) return `+${stock.unidades} en stock`
  if (stock.unidades === 1) return 'Última en stock'
  return `${stock.unidades} en stock`
}

/**
 * Disponibilidad de un producto. `producto.stock` (solo con sesion) cambia el
 * tramo por la cantidad; sin el, el tramo publico. `grande` para la ficha.
 */
export function Disponibilidad({ producto, className = '', grande = false }) {
  const valor = producto?.disponibilidad
  const info = DISPONIBILIDAD[valor] || DISPONIBILIDAD.a_pedido
  const texto = textoStock(producto?.stock) || info.etiqueta
  return (
    <span className={`rv-lectura rv-lectura--${info.tono} ${grande ? 'rv-lectura--grande' : ''} ${className}`}>
      <GlifoOsd forma={GLIFO_DISPONIBILIDAD[info.tono]} className={grande ? 'h-3 w-3' : 'h-2.5 w-2.5'} />
      {/* En tarjetas angostas (320 px, dos columnas) el texto pasa a dos lineas: cortarlo escondia el estado */}
      <span>{texto}</span>
    </span>
  )
}

/**
 * Sin sesion la tienda da tramos; la cantidad, solo a clientes que ingresaron.
 * Lo que esta sin stock no tiene cantidad que mostrar: no se invita.
 */
export function InvitacionStock({ producto, className = '' }) {
  const { cuenta } = useCuenta()
  if (cuenta || producto?.disponibilidad === 'sin_stock') return null
  return (
    <Link
      to="/cuenta"
      className={`flex min-h-[24px] w-max max-w-full items-center gap-1 text-[11px] font-semibold text-black/70 underline decoration-black/25 underline-offset-2
                  hover:text-rv-red hover:decoration-rv-red dark:text-white/75 dark:decoration-white/30 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-3 w-3 shrink-0">
        <rect x="5" y="11" width="14" height="9" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
      Ingrese para ver el stock
    </Link>
  )
}

export function sePuedeComprar(producto) {
  return Boolean(producto) && producto.disponibilidad !== 'sin_stock'
}

/* ------------------------------------------------------ Imagen o icono */
/* Sin stock: la foto queda desenfocada y atenuada detras de una etiqueta roja,
   para que el estado mande en la jerarquia antes que el producto. En las
   miniaturas de 48 px (`tamano="xs"`: buscador, carrito) no entra el texto:
   queda solo la foto atenuada. */
/* Sin stock: banda roja de lado a lado sobre la foto, en mono como el «sin
   señal» de un monitor (antes, píldora con resplandor rojo). */
const ETIQUETA_SIN_STOCK = {
  lg: 'py-3 text-base tracking-[0.16em]',
  md: 'py-2 text-xs tracking-[0.14em] sm:text-sm',
  sm: 'py-0.5 text-[10px] leading-tight tracking-[0.06em]',
}

function CapaSinStock({ tamano }) {
  if (!ETIQUETA_SIN_STOCK[tamano]) return null
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center bg-white/35 dark:bg-black/30">
      <span className={`w-full bg-rv-red text-center font-osd font-medium uppercase text-white ${ETIQUETA_SIN_STOCK[tamano]}`}>Sin stock</span>
    </div>
  )
}

export function ImagenProducto({ producto, className = '', tamano = 'md' }) {
  const linea = lineaPorId(producto?.linea)
  const Icono = linea?.Icono
  const sinStock = producto?.disponibilidad === 'sin_stock'
  const atenuar = sinStock ? 'scale-105 blur-[3px] opacity-60 grayscale' : ''
  if (producto?.imagen) {
    return (
      <div className={`relative overflow-hidden bg-white ${className}`}>
        <img
          src={producto.imagen}
          alt={sinStock ? `${producto.nombre} (sin stock)` : producto.nombre}
          loading="lazy"
          decoding="async"
          className={`h-full w-full object-contain p-[8%] transition-transform duration-500 ease-apple ${sinStock ? atenuar : 'group-hover:scale-105'}`}
        />
        {sinStock && <CapaSinStock tamano={tamano} />}
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
      aria-label={`${producto?.nombre || 'Producto'} (imagen no disponible${sinStock ? ', sin stock' : ''})`}
    >
      {Icono && (
        <Icono
          className={`text-black/25 transition-transform duration-500 ease-apple ${sinStock ? atenuar : 'group-hover:scale-110'} ${
            tamano === 'lg' ? 'h-28 w-28' : 'h-14 w-14'
          }`}
        />
      )}
      {sinStock && <CapaSinStock tamano={tamano} />}
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

/* ---------------------------------------------------------- Formularios */
export function Campo({ id, label, error, ayuda, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-black/80 dark:text-white/85">
        {label}
      </label>
      {children}
      {ayuda && !error && <p className="rv-muted mt-1 text-xs">{ayuda}</p>}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-rv-red">
          {error}
        </p>
      )}
    </div>
  )
}

/** Error de un envio: borde rojo y role=alert para lectores de pantalla. */
export function AvisoError({ children, className = '' }) {
  if (!children) return null
  return (
    <Aviso tono="error" lectura="No se pudo" className={className}>
      <p className="font-semibold">{children}</p>
    </Aviso>
  )
}

/* ------------------------------------------------------------ Aviso */
/* Cuadro de visor (Aspecto 6, «OSD / visor»): placa gris sin borde; la caja
   la insinúan cuatro esquinas de visor. Arriba una lectura en mono
   («PEDIDO · NO ENVIADO»), después el título y el texto; error = esquinas y
   punto REC en rojo y role="alert". */
const GLIFO_AVISO = { dato: 'hueco', ok: 'lleno', atencion: 'triangulo' }

export function Aviso({ tono = 'dato', lectura, titulo, children, acciones, className = '', role }) {
  return (
    <div className={`rv-aviso rv-visor ${tono === 'error' ? 'rv-aviso--error' : ''} ${className}`} role={role || (tono === 'error' ? 'alert' : 'status')}>
      {lectura && (
        <p className="rv-aviso__lectura">
          {tono === 'error' ? <span className="rv-rec" aria-hidden="true" /> : <GlifoOsd forma={GLIFO_AVISO[tono]} />}
          {lectura}
        </p>
      )}
      {titulo && <p className="rv-aviso__titulo">{titulo}</p>}
      {children && <div className="text-sm">{children}</div>}
      {acciones && <div className="mt-3 flex flex-wrap items-center gap-4">{acciones}</div>}
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

/* ------------------------------------------------------- Logo de marca
   Logo oficial si esta cargado en public/marcas/; si no, el nombre en texto
   neutro (nunca un dibujo propio ni un logo viejo de la marca).
   Medida optica (`medidaLogo`): todas las marcas pesan lo mismo a la vista,
   sea cual sea la proporcion de su archivo. El alt es siempre el nombre
   oficial de la marca (no la grafia que traiga el ERP). Sin pastilla, en el
   tema oscuro el logo va sobre una placa blanca (`.rv-logo-marca`): los
   logotipos negros o grises no se leerian sobre el fondo oscuro. */
function ImagenLogo({ id, alto, anchoMax }) {
  const m = medidaLogo(id, alto, anchoMax)
  return (
    <img
      src={id.logo}
      alt={id.nombre}
      width={m.ancho}
      height={m.alto}
      loading="lazy"
      decoding="async"
      className="block max-w-full object-contain"
      style={{ width: m.ancho, height: m.alto }}
    />
  )
}

function NombreMarca({ nombre, alto, className = '' }) {
  return (
    <span
      className={`truncate font-display font-bold uppercase tracking-[0.08em] ${className}`}
      style={{ fontSize: Math.max(10, Math.round(alto * 0.72)), lineHeight: 1 }}
    >
      {nombre}
    </span>
  )
}

export function LogoMarca({ marca, alto = 16, className = '', conChip = false, uniforme = false, anchoMax, caja = '' }) {
  if (!marca) return null
  const id = marca.identidad
  const nombre = id?.nombre || marca.nombre
  /* Pastilla de tamaño fijo (tarjetas de producto): todas las marcas ocupan lo
     mismo, sea cual sea la proporcion de su logo. */
  if (uniforme) {
    return (
      <span className={`rv-chip-marca inline-flex h-7 w-[96px] items-center justify-center overflow-hidden px-2 ${className}`}>
        {id?.logo ? <ImagenLogo id={id} alto={15} anchoMax={80} /> : <NombreMarca nombre={nombre} alto={14} className="text-black/75" />}
      </span>
    )
  }
  if (conChip) {
    return (
      <span className={`rv-chip-marca px-2.5 py-1.5 ${caja} ${className}`}>
        {id?.logo ? <ImagenLogo id={id} alto={alto} anchoMax={anchoMax} /> : <NombreMarca nombre={nombre} alto={alto} className="text-black/75" />}
      </span>
    )
  }
  if (id?.logo) {
    return (
      <span className={`rv-logo-marca inline-flex items-center ${className}`} style={{ '--logo-aire': `${Math.max(3, Math.round(alto * 0.22))}px` }}>
        <ImagenLogo id={id} alto={alto} anchoMax={anchoMax} />
      </span>
    )
  }
  return <NombreMarca nombre={nombre} alto={alto} className={`text-black/75 dark:text-white/80 ${className}`} />
}
