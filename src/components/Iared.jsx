import { Link } from 'react-router-dom'
import GlassPanel from './GlassPanel.jsx'
import IARED, { contactoIared } from '../datos/iared.js'

/**
 * Iared.jsx
 * -----------------------------------------------------------------------
 * Piezas de IARED en la tienda de REDVISION: la marca, el boton que deriva y
 * el bloque destacado del inicio. Los proyectos (relevamiento, ingenieria,
 * integracion, puesta en marcha) los realiza IARED, una empresa aparte e
 * independiente; la tienda solo le da visibilidad. Datos en src/datos/iared.js.
 *
 * Paleta del sitio: vidrio y grafito; el rojo, solo en la accion principal.
 */

/* Alcance de IARED: sin cifras, plazos ni clientes */
export const ALCANCE_IARED = [
  {
    titulo: 'Relevamiento y diseño',
    texto: 'Visita al sitio, análisis de lo que debe cubrirse y un proyecto pensado para ese lugar.',
    icono: 'M3 7l6-3 6 3 6-3v13l-6 3-6-3-6 3V7Z M9 4v13 M15 7v13',
  },
  {
    titulo: 'Integración de sistemas',
    texto: 'Videovigilancia, control de accesos, intrusión y redes funcionando como una sola solución.',
    icono: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z M10 7h4 M7 10v4 M17 10v4 M10 17h4',
  },
  {
    titulo: 'Puesta en marcha',
    texto: 'Instalación, configuración y verificación del sistema en funcionamiento, punto por punto.',
    icono: 'M12 3v3 M12 18v3 M3 12h3 M18 12h3 M5.6 5.6l2.1 2.1 M16.3 16.3l2.1 2.1 M5.6 18.4l2.1-2.1 M16.3 7.7l2.1-2.1 M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  {
    titulo: 'Capacitación en obra',
    texto: 'Entrega del sistema al personal que lo va a operar, con la explicación de cada componente.',
    icono: 'M3 9l9-5 9 5-9 5-9-5Z M7 11.5V16c0 1.2 2.2 3 5 3s5-1.8 5-3v-4.5',
  },
]

export function IconoLinea({ d, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

/** Logo de IARED si existe; si no, el nombre en tipografia (sin inventar un logo). */
export function MarcaIared({ grande = false, className = '' }) {
  if (IARED.logo) {
    return <img src={IARED.logo} alt={IARED.nombre} className={`w-auto ${grande ? 'h-12' : 'h-9'} ${className}`} loading="lazy" />
  }
  return (
    <span
      role="img"
      aria-label={IARED.nombre}
      className={`text-onglass inline-block border-l-4 border-current pl-3 font-display font-extrabold leading-none tracking-[0.18em] text-black dark:text-white
                  ${grande ? 'text-4xl sm:text-5xl' : 'text-3xl'} ${className}`}
    >
      {IARED.nombre}
    </span>
  )
}

/** Boton que deriva a IARED (o al respaldo temporal, ver datos/iared.js). */
export function BotonIared({ className = '', children = 'Solicitar contacto de IARED' }) {
  const c = contactoIared()
  return (
    <a href={c.href} {...(c.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className={`rv-btn-primary ${className}`}>
      {children}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
        <path d="M5 12h14M13 6l6 6-6 6" />
      </svg>
    </a>
  )
}

/** Aviso honesto mientras IARED no tiene canales propios. */
export function AvisoRespaldo({ className = '' }) {
  if (!contactoIared().respaldo) return null
  return (
    <p className={`rv-muted text-xs leading-relaxed ${className}`}>
      Mientras IARED habilita sus propios canales, la consulta ingresa por el WhatsApp de REDVISION y se la derivamos.
    </p>
  )
}

/** Bloque destacado del inicio: reemplaza al antiguo departamento de proyectos. */
export function BloqueIared() {
  return (
    <section id="iared" aria-labelledby="titulo-iared" className="scroll-mt-40">
      <GlassPanel variant="strong" className="overflow-hidden p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
          <div className="lg:col-span-6">
            <div className="flex flex-wrap items-center gap-3">
              <MarcaIared />
              <span className="rv-chip text-black/80 dark:text-white/80">Empresa independiente</span>
            </div>
            <p className="rv-eyebrow mt-6">Proyectos e integración</p>
            <h2 id="titulo-iared" className="text-onglass mt-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
              ¿Necesita un proyecto completo? <span className="font-light">Lo resuelve IARED.</span>
            </h2>
            <p className="rv-muted mt-4 max-w-xl text-sm leading-relaxed">
              REDVISION se dedica a la comercialización de equipamiento. Los proyectos de seguridad electrónica, desde el relevamiento hasta la
              puesta en marcha, los realiza <strong className="font-semibold text-black dark:text-white">IARED</strong>, una empresa aparte
              especializada en proyectos e integración.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <BotonIared />
              <Link to="/iared" className="rv-btn-glass">
                Conocer IARED
              </Link>
            </div>
            <AvisoRespaldo className="mt-4 max-w-xl" />
          </div>

          <ul className="grid gap-3 sm:grid-cols-2 lg:col-span-6" aria-label="Qué resuelve IARED">
            {ALCANCE_IARED.map((a) => (
              <li
                key={a.titulo}
                className="flex flex-col gap-3 rounded-2xl p-4"
                style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
              >
                <span
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-black/75 dark:text-white/80"
                  style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
                >
                  <IconoLinea d={a.icono} />
                </span>
                <span>
                  <span className="text-onglass block font-display text-sm font-semibold">{a.titulo}</span>
                  <span className="rv-muted mt-1 block text-xs leading-relaxed">{a.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </GlassPanel>
    </section>
  )
}
