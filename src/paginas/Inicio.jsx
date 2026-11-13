import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Hero3D from '../components/Hero3D.jsx'
import GlassPanel from '../components/GlassPanel.jsx'
import { TileFullColor } from '../components/Tecnologia.jsx'
import { TileResenas } from '../components/Ubicacion.jsx'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { sePuedeComprar } from '../tienda/piezas.jsx'
import CarruselProductos from '../tienda/CarruselProductos.jsx'
import CarruselMarcas from '../tienda/CarruselMarcas.jsx'
import { usePopulares } from '../tienda/popularidad.js'
import { IconoCamion, IconoEscudo, IconoFlecha, IconoLocal, IconoTecnico, IconoWhatsapp } from '../tienda/Iconos.jsx'
import EMPRESA from '../datos/empresa.js'
import { enlaceConsulta } from '../tienda/whatsapp.js'
import { usePagina } from './Pagina.jsx'

/**
 * Inicio = tienda.
 *
 * Orden pensado para la decision de compra:
 *   1. Hero: busqueda y "Ver todos los productos" (intencion), robot (marca).
 *   2. Un solo carrusel automatico de productos: lo mas buscado y cotizado
 *      de la semana. Pocas opciones ayudan a decidir; el resto, en la tienda.
 *   3. Marcas en cinta automatica.
 *   4. Respaldo: garantia, asesoramiento, envio, retiro (reduce el riesgo percibido).
 *   5. Canal mayorista (el cliente que mas factura).
 *   6. Lo institucional, resumido y enlazado a su pestaña.
 */

const BENEFICIOS = [
  { Icono: IconoEscudo, titulo: 'Garantía oficial de fábrica', texto: 'Producto ingresado por canal oficial, con trazabilidad de número de serie.' },
  { Icono: IconoTecnico, titulo: 'Asesoramiento sin cargo', texto: 'Un técnico revisa su pedido y dimensiona red, energía y almacenamiento.' },
  { Icono: IconoCamion, titulo: 'Envíos a todo el país', texto: 'Por transporte o correo, con número de seguimiento el día del despacho.' },
  { Icono: IconoLocal, titulo: 'Retiro en el local', texto: `${EMPRESA.direccion.calle}, CABA. Disponibilidad confirmada antes de viajar.` },
]

const INSTITUCIONAL = [
  {
    to: '/proyectos',
    eyebrow: 'Departamento de proyectos',
    titulo: 'Llave en mano, del relevamiento al posventa',
    texto: 'Escuchamos, planificamos, cotizamos, instalamos, capacitamos y acompañamos. Consorcios, industria, countries y operaciones multisitio.',
    cta: 'Conocer el departamento',
  },
  {
    to: '/capacitaciones',
    eyebrow: 'Formación técnica',
    titulo: 'Capacitación para instaladores',
    texto: 'Talleres prácticos sobre plataformas Dahua, redes para video y puesta en marcha de sistemas.',
    cta: 'Ver capacitaciones',
  },
  {
    to: '/empresa',
    eyebrow: 'La empresa',
    titulo: 'Tecnología sin límites',
    texto: 'Comercialización mayorista y minorista, catálogo multimarca y un equipo técnico que responde antes y después de la venta.',
    cta: 'Conocer REDVISION',
  },
]

/* Puerta a la tienda completa: la accion principal del inicio, imposible de
   pasar por alto. Aparece apenas termina el hero y otra vez al final. */
function BandaTienda({ compacta = false }) {
  const { catalogo } = useTienda()
  const total = catalogo.datos.productos.length
  return (
    <Link
      to="/productos"
      className={`group relative flex flex-col items-start justify-between gap-5 overflow-hidden rounded-[24px] bg-rv-red text-white shadow-[0_24px_60px_-28px_rgba(214,25,34,0.9)] transition-transform duration-300 ease-apple hover:-translate-y-0.5 sm:flex-row sm:items-center
                  ${compacta ? 'px-6 py-6 sm:px-8' : 'px-6 py-7 sm:px-10 sm:py-9'}`}
    >
      <span className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-white/10" aria-hidden="true" />
      <span className="relative">
        <span className="block font-display text-[11px] font-semibold uppercase tracking-[0.24em] text-white/80">Tienda en línea</span>
        <span className={`mt-1.5 block font-display font-bold leading-tight ${compacta ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl lg:text-4xl'}`}>
          {compacta ? '¿Listo para comprar?' : 'Todos los productos, con precio y disponibilidad'}
        </span>
        <span className="mt-1.5 block text-sm text-white/85">
          {total > 0 ? `${total} productos · ` : ''}Dahua, Hikvision, Imou y accesorios de las principales marcas
        </span>
      </span>
      <span className="relative inline-flex min-h-[52px] w-full shrink-0 items-center justify-center gap-3 rounded-full bg-white px-7 font-display text-sm font-bold uppercase tracking-wide text-rv-red transition-colors group-hover:bg-black group-hover:text-white sm:w-auto">
        Ver todos los productos
        <IconoFlecha className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  )
}

