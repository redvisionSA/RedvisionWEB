import { useEffect, useRef, useState } from 'react'
import GlassPanel from './GlassPanel.jsx'

/**
 * Nosotros.jsx
 * -----------------------------------------------------------------------
 * Teselas del departamento de proyectos, de la formacion tecnica y de la
 * identidad de la empresa.
 *
 *   TileProyectos       (default)  ciclo completo del departamento de proyectos
 *   TileCapacitaciones             formacion tecnica sin costo
 *   TileDivisiones                 contadores de la estructura
 *   TileAsesoramiento              mesa tecnica, con reloj en vivo
 *   TileNosotros                   la empresa
 *
 * Jerarquia editorial del sitio:
 *   1. Comercializacion   2. Proyectos   3. Capacitacion y demas
 */

/* ---------------------------------------------------- contador animado */
function useContador(valorFinal, activo, duracion = 1200) {
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!activo) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValor(valorFinal)
      return
    }
    let frame = 0
    const inicio = performance.now()
    const tick = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setValor(Math.round(valorFinal * eased))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [valorFinal, activo, duracion])

  return valor
}

function useEnVista(margen = '-15%') {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setVisible(true), {
      rootMargin: margen,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [margen])

  return { ref, visible }
}

/* =========================================================================
 * DEPARTAMENTO DE PROYECTOS
 *
 * Segundo eje del sitio, despues de la comercializacion. Ocupa el ancho
 * completo de la rejilla y despliega el ciclo en seis etapas, porque la
 * propuesta de valor es precisamente que todas las etapas las cubre un
 * mismo responsable.
 * ====================================================================== */
const ETAPAS = [
  {
    n: '01',
    t: 'Escuchamos',
    d: 'Relevamiento del sitio, análisis del riesgo real y definición de objetivos junto al cliente.',
  },
  {
    n: '02',
    t: 'Planificamos',
    d: 'Ingeniería de la solución: plano de implantación, cómputo de materiales y dimensionamiento de red y almacenamiento.',
  },
  {
    n: '03',
    t: 'Cotizamos',
    d: 'Propuesta detallada por ítem, con alternativas de equipamiento, plazos de ejecución y condiciones.',
  },
  {
    n: '04',
    t: 'Instalamos',
    d: 'Ejecución con personal propio, canalización normalizada, puesta en marcha y verificación punto por punto.',
  },
  {
    n: '05',
    t: 'Capacitamos',
    d: 'Formación del personal que va a operar el sistema, con documentación de entrega y claves de administración.',
  },
  {
    n: '06',
    t: 'Acompañamos',
    d: 'Servicio posventa permanente: mantenimiento preventivo, actualizaciones de firmware y repuestos del mismo stock.',
  },
]

