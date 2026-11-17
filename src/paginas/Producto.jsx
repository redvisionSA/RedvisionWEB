import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { COMPLEMENTOS } from '../tienda/lineas.js'
import { cadenaDeCategoria, enlaceCategoria } from '../tienda/categorias.js'
import { Aviso, BotonFavorito, Disponibilidad, ImagenProducto, InvitacionStock, LogoMarca, Migas, Precio, sePuedeComprar } from '../tienda/piezas.jsx'
import { Cantidad } from '../tienda/LineaCarrito.jsx'
import Riel from '../tienda/Riel.jsx'
import { alternativasConStock, compatibles, similares } from '../tienda/similares.js'
import { IconoCamion, IconoCarrito, IconoCheck, IconoEscudo, IconoLocal, IconoTecnico, IconoWhatsapp } from '../tienda/Iconos.jsx'
import { enlaceWhatsapp, mensajeProducto } from '../tienda/whatsapp.js'
import { formatoPrecio } from '../tienda/formato.js'
import { PreHeader } from '../components/Navbar.jsx'
import { etiquetaMp } from '../tienda/specs.js'
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
      /* El precio de la lista de un cliente con sesion no se publica como oferta */
      offers:
        producto.precio !== null && !producto.canal
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

/* Ficha tecnica: solo lo que el ERP o el texto del producto dicen */
function TablaSpecs({ specs }) {
  if (!specs) return null
  const fmt = (n) => String(n).replace('.', ',')
  const filas = [
    ['Tipo de equipo', specs.forma],
    ['Resolución', specs.mp && etiquetaMp(specs.mp)],
    ['Tecnologías', specs.tecnologias?.length ? specs.tecnologias.join(' · ') : null],
    ['Lente', specs.varifocal ? 'Varifocal / motorizada' : specs.lente && `${fmt(specs.lente)} mm`],
    ['Alcance de visión nocturna', specs.ir && `${specs.ir} m`],
    ['Canales', specs.canales],
    ['Capacidad', specs.tb && `${fmt(specs.tb)} TB`],
    ['Puertos', specs.puertos],
    ['Alimentación PoE', specs.poe ? 'Sí' : null],
    ['Instalación', specs.uso],
  ].filter(([, v]) => v)
  if (!filas.length) return null
  return (
    <div className="rv-solido p-5 sm:p-7">
      <h2 className="rv-eyebrow mb-3">Especificaciones</h2>
      <dl className="divide-y divide-black/[0.07] text-sm dark:divide-white/10">
        {filas.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3 py-2.5">
            <dt className="text-black/60 dark:text-white/60">{k}</dt>
            <dd className="font-semibold text-black dark:text-white">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* Combo traido de MercadoLibre (17/11): cada producto con su cantidad y su ficha. */
function ComponentesCombo({ combo, porId }) {
  return (
    <div className="rv-solido p-5 sm:p-7">
      <h2 className="rv-eyebrow mb-1">Qué incluye este combo</h2>
      <p className="mb-3 text-xs text-black/60 dark:text-white/60">El precio corresponde a todos estos productos juntos, con IVA. Cada uno tiene su ficha.</p>
      <ul className="divide-y divide-black/[0.07] text-sm dark:divide-white/10">
        {combo.componentes.map((c) => {
          const producto = porId.get(c.id)
          return (
            <li key={c.id} className="flex items-center gap-3 py-2.5">
              <span className="font-display w-10 shrink-0 text-right font-bold text-black dark:text-white">{c.cantidad} ×</span>
              <span className="min-w-0 flex-1">
                {producto ? (
                  <Link to={`/producto/${producto.slug}`} className="rv-link font-semibold">
                    {c.nombre}
                  </Link>
                ) : (
                  <span className="font-semibold text-black dark:text-white">{c.nombre}</span>
                )}
                {c.sku && <span className="block text-xs text-black/50 dark:text-white/50">Código {c.sku}</span>}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
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
      ? `${producto.nombre}${producto.marca ? ` de ${producto.marca.nombre}` : ''}. ${producto.precio !== null && !producto.canal ? `${formatoPrecio(producto.precio)} con IVA. ` : ''}Envío a todo el país y asesoramiento técnico.`
      : undefined,
  })
  useEsquemaProducto(producto)

  useEffect(() => {
    if (producto) registrarVisto(producto.id)
    setCantidad(1)
    setAgregado(false)
  }, [producto, registrarVisto])

  const complementos = useMemo(
    () => compatibles(producto, catalogo.datos.productos, COMPLEMENTOS[producto?.linea] || []),
    [producto, catalogo.datos.productos]
  )
  const misma = useMemo(() => similares(producto, catalogo.datos.productos), [producto, catalogo.datos.productos])
  const conStock = useMemo(() => alternativasConStock(producto, catalogo.datos.productos), [producto, catalogo.datos.productos])

  const recientes = useMemo(
    () => vistos.filter((id) => id !== producto?.id).map((id) => catalogo.datos.porId.get(id)).filter(Boolean),
    [vistos, producto, catalogo.datos.porId]
  )

  if (catalogo.estado === 'cargando') {
    return (
      <Pagina>
        <div className="grid gap-6 lg:grid-cols-2" aria-busy="true">
          <div className="rv-solido aspect-square animate-pulse" />
          <div className="rv-solido h-80 animate-pulse" />
        </div>
      </Pagina>
    )
  }

  if (!producto) {
    return (
      <Pagina>
        <div className="rv-solido mx-auto max-w-xl p-8 text-center">
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
        </div>
      </Pagina>
    )
  }

  /* Migas y «Ver todo» por la categoria del ERP (de la raiz a la hoja) */
  const cadena = cadenaDeCategoria(catalogo.datos.categorias, producto.categoria?.slug)
  const hoja = cadena[cadena.length - 1] || null
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
          ...cadena.map((c) => ({ label: c.nombre, to: enlaceCategoria(c.slug) })),
          { label: producto.nombre },
        ]}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-8">
        <div className="lg:sticky lg:top-[110px] lg:self-start">
          <div className="rv-solido group relative overflow-hidden">
            <ImagenProducto producto={producto} tamano="lg" className="aspect-square w-full" />
            <BotonFavorito id={producto.id} className="absolute right-4 top-4" />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="rv-solido relative overflow-hidden p-5 sm:p-7">
            {producto.marca?.identidad?.color && (
              <span className="absolute inset-x-0 top-0 h-1" style={{ background: producto.marca.identidad.color }} aria-hidden="true" />
            )}
            {producto.marca && (
              <Link to={`/productos?marca=${encodeURIComponent(producto.marca.slug)}`} className="inline-flex items-center gap-2" title={`Ver todo ${producto.marca.nombre}`}>
                <LogoMarca marca={producto.marca} alto={22} conChip={Boolean(producto.marca.identidad?.logo)} />
              </Link>
            )}
            <h1 className="text-onglass mt-1.5 font-display text-2xl font-bold leading-tight sm:text-3xl">{producto.nombre}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {producto.sku && <span className="rv-muted text-xs">Código {producto.sku}</span>}
              <Disponibilidad producto={producto} grande />
              <InvitacionStock producto={producto} />
            </div>
            {producto.marca?.identidad?.oficial && <PreHeader variante="solido" compacto className="mt-4 w-max" />}

            <div className="mt-5 border-t rv-hairline pt-5">
              <Precio valor={producto.precio} canal={producto.canal} grande />
              <p className="rv-muted mt-1 text-xs">
                {producto.precio !== null
                  ? 'Precio final con IVA incluido. Envío no incluido: se cotiza al confirmar el pedido.'
                  : 'Precio según cantidad y proyecto. Un asesor lo cotiza en el día.'}
              </p>
              {/* Con sesion la cantidad ya esta a la vista: «Última en stock», «2 en stock» */}
              {producto.disponibilidad === 'ultimas' && !producto.stock && (
                <Aviso tono="atencion" lectura="Stock · últimas unidades" className="mt-3" titulo="Quedan pocas unidades">
                  <p>Si lo necesita, envíe el pedido hoy: el stock se aparta cuando el asesor lo confirma.</p>
                </Aviso>
              )}
              {producto.disponibilidad === 'a_pedido' && (
                <p className="mt-3 text-sm text-black/80 dark:text-white/85">
                  Sin unidades para entrega inmediata: se encarga al proveedor y un asesor le confirma el plazo antes de cerrar el pedido.
                </p>
              )}
              {producto.disponibilidad === 'sin_stock' && (
                <p className="mt-3 text-sm font-semibold text-rv-red dark:text-rv-red-glow">
                  Sin stock por el momento. Consulte la fecha de ingreso por WhatsApp.
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
          </div>

          <div className="rv-solido p-5">
            <ul className="grid gap-3 sm:grid-cols-2">
              {RESPALDO.map(({ Icono, texto }) => (
                <li key={texto} className="flex items-center gap-3 text-sm text-black/85 dark:text-white/85">
                  <Icono className="h-5 w-5 shrink-0" />
                  {texto}
                </li>
              ))}
            </ul>
          </div>

          {producto.combo ? <ComponentesCombo combo={producto.combo} porId={catalogo.datos.porId} /> : <TablaSpecs specs={producto.specs} />}

          {producto.descripcion && (
            <div className="rv-solido p-5 sm:p-7">
              <h2 className="rv-eyebrow mb-3">Descripción</h2>
              <p className="text-onglass whitespace-pre-line text-sm leading-relaxed sm:text-base">{producto.descripcion}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-10">
        <Riel eyebrow="Entrega inmediata" titulo="Alternativas con stock para llevar hoy" productos={conStock} />
        <Riel eyebrow="Compatibles" titulo="Complete la instalación" productos={complementos} />
        <Riel eyebrow={hoja?.nombre} titulo="Productos similares" productos={misma} verTodo={hoja ? enlaceCategoria(hoja.slug) : undefined} />
        <Riel eyebrow="Para retomar" titulo="Vistos recientemente" productos={recientes} />
      </div>

      {/* Barra fija de compra en telefono: la accion siempre al alcance del pulgar */}
      <div className="rv-panel-solido pb-safe fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t rv-hairline px-4 pt-3 sm:hidden">
        <div className="min-w-0 shrink-0">
          <Precio valor={producto.precio} canal={producto.canal} className="!text-base" />
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