function Beneficios() {
  return (
    <div className="rv-solido p-4 sm:p-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFICIOS.map(({ Icono, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3">
            <span className="rv-sutil inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-black dark:text-white">
              <Icono className="h-5 w-5" />
            </span>
            <span>
              <span className="text-onglass block font-display text-sm font-semibold">{titulo}</span>
              <span className="rv-muted mt-0.5 block text-xs leading-relaxed">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function BandaMayorista() {
  return (
    <GlassPanel tilt={1.5} className="overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="rv-eyebrow mb-2">Canal mayorista</p>
          <h2 className="text-onglass font-display text-2xl font-bold leading-tight sm:text-3xl">
            ¿Instalador, integrador o empresa? <span className="text-rv-red">Acceda a precios mayoristas.</span>
          </h2>
          <p className="rv-muted mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            Lista de precios diferencial, condiciones por volumen y cuenta corriente para instaladores y
            empresas del rubro. Un asesor da de alta su cuenta y le envía la lista vigente.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
          <a href={enlaceConsulta('mayorista')} target="_blank" rel="noopener noreferrer" className="rv-btn-primary w-full sm:w-auto lg:min-w-[260px]">
            Solicitar cuenta mayorista
          </a>
          <a
            href={EMPRESA.telefono.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rv-btn-glass w-full sm:w-auto lg:min-w-[260px]"
          >
            <IconoWhatsapp className="h-4 w-4" />
            Hablar con ventas
          </a>
        </div>
      </div>
    </GlassPanel>
  )
}

function Institucional() {
  return (
    <section aria-labelledby="titulo-institucional">
      <div className="mb-4 px-1">
        <p className="rv-eyebrow mb-1.5">Más que una tienda</p>
        <h2 id="titulo-institucional" className="text-onglass font-display text-xl font-bold sm:text-2xl">
          Un equipo técnico detrás de cada compra
        </h2>
      </div>
      <ul className="grid gap-4 md:grid-cols-3">
        {INSTITUCIONAL.map((b) => (
          <li key={b.to}>
            <GlassPanel tilt={2} className="group h-full p-0">
              <Link to={b.to} className="flex h-full flex-col p-6 sm:p-7">
                <p className="rv-eyebrow mb-2">{b.eyebrow}</p>
                <h3 className="text-onglass font-display text-lg font-bold leading-tight group-hover:text-rv-red sm:text-xl">{b.titulo}</h3>
                <p className="rv-muted mt-2 text-sm leading-relaxed">{b.texto}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-5 font-display text-xs font-semibold uppercase tracking-wide text-black dark:text-white">
                  {b.cta}
                  <IconoFlecha className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-rv-red" />
                </span>
              </Link>
            </GlassPanel>
          </li>
        ))}
      </ul>
    </section>
  )
}

function SinCatalogo() {
  const { catalogo, reintentar } = useTienda()
  if (catalogo.estado !== 'error' && catalogo.estado !== 'sin-fuente') return null
  return (
    <GlassPanel className="p-6 text-center sm:p-8">
      <p className="text-onglass font-display text-lg font-semibold">
        {catalogo.estado === 'error' ? 'No pudimos cargar el catálogo en este momento.' : 'Estamos actualizando el catálogo en línea.'}
      </p>
      <p className="rv-muted mx-auto mt-2 max-w-xl text-sm">
        Mientras tanto, un asesor le confirma precio y disponibilidad por WhatsApp en minutos.
      </p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a href={EMPRESA.telefono.whatsapp} target="_blank" rel="noopener noreferrer" className="rv-btn-primary">
          <IconoWhatsapp className="h-4 w-4" />
          Consultar por WhatsApp
        </a>
        {catalogo.estado === 'error' && (
          <button type="button" onClick={reintentar} className="rv-btn-glass">
            Reintentar
          </button>
        )}
      </div>
    </GlassPanel>
  )
}

export default function Inicio({ onRobotListo }) {
  usePagina({})
  const { catalogo } = useTienda()
  const { productos, porId } = catalogo.datos
  const populares = usePopulares()

  /* Un solo carrusel: lo mas buscado y cotizado de la semana. Mientras no haya
     ranking (base sin datos o sin configurar), los destacados con precio. El
     titulo dice la verdad sobre que se esta mostrando. */
  const ranking = useMemo(
    () => (populares || []).map((id) => porId.get(id)).filter((p) => p && sePuedeComprar(p)),
    [populares, porId]
  )
  const hayRanking = ranking.length >= 4
  const carrusel = useMemo(() => {
    if (hayRanking) return ranking.slice(0, 12)
    const marcados = productos.filter((p) => p.destacado && sePuedeComprar(p))
    const base = marcados.length >= 4 ? marcados : productos.filter((p) => sePuedeComprar(p) && p.precio !== null && p.imagen)
    return base.slice(0, 12)
  }, [hayRanking, ranking, productos])

  return (
    <>
      <Hero3D onRobotListo={onRobotListo} />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 pb-10 sm:gap-12 sm:px-5">
        <BandaTienda />
        <SinCatalogo />
        <CarruselProductos
          eyebrow={hayRanking ? 'Tendencia' : 'Selección'}
          titulo={hayRanking ? 'Lo más buscado y cotizado de la semana' : 'Productos destacados'}
          productos={carrusel}
        />
        <CarruselMarcas />
        <Beneficios />
        <BandaMayorista />

        <section aria-label="Tecnología Full-Color">
          <TileFullColor />
          <p className="mt-3 text-center">
            <Link to="/tecnologia" className="rv-link font-display text-xs font-semibold uppercase tracking-wide">
              Conocer las plataformas y tecnologías Dahua
            </Link>
          </p>
        </section>

        <Institucional />
        <TileResenas />
        <BandaTienda compacta />
      </div>
    </>
  )
}