export default function TileProyectos({ className = '' }) {
  return (
    <GlassPanel className={`flex flex-col p-6 sm:p-8 ${className}`}>
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
        <header className="lg:col-span-5">
          <p className="rv-eyebrow mb-2">Departamento de proyectos</p>
          <h2 className="text-onglass font-display text-2xl font-bold sm:text-3xl">
            De la necesidad a la puesta en marcha,{' '}
            <span className="text-rv-red">con un único responsable</span>
          </h2>
          <p className="rv-muted mt-4 text-sm leading-relaxed">
            Cuando el requerimiento excede la provisión de equipamiento, el departamento de proyectos
            asume el ciclo completo. Consorcios, industria, countries, organismos públicos y
            operaciones multisitio. El mismo equipo que releva es el que ejecuta y el que responde
            después de la entrega.
          </p>
          <a href="#contacto" className="rv-btn-primary mt-6">
            Solicitar relevamiento
          </a>
        </header>

        <ol className="grid gap-3 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-3">
          {ETAPAS.map((etapa) => (
            <li
              key={etapa.n}
              className="group flex flex-col rounded-2xl p-4 transition-colors duration-300 ease-apple"
              style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
            >
              <span
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full font-display
                           text-[11px] font-bold transition-all duration-300 ease-apple
                           group-hover:bg-rv-red group-hover:text-white"
                style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
              >
                {etapa.n}
              </span>
              <h3 className="text-onglass font-display text-sm font-semibold">{etapa.t}</h3>
              <p className="rv-muted mt-1.5 text-xs leading-relaxed">{etapa.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </GlassPanel>
  )
}

/* ============================================================ divisiones */
/* Cifras verificables contra el propio sitio: no hay numeros inventados. */
const DIVISIONES = [
  { valor: 3, sufijo: '', etiqueta: 'Áreas de actividad' },
  { valor: 6, sufijo: '', etiqueta: 'Líneas de producto' },
  { valor: 5, sufijo: '', etiqueta: 'Plataformas Dahua' },
]

function Metrica({ valor, sufijo, etiqueta, activo }) {
  const n = useContador(valor, activo)
  return (
    <div>
      <p className="font-display text-3xl font-bold leading-none text-rv-red sm:text-4xl">
        {n}
        <span className="text-2xl sm:text-3xl">{sufijo}</span>
      </p>
      <p className="rv-muted mt-2 text-[11px] uppercase tracking-[0.14em]">{etiqueta}</p>
    </div>
  )
}

export function TileDivisiones({ className = '' }) {
  const { ref, visible } = useEnVista()

  return (
    <GlassPanel ref={ref} tilt={3} className={`flex flex-col gap-5 p-6 sm:p-7 ${className}`}>
      <p className="rv-eyebrow">Estructura</p>
      <div className="grid grid-cols-3 gap-4">
        {DIVISIONES.map((m) => (
          <Metrica key={m.etiqueta} {...m} activo={visible} />
        ))}
      </div>
      <p className="rv-muted text-xs leading-relaxed">
        Comercialización como actividad principal, departamento de proyectos y formación técnica. Las
        tres áreas comparten el mismo stock y el mismo equipo técnico.
      </p>
    </GlassPanel>
  )
}

/* ========================================================= asesoramiento */
export function TileAsesoramiento({ className = '' }) {
  const [hora, setHora] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setHora(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const reloj = hora.toLocaleTimeString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })

  return (
    <GlassPanel tilt={3} className={`flex flex-col gap-5 p-6 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 animate-rv-breathe rounded-full bg-rv-red" aria-hidden="true" />
        <p className="rv-eyebrow">Mesa técnica</p>
      </div>

      <div>
        <p className="font-display text-3xl font-bold leading-none tabular-nums sm:text-4xl" aria-live="off">
          {reloj}
        </p>
        <p className="rv-muted mt-2 text-[11px] uppercase tracking-[0.14em]">Hora de Buenos Aires</p>
      </div>

      <p className="rv-muted text-xs leading-relaxed">
        Cada operación se define a partir del requerimiento técnico, no del catálogo. Analizamos el
        escenario, la infraestructura disponible y el objetivo de la instalación antes de emitir una
        cotización.
      </p>
    </GlassPanel>
  )
}

/* ======================================================== capacitaciones */
const TEMARIO = [
  'Puesta en marcha de NVR y XVR, y alta de dispositivos en plataformas de gestión',
  'Direccionamiento IP y segmentación de red dedicada para tráfico de video',
  'Configuración de analítica de video y ajuste de reglas de detección en obra',
  'Buenas prácticas de canalización, rotulado y documentación de entrega',
  'Diagnóstico de fallas frecuentes de campo y uso de instrumental de medición',
  'Novedades de catálogo y diferencias entre líneas de cada fabricante',
]

export function TileCapacitaciones({ className = '' }) {
  return (
    <GlassPanel className={`flex flex-col p-6 sm:p-8 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="rv-eyebrow">Formación técnica</p>
        <span className="rv-chip text-rv-red">Sin costo</span>
      </div>

      <h2 className="text-onglass mt-2 font-display text-2xl font-bold sm:text-3xl">
        Capacitación para instaladores <span className="text-rv-red">y equipos técnicos</span>
      </h2>

      <p className="rv-muted mt-4 max-w-2xl text-sm leading-relaxed">
        Dictamos talleres sobre tecnologías de reciente incorporación y buenas prácticas de
        instalación, en modalidad presencial y en vivo. Una porción significativa de los reclamos de
        garantía del sector corresponde a configuraciones incorrectas, no a fallas de producto: la
        formación es la vía más eficaz para reducirlos.
      </p>

      <ul className="mt-7 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {TEMARIO.map((tema) => (
          <li
            key={tema}
            className="rv-muted flex items-start gap-3 rounded-2xl px-4 py-3 text-sm leading-relaxed"
            style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D61922"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-4 w-4 shrink-0"
              aria-hidden="true"
            >
              <path d="m4 12 5 5L20 6" />
            </svg>
            <span>{tema}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a href="#contacto" className="rv-btn-primary">
          Inscribirse
        </a>
        <p className="rv-muted text-xs">Cupos limitados. Fecha y temario se informan por correo.</p>
      </div>
    </GlassPanel>
  )
}

/* =============================================================== nosotros */
const PILARES = [
  {
    numero: '01',
    titulo: 'Asesoramiento previo a la operación',
    texto:
      'El equipamiento se define a partir del requerimiento técnico relevado. Si la solución se resuelve con menos puntos y un mejor emplazamiento, esa es la propuesta que presentamos.',
  },
  {
    numero: '02',
    titulo: 'Cadena de suministro oficial',
    texto:
      'Producto ingresado por canal oficial, con garantía de fábrica y trazabilidad de número de serie. La disponibilidad de stock es lo que sostiene los plazos de obra comprometidos.',
  },
  {
    numero: '03',
    titulo: 'El instalador como socio estratégico',
    texto:
      'Condiciones comerciales diferenciales, soporte durante la ejecución y capacitación sin costo. El desempeño del instalador forma parte del resultado que entregamos.',
  },
]

export function TileNosotros({ className = '' }) {
  const [abierto, setAbierto] = useState(PILARES[0].numero)

  return (
    <GlassPanel className={`flex flex-col p-6 sm:p-8 ${className}`}>
      <p className="rv-eyebrow mb-2">La empresa</p>
      <h2 className="text-onglass font-display text-2xl font-bold sm:text-3xl">
        Tecnología sin límites, <span className="text-rv-red">ejecución con método</span>
      </h2>

      <p className="rv-muted mt-4 max-w-2xl text-sm leading-relaxed">
        REDVISION es una empresa de comercialización de seguridad electrónica con departamento
        técnico propio. Nuestra trayectoria comenzó en la instalación, y esa experiencia define el
        modo en que asesoramos: conocemos las consecuencias operativas de una decisión de compra mal
        fundamentada. Hoy la actividad principal es la provisión de equipamiento, sostenida por dos
        áreas que no se facturan por separado: el asesoramiento técnico y la capacitación.
      </p>

      <ul className="mt-7 flex flex-col gap-2">
        {PILARES.map((pilar) => {
          const esAbierto = abierto === pilar.numero
          return (
            <li key={pilar.numero}>
              <button
                type="button"
                onClick={() => setAbierto(esAbierto ? '' : pilar.numero)}
                aria-expanded={esAbierto}
                className="flex w-full cursor-pointer items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all duration-300 ease-apple"
                style={{
                  background: 'var(--glass-bg-thin)',
                  border: `1px solid ${esAbierto ? 'rgba(214,25,34,0.85)' : 'var(--glass-border)'}`,
                }}
              >
                <span className="font-display text-xl font-bold leading-none text-rv-red" aria-hidden="true">
                  {pilar.numero}
                </span>
                <span className="text-onglass flex-1 font-display text-sm font-semibold">{pilar.titulo}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`h-4 w-4 shrink-0 text-rv-red transition-transform duration-300 ease-apple ${esAbierto ? 'rotate-45' : ''}`}
                  aria-hidden="true"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>

              <div
                className="grid transition-[grid-template-rows] duration-400 ease-apple"
                style={{ gridTemplateRows: esAbierto ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <p className="rv-muted px-4 pb-1 pt-3 text-sm leading-relaxed">{pilar.texto}</p>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </GlassPanel>
  )
}
