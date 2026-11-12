import { Link, useLocation } from 'react-router-dom'
import TileCatalogo, { TileComoComprar, TileMarcas, TileRespaldo } from '../components/Servicios.jsx'
import TileTecnologia, { TileFullColor } from '../components/Tecnologia.jsx'
import TileProyectos, { TileAsesoramiento, TileCapacitaciones, TileDivisiones, TileNosotros } from '../components/Nosotros.jsx'
import Contacto from '../components/Contacto.jsx'
import GlassPanel from '../components/GlassPanel.jsx'
import { Migas } from '../tienda/piezas.jsx'
import Pagina, { usePagina } from './Pagina.jsx'

/**
 * Pestañas institucionales. Reutilizan las teselas del sitio original sin
 * cambiar su contenido: el registro y la informacion se conservan, solo
 * cambia el lugar donde viven. Cada pagina cierra con un puente a la tienda.
 */

function Encabezado({ eyebrow, titulo, texto, miga }) {
  return (
    <>
      <Migas items={[{ label: 'Inicio', to: '/' }, { label: miga }]} />
      <header className="mb-6 max-w-3xl px-1">
        <p className="rv-eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-onglass font-display text-3xl font-bold leading-tight sm:text-5xl">{titulo}</h1>
        {texto && <p className="rv-muted mt-3 text-base leading-relaxed">{texto}</p>}
      </header>
    </>
  )
}

function PuenteTienda({ texto = '¿Ya sabe lo que necesita?' }) {
  return (
    <GlassPanel variant="thin" className="mt-4 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
      <p className="text-onglass font-display text-lg font-semibold">{texto} Compre en línea con precio final y envío a todo el país.</p>
      <Link to="/productos" className="rv-btn-primary shrink-0">
        Ir a la tienda
      </Link>
    </GlassPanel>
  )
}

const rejilla = 'grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12'

export function Empresa() {
  usePagina({
    titulo: 'La empresa',
    descripcion: 'REDVISION: comercialización mayorista y minorista de seguridad electrónica, departamento de proyectos y formación técnica.',
  })
  return (
    <Pagina>
      <Encabezado
        miga="Empresa"
        eyebrow="La empresa"
        titulo={
          <>
            Tecnología <span className="text-rv-red">sin límites</span>
          </>
        }
        texto="Comercialización de equipamiento de seguridad electrónica, departamento de proyectos llave en mano y formación técnica para instaladores."
      />
      <div className={rejilla}>
        <TileNosotros className="md:col-span-6 lg:col-span-7" />
        <div className="grid gap-4 md:col-span-6 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
          <TileDivisiones />
          <TileAsesoramiento />
        </div>
        <TileCatalogo className="md:col-span-6 lg:col-span-12" />
        <div className="flex flex-col gap-4 md:col-span-6 lg:col-span-7">
          <TileComoComprar />
          <TileRespaldo />
        </div>
        <TileMarcas className="md:col-span-6 lg:col-span-5" />
      </div>
      <PuenteTienda />
    </Pagina>
  )
}

export function Proyectos() {
  usePagina({
    titulo: 'Departamento de proyectos',
    descripcion: 'Proyectos llave en mano de seguridad electrónica: relevamiento, ingeniería, cotización, instalación, capacitación y posventa.',
  })
  return (
    <Pagina>
      <Encabezado
        miga="Proyectos"
        eyebrow="Departamento de proyectos"
        titulo={
          <>
            Del relevamiento <span className="font-light">al servicio posventa</span>
          </>
        }
      />
      <div className={rejilla}>
        <TileProyectos className="md:col-span-6 lg:col-span-12" />
        <TileRespaldo className="md:col-span-6 lg:col-span-7" />
        <TileAsesoramiento className="md:col-span-6 lg:col-span-5" />
      </div>
      <PuenteTienda texto="¿Prefiere comprar el equipamiento y resolver la instalación?" />
    </Pagina>
  )
}

export function TecnologiaPagina() {
  usePagina({
    titulo: 'Tecnología',
    descripcion: 'Tecnologías y plataformas Dahua: Full-Color, WizSense, WizMind, HDCVI y más. Catálogo multimarca.',
  })
  return (
    <Pagina>
      <Encabezado
        miga="Tecnología"
        eyebrow="Tecnología"
        titulo={
          <>
            Plataformas que <span className="text-rv-red">ven más</span>
          </>
        }
        texto="Dahua Technology es nuestra plataforma de referencia por su integración entre cámaras, grabadores, control de accesos y software. El catálogo es multimarca."
      />
      <div className={rejilla}>
        <TileFullColor className="md:col-span-6 lg:col-span-12" />
        <TileTecnologia className="md:col-span-6 lg:col-span-12" />
        <TileMarcas className="md:col-span-6 lg:col-span-12" />
      </div>
      <PuenteTienda />
    </Pagina>
  )
}

export function Capacitaciones() {
  usePagina({
    titulo: 'Capacitación técnica',
    descripcion: 'Capacitación técnica para instaladores e integradores de seguridad electrónica.',
  })
  return (
    <Pagina>
      <Encabezado
        miga="Capacitación"
        eyebrow="Formación técnica"
        titulo={
          <>
            Capacitación <span className="font-light">para instaladores</span>
          </>
        }
      />
      <div className={rejilla}>
        <TileCapacitaciones className="md:col-span-6 lg:col-span-12" />
      </div>
      <PuenteTienda />
    </Pagina>
  )
}

export function ContactoPagina() {
  usePagina({
    titulo: 'Contacto',
    descripcion: 'Contacto, ubicación y horarios de REDVISION. Ventas, cuentas mayoristas, proyectos y capacitación.',
  })
  return (
    <div className="pt-[136px] lg:pt-[156px]">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5">
        <Migas items={[{ label: 'Inicio', to: '/' }, { label: 'Contacto' }]} />
      </div>
      <Contacto />
    </div>
  )
}

export function NoEncontrada() {
  usePagina({ titulo: 'Página no encontrada' })
  const { pathname } = useLocation()
  return (
    <Pagina>
      <GlassPanel className="mx-auto max-w-xl p-8 text-center">
        <p className="rv-eyebrow mb-2 justify-center">Error 404</p>
        <h1 className="text-onglass font-display text-3xl font-bold">No encontramos «{pathname}»</h1>
        <p className="rv-muted mt-2 text-sm">La dirección puede haber cambiado con la nueva tienda.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/" className="rv-btn-primary">
            Ir al inicio
          </Link>
          <Link to="/productos" className="rv-btn-glass">
            Ver productos
          </Link>
        </div>
      </GlassPanel>
    </Pagina>
  )
}
