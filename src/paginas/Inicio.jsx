import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Hero3D from '../components/Hero3D.jsx'
import GlassPanel from '../components/GlassPanel.jsx'
import { TileFullColor } from '../components/Tecnologia.jsx'
import { TileResenas } from '../components/Ubicacion.jsx'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { LINEAS } from '../tienda/lineas.js'
import { sePuedeComprar } from '../tienda/piezas.jsx'
import Riel from '../tienda/Riel.jsx'
import { IconoCamion, IconoEscudo, IconoFlecha, IconoLocal, IconoTecnico, IconoWhatsapp } from '../tienda/Iconos.jsx'
import EMPRESA from '../datos/empresa.js'
import { usePagina } from './Pagina.jsx'

/**
 * Inicio = tienda.
 *
 * Orden pensado para la decision de compra:
 *   1. Hero: busqueda y lineas a la vista (intencion), robot (marca).
 *   2. Departamentos con cantidad real de productos.
 *   3. Destacados y lo que el visitante ya miro (continuidad).
 *   4. Respaldo: garantia, asesoramiento, envio, retiro (reduce el riesgo percibido).
 *   5. Canal mayorista (el cliente que mas factura).
 *   6. Lo institucional, resumido y enlazado a su pestaña: tecnologia,
 *      proyectos, capacitacion, empresa, reseñas.
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

function Departamentos() {
  const { catalogo } = useTienda()
  const conteo = useMemo(() => {
    const c = {}
    catalogo.datos.productos.forEach((p) => {
      c[p.linea] = (c[p.linea] || 0) + 1
    })
    return c
  }, [catalogo.datos.productos])

  return (
    <section aria-labelledby="titulo-departamentos">
      <div className="mb-4 px-1">
        <p className="rv-eyebrow mb-1.5">Comprar por línea</p>
        <h2 id="titulo-departamentos" className="text-onglass font-display text-xl font-bold sm:text-2xl">
          Todo lo que lleva una instalación profesional
        </h2>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
        {LINEAS.map((l) => (
          <li key={l.id}>
            <GlassPanel tilt={3} className="group h-full p-0">
              <Link to={`/productos/${l.id}`} className="flex h-full flex-col p-4 sm:p-5">
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black text-white transition-colors duration-300 group-hover:bg-rv-red dark:bg-white dark:text-black dark:group-hover:bg-rv-red dark:group-hover:text-white">
                  <l.Icono className="h-5 w-5" />
                </span>
                <span className="text-onglass font-display text-sm font-semibold leading-tight group-hover:text-rv-red sm:text-base">
                  {l.titulo}
                </span>
                <span className="rv-muted mt-1 text-xs leading-snug">{l.resumen}</span>
                <span className="mt-auto flex items-center justify-between pt-4 font-display text-[11px] font-semibold uppercase tracking-wide text-black/60 dark:text-white/65">
                  {conteo[l.id] ? `${conteo[l.id]} productos` : 'Ver línea'}
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

function Beneficios() {
  return (
    <GlassPanel variant="thin" className="p-4 sm:p-6">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {BENEFICIOS.map(({ Icono, titulo, texto }) => (
          <li key={titulo} className="flex items-start gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-black dark:text-white" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
              <Icono className="h-5 w-5" />
            </span>
            <span>
              <span className="text-onglass block font-display text-sm font-semibold">{titulo}</span>
              <span className="rv-muted mt-0.5 block text-xs leading-relaxed">{texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  )
}

function BandaMayorista() {
  return (
    <GlassPanel tilt={1.5} className="overflow-hidden p-6 sm:p-8 lg:p-10">
      <div className="grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="rv-eyebrow mb-2">Canal mayorista</p>
          <h2 className="text-onglass font-display text-2xl font-bold leading-tight sm:text-3xl">
            ¿Instalador, integrador o empresa? <span className="text-rv-red">Compre con condiciones de gremio.</span>
          </h2>
          <p className="rv-muted mt-3 max-w-2xl text-sm leading-relaxed sm:text-base">
            Lista de precios diferencial, condiciones por volumen y cuenta corriente para instaladores y
            empresas del rubro. Un asesor da de alta su cuenta y le envía la lista vigente.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
          <Link to="/contacto?tipo=mayorista" className="rv-btn-primary w-full sm:w-auto lg:min-w-[260px]">
            Solicitar cuenta mayorista
          </Link>
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
  const { catalogo, vistos } = useTienda()
  const { productos, porId } = catalogo.datos

  const destacados = useMemo(() => {
    const marcados = productos.filter((p) => p.destacado && sePuedeComprar(p))
    const base = marcados.length >= 4 ? marcados : productos.filter((p) => sePuedeComprar(p) && p.precio !== null)
    return base.slice(0, 12)
  }, [productos])

  const videovigilancia = useMemo(
    () => productos.filter((p) => p.linea === 'cctv' && sePuedeComprar(p)).slice(0, 12),
    [productos]
  )

  const recientes = useMemo(() => vistos.map((id) => porId.get(id)).filter(Boolean), [vistos, porId])

  return (
    <>
      <Hero3D onRobotListo={onRobotListo} />

      <div className="mx-auto flex max-w-[1400px] flex-col gap-10 px-4 pb-10 sm:gap-12 sm:px-5">
        <Departamentos />
        <SinCatalogo />
        <Riel eyebrow="Selección" titulo="Productos destacados" productos={destacados} verTodo="/productos" />
        {recientes.length > 0 && <Riel eyebrow="Para retomar" titulo="Vistos recientemente" productos={recientes} />}
        <Beneficios />
        <Riel eyebrow="Videovigilancia" titulo="Cámaras y grabación" productos={videovigilancia} verTodo="/productos/cctv" />
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
      </div>
    </>
  )
}
