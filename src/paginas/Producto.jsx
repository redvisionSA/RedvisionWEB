import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import GlassPanel from '../components/GlassPanel.jsx'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { COMPLEMENTOS, lineaPorId } from '../tienda/lineas.js'
import { BotonFavorito, Disponibilidad, ImagenProducto, Migas, Precio, sePuedeComprar } from '../tienda/piezas.jsx'
import { Cantidad } from '../tienda/LineaCarrito.jsx'
import Riel from '../tienda/Riel.jsx'
import { IconoCamion, IconoCarrito, IconoCheck, IconoEscudo, IconoLocal, IconoTecnico, IconoWhatsapp } from '../tienda/Iconos.jsx'
import { enlaceWhatsapp, mensajeProducto } from '../tienda/whatsapp.js'
import { formatoPrecio } from '../tienda/formato.js'
import Pagina, { usePagina } from './Pagina.jsx'

const RESPALDO = [
  { Icono: IconoEscudo, texto: 'Garantía oficial de fábrica' },
  { Icono: IconoTecnico, texto: 'Asesoramiento técnico sin cargo antes de comprar' },
  { Icono: IconoCamion, texto: 'Envío a todo el país con número de seguimiento' },
  { Icono: IconoLocal, texto: 'Retiro en el local, con disponibilidad confirmada' },
]

const ESQUEMA_DISPONIBILIDAD = {
  disponible: 'https://schema.org/InStock',
  ultimas: 'https://schema.org/LimitedAvailability',
  a_pedido: 'https://schema.org/PreOrder',
  sin_stock: 'https://schema.org/OutOfStock',
}

/* Datos estructurados de producto para buscadores (solo con datos reales del ERP) */
function useEsquemaProducto(producto) {
  useEffect(() => {
    if (!producto) return undefined
    const nodo = document.createElement('script')
    nodo.type = 'application/ld+json'
    nodo.dataset.rv = 'producto'
    nodo.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: producto.nombre,
      sku: producto.sku || undefined,
      description: producto.descripcion || undefined,
      image: producto.imagen || undefined,
      brand: producto.marca ? { '@type': 'Brand', name: producto.marca.nombre } : undefined,
      offers:
        producto.precio !== null
          ? {
              '@type': 'Offer',
              priceCurrency: 'ARS',
              price: producto.precio,
              availability: ESQUEMA_DISPONIBILIDAD[producto.disponibilidad],
              url: window.location.href,
            }
          : undefined,
    })
    document.head.appendChild(nodo)
    return () => nodo.remove()
  }, [producto])
}

