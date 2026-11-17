import { useEffect, useRef, useState } from 'react'
import { enlaceConsulta } from '../tienda/whatsapp.js'
import GlassPanel from './GlassPanel.jsx'

/**
 * Nosotros.jsx
 * -----------------------------------------------------------------------
 * Teselas de la formacion tecnica y de la identidad de la empresa.
 * Los proyectos (relevamiento, ingenieria, puesta en marcha) ya no son de
 * REDVISION: los realiza IARED, empresa aparte (components/Iared.jsx).
 *
 *   TileCapacitaciones             formacion tecnica sin costo
 *   TileDivisiones                 contadores de la estructura
 *   TileAsesoramiento              mesa tecnica, con reloj en vivo
 *   TileNosotros                   la empresa
 *
 * Jerarquia editorial del sitio:
 *   1. Comercializacion   2. Asesoramiento   3. Capacitacion y demas
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
      <p className="text-onglass font-display text-3xl font-bold leading-none sm:text-4xl">
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
        Comercialización como actividad principal, asesoramiento técnico y formación para
        instaladores. Las tres áreas comparten el mismo equipo técnico.
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
      <p className="rv-eyebrow">Mesa técnica</p>

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
  'Configuración inicial de NVR y XVR, y alta de dispositivos en plataformas de gestión',
  'Direccionamiento IP y segmentación de red dedicada para tráfico de video',
  'Configuración de analítica de video y ajuste de reglas de detección en campo',
  'Buenas prácticas de canalización, rotulado y documentación de entrega',
  'Diagnóstico de fallas frecuentes de campo y uso de instrumental de medición',
  'Novedades de catálogo y diferencias entre líneas de cada fabricante',
]

export function TileCapacitaciones({ className = '' }) {
  return (
    <GlassPanel className={`flex flex-col p-6 sm:p-8 ${className}`}>
      <div className="flex flex-wrap items-center gap-3">
        <p className="rv-eyebrow">Formación técnica</p>
        <span className="rv-chip text-black/80 dark:text-white/80">Sin costo</span>
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
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 h-4 w-4 shrink-0 text-black/55 dark:text-white/60"
              aria-hidden="true"
            >
              <path d="m4 12 5 5L20 6" />
            </svg>
            <span>{tema}</span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a href={enlaceConsulta('capacitacion')} target="_blank" rel="noopener noreferrer" className="rv-btn-primary">
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
      'Producto ingresado por canal oficial, con garantía de fábrica y trazabilidad de número de serie. La disponibilidad de stock es lo que sostiene los plazos de entrega comprometidos.',
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
                <span
                  className={`font-display text-xl font-bold leading-none transition-colors duration-300 ease-apple ${esAbierto ? 'text-rv-red' : 'text-onglass'}`}
                  aria-hidden="true"
                >
                  {pilar.numero}
                </span>
                <span className="text-onglass flex-1 font-display text-sm font-semibold">{pilar.titulo}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className={`h-4 w-4 shrink-0 transition-all duration-300 ease-apple ${
                    esAbierto ? 'rotate-45 text-rv-red' : 'text-black/60 dark:text-white/60'
                  }`}
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
