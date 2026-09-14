import GlassPanel from './GlassPanel.jsx'
import TileCatalogo, { TileComoComprar, TileMarcas } from './Servicios.jsx'
import TileTecnologia, { TileFullColor } from './Tecnologia.jsx'
import TileProyectos, {
  TileAsesoramiento,
  TileCapacitaciones,
  TileDivisiones,
  TileNosotros,
} from './Nosotros.jsx'

/**
 * BentoCanvas
 * ----------------------------------------------------------------------
 * Lienzo bento continuo sobre el video institucional.
 *
 * El orden responde a la jerarquia del negocio, no a la costumbre del rubro:
 *
 *   1. catalogo        comercializacion, la actividad principal
 *   2. proyectos       departamento que cubre el ciclo completo
 *   3. capacitaciones  formacion tecnica y estructura
 *
 * Rejilla: 1 columna en movil, 6 en tablet, 12 en escritorio.
 *
 * ALTURA DE LAS TESELAS
 * Una rejilla CSS estira por defecto todas las celdas de una fila hasta la
 * altura de la mas alta. Con teselas de volumen muy distinto eso producia
 * paneles casi vacios: una tesela de tres cifras estirada contra un panel de
 * seis etapas.
 *
 * La solucion no es apagar el estirado -eso rompe el canto inferior comun que
 * sostiene la estetica bento- sino emparejar volumenes: la columna corta se
 * arma apilando dos teselas chicas dentro de un contenedor que si alcanza la
 * altura de su vecina. Cada panel conserva la altura de su contenido y la
 * fila sigue cerrando pareja.
 */

const RESPALDO = [
  'Producto ingresado por canal oficial, con garantía de fábrica y trazabilidad de número de serie',
  'Asesoramiento técnico previo a la operación, sin cargo adicional',
  'Dimensionamiento de ancho de banda y almacenamiento calculado sobre el proyecto',
  'Soporte durante la instalación y servicio posventa sostenido',
]

function TileRespaldo({ className = '' }) {
  return (
    <GlassPanel tilt={2} className={`p-6 sm:p-7 ${className}`}>
      <p className="rv-eyebrow mb-4">Respaldo de cada operación</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {RESPALDO.map((item) => (
          <li key={item} className="rv-muted flex items-start gap-3 text-sm leading-relaxed">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D61922"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="m4 12 5 5L20 6" />
            </svg>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </GlassPanel>
  )
}

export default function BentoCanvas() {
  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-5">
      {/* ============ 1. Comercializacion: la actividad principal ============ */}
      <section id="catalogo" className="scroll-mt-28 pt-4 sm:scroll-mt-32 sm:pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          {/* Fila alta: dos paneles de volumen equivalente */}
          <TileCatalogo className="md:col-span-6 lg:col-span-7" />
          <TileFullColor className="md:col-span-6 lg:col-span-5" />

          {/* Fila mixta: dos teselas horizontales apiladas contra una vertical.
              Modalidades y respaldo son listas cortas y anchas; multimarca es
              un bloque de lectura. Apiladas suman la altura del vecino. */}
          <div className="flex flex-col gap-4 md:col-span-6 lg:col-span-7">
            <TileComoComprar />
            <TileRespaldo />
          </div>
          <TileMarcas className="md:col-span-6 lg:col-span-5" />

          <TileTecnologia className="md:col-span-6 lg:col-span-12" />
        </div>
      </section>

      {/* ============ 2. Departamento de proyectos ============ */}
      <section id="proyectos" className="scroll-mt-28 pt-4 sm:scroll-mt-32">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          <TileProyectos className="md:col-span-6 lg:col-span-12" />

          <TileNosotros className="md:col-span-6 lg:col-span-7" />
          {/* En tablet las dos teselas cortas van lado a lado; en escritorio se
              apilan dentro de la columna angosta. Nunca quedan estiradas. */}
          <div className="grid gap-4 md:col-span-6 md:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
            <TileDivisiones />
            <TileAsesoramiento />
          </div>
        </div>
      </section>

      {/* ============ 3. Formacion tecnica ============ */}
      <section id="capacitaciones" className="scroll-mt-28 pt-4 sm:scroll-mt-32">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          <TileCapacitaciones className="md:col-span-6 lg:col-span-12" />
        </div>
      </section>
    </div>
  )
}