export default function Producto() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { catalogo, agregar, registrarVisto, vistos } = useTienda()
  const producto = catalogo.datos.porSlug.get(slug) || null
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)

  usePagina({
    titulo: producto?.nombre || 'Producto',
    descripcion: producto
      ? `${producto.nombre}${producto.marca ? ` de ${producto.marca.nombre}` : ''}. ${producto.precio !== null ? `${formatoPrecio(producto.precio)} con IVA. ` : ''}Envío a todo el país y asesoramiento técnico.`
      : undefined,
  })
  useEsquemaProducto(producto)

  useEffect(() => {
    if (producto) registrarVisto(producto.id)
    setCantidad(1)
    setAgregado(false)
  }, [producto, registrarVisto])

  const complementos = useMemo(() => {
    if (!producto) return []
    const objetivo = COMPLEMENTOS[producto.linea] || []
    return catalogo.datos.productos
      .filter((p) => objetivo.includes(p.linea) && sePuedeComprar(p))
      .slice(0, 10)
  }, [producto, catalogo.datos.productos])

  const misma = useMemo(() => {
    if (!producto) return []
    return catalogo.datos.productos
      .filter((p) => p.linea === producto.linea && p.id !== producto.id && sePuedeComprar(p))
      .slice(0, 10)
  }, [producto, catalogo.datos.productos])

  const recientes = useMemo(
    () => vistos.filter((id) => id !== producto?.id).map((id) => catalogo.datos.porId.get(id)).filter(Boolean),
    [vistos, producto, catalogo.datos.porId]
  )

  if (catalogo.estado === 'cargando') {
    return (
      <Pagina>
        <div className="grid gap-6 lg:grid-cols-2" aria-busy="true">
          <div className="aspect-square animate-pulse rounded-glass" style={{ background: 'var(--glass-bg-thin)' }} />
          <div className="h-80 animate-pulse rounded-glass" style={{ background: 'var(--glass-bg-thin)' }} />
        </div>
      </Pagina>
    )
  }

  if (!producto) {
    return (
      <Pagina>
        <GlassPanel className="mx-auto max-w-xl p-8 text-center">
          <h1 className="text-onglass font-display text-2xl font-bold">Este producto ya no está publicado</h1>
          <p className="rv-muted mt-2 text-sm">Puede que haya cambiado de código o que se haya discontinuado. Lo ayudamos a encontrar un equivalente.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link to="/productos" className="rv-btn-primary">
              Ver productos
            </Link>
            <a href={enlaceWhatsapp('Hola, busco un producto que ya no figura en la tienda.')} target="_blank" rel="noopener noreferrer" className="rv-btn-glass">
              <IconoWhatsapp className="h-4 w-4" />
              Consultar
            </a>
          </div>
        </GlassPanel>
      </Pagina>
    )
  }

  const linea = lineaPorId(producto.linea)
  const comprable = sePuedeComprar(producto)

  function onAgregar() {
    agregar(producto.id, cantidad)
    setAgregado(true)
  }

  function onComprarAhora() {
    agregar(producto.id, cantidad, { abrir: false })
    navigate('/carrito')
  }

  const acciones = comprable ? (
    <>
      <button type="button" onClick={onAgregar} className="rv-btn-primary flex-1">
        {agregado ? <IconoCheck className="h-4 w-4" /> : <IconoCarrito className="h-4 w-4" />}
        {agregado ? 'Agregado al carrito' : 'Agregar al carrito'}
      </button>
      <button type="button" onClick={onComprarAhora} className="rv-btn-glass flex-1">
        Comprar ahora
      </button>
    </>
  ) : (
    <a href={enlaceWhatsapp(mensajeProducto(producto))} target="_blank" rel="noopener noreferrer" className="rv-btn-primary flex-1">
      <IconoWhatsapp className="h-4 w-4" />
      Consultar fecha de ingreso
    </a>
  )

  return (
    <Pagina className="pb-28 lg:pb-10">
      <Migas
        items={[
          { label: 'Inicio', to: '/' },
          { label: 'Productos', to: '/productos' },
          ...(linea ? [{ label: linea.titulo, to: `/productos/${linea.id}` }] : []),
          { label: producto.nombre },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8">
        <div className="lg:sticky lg:top-[150px] lg:self-start">
          <GlassPanel variant="strong" className="group relative overflow-hidden p-0">
            <ImagenProducto producto={producto} tamano="lg" className="aspect-square w-full" />
            <BotonFavorito id={producto.id} className="absolute right-4 top-4" />
          </GlassPanel>
        </div>

        <div className="flex flex-col gap-5">
          <GlassPanel variant="strong" className="p-5 sm:p-7">
            {producto.marca && (
              <p className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-black/60 dark:text-white/65">
                {producto.marca.nombre}
              </p>
            )}
            <h1 className="text-onglass mt-1.5 font-display text-2xl font-bold leading-tight sm:text-3xl">{producto.nombre}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {producto.sku && <span className="rv-muted text-xs">Código {producto.sku}</span>}
              <Disponibilidad valor={producto.disponibilidad} />
            </div>

            <div className="mt-5 border-t rv-hairline pt-5">
              <Precio valor={producto.precio} grande />
              <p className="rv-muted mt-1 text-xs">
                {producto.precio !== null
                  ? 'Precio final con IVA incluido. Envío no incluido: se cotiza al confirmar el pedido.'
                  : 'Precio según cantidad y proyecto. Un asesor lo cotiza en el día.'}
              </p>
              {producto.disponibilidad === 'ultimas' && (
                <p className="mt-3 inline-flex items-center gap-2 rounded-pill bg-rv-red/10 px-3 py-1.5 text-xs font-semibold text-rv-red">
                  Quedan pocas unidades en stock
                </p>
              )}
            </div>

            {comprable && (
              <div className="mt-5 flex items-center gap-3">
                <span className="text-sm font-semibold text-black dark:text-white">Cantidad</span>
                <Cantidad valor={cantidad} onCambiar={(n) => setCantidad(Math.max(1, Math.min(99, Math.floor(Number(n) || 1))))} />
              </div>
            )}

            <div className="mt-5 hidden flex-col gap-3 sm:flex sm:flex-row">{acciones}</div>

            <a
              href={enlaceWhatsapp(mensajeProducto(producto))}
              target="_blank"
              rel="noopener noreferrer"
              className="rv-link mt-4 inline-flex items-center gap-2 text-sm font-semibold"
            >
              <IconoWhatsapp className="h-4 w-4" />
              ¿Dudas? Consulte a un técnico por WhatsApp
            </a>
          </GlassPanel>

          <GlassPanel variant="thin" className="p-5">
            <ul className="grid gap-3 sm:grid-cols-2">
              {RESPALDO.map(({ Icono, texto }) => (
                <li key={texto} className="flex items-center gap-3 text-sm text-black/85 dark:text-white/85">
                  <Icono className="h-5 w-5 shrink-0" />
                  {texto}
                </li>
              ))}
            </ul>
          </GlassPanel>

          {producto.descripcion && (
            <GlassPanel className="p-5 sm:p-7">
              <h2 className="rv-eyebrow mb-3">Descripción</h2>
              <p className="text-onglass whitespace-pre-line text-sm leading-relaxed sm:text-base">{producto.descripcion}</p>
            </GlassPanel>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <Riel eyebrow="Venta técnica" titulo="Complete la instalación" productos={complementos} />
        <Riel eyebrow={linea?.titulo} titulo="Alternativas de la misma línea" productos={misma} verTodo={linea ? `/productos/${linea.id}` : undefined} />
        <Riel eyebrow="Para retomar" titulo="Vistos recientemente" productos={recientes} />
      </div>

      {/* Barra fija de compra en telefono: la accion siempre al alcance del pulgar */}
      <div className="rv-panel-solido pb-safe fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t rv-hairline px-4 pt-3 sm:hidden">
        <div className="min-w-0 shrink-0">
          <Precio valor={producto.precio} className="!text-base" />
        </div>
        <div className="flex flex-1 gap-2">
          {comprable ? (
            <button type="button" onClick={onAgregar} className="rv-btn-primary w-full px-3">
              {agregado ? <IconoCheck className="h-4 w-4" /> : <IconoCarrito className="h-4 w-4" />}
              {agregado ? 'Agregado' : 'Agregar'}
            </button>
          ) : (
            <a href={enlaceWhatsapp(mensajeProducto(producto))} target="_blank" rel="noopener noreferrer" className="rv-btn-primary w-full px-3">
              Consultar
            </a>
          )}
        </div>
      </div>
    </Pagina>
  )
}
