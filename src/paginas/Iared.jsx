import { Link } from 'react-router-dom'
import GlassPanel from '../components/GlassPanel.jsx'
import { ALCANCE_IARED, AvisoRespaldo, BotonIared, IconoLinea, MarcaIared } from '../components/Iared.jsx'
import { Migas } from '../tienda/piezas.jsx'
import Pagina, { usePagina } from './Pagina.jsx'

/**
 * /iared: pagina que deriva los proyectos a IARED. REDVISION no ofrece
 * proyectos ni puesta en marcha; aca se explica que resuelve IARED y se
 * deriva al interesado. Sin cifras, clientes ni plazos (no hay datos todavia).
 * /proyectos redirige aca (App.jsx).
 */

/* Por que confiar: solo lo que es cierto por como se organizan las empresas */
const CONFIANZA = [
  {
    titulo: 'Dedicada a proyectos',
    texto: 'Es su actividad, no un complemento de una venta: relevamiento, ingeniería y puesta en marcha son lo que hace.',
  },
  {
    titulo: 'Un único interlocutor',
    texto: 'La misma empresa lo acompaña desde la primera visita hasta que el sistema queda en funcionamiento.',
  },
  {
    titulo: 'Recomendada por REDVISION',
    texto: 'Es la empresa a la que REDVISION deriva los proyectos de sus clientes.',
  },
]

const PASOS = [
  { n: '01', titulo: 'Cuéntenos qué necesita', texto: 'El lugar, lo que desea cubrir y cualquier dato con el que ya cuente.' },
  { n: '02', titulo: 'IARED lo contacta', texto: 'Para comprender el caso y coordinar el relevamiento.' },
  { n: '03', titulo: 'Acuerdo directo con IARED', texto: 'Relevamiento, propuesta y condiciones se acuerdan directamente con IARED.' },
]

const caja = { background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }

export default function Iared() {
  usePagina({
    titulo: 'Proyectos de seguridad electrónica con IARED',
    descripcion:
      'Los proyectos de seguridad electrónica (relevamiento, ingeniería, integración y puesta en marcha) los realiza IARED, una empresa independiente. REDVISION lo deriva.',
  })

  return (
    <Pagina>
      <Migas items={[{ label: 'Inicio', to: '/' }, { label: 'Proyectos' }]} />

      <GlassPanel variant="strong" className="p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <MarcaIared grande />
          <span className="rv-chip text-black/80 dark:text-white/80">Empresa independiente</span>
        </div>
        <h1 className="text-onglass mt-6 max-w-3xl font-display text-3xl font-bold leading-tight sm:text-5xl">
          Proyectos de seguridad electrónica, <span className="font-light">con IARED</span>
        </h1>
        <p className="rv-muted mt-4 max-w-2xl text-base leading-relaxed">
          REDVISION comercializa equipamiento. Si lo que usted necesita es un proyecto completo, desde el relevamiento hasta la puesta en marcha,
          lo derivamos a <strong className="font-semibold text-black dark:text-white">IARED</strong>: una empresa aparte, independiente de
          REDVISION, especializada en proyectos e integración.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <BotonIared />
          <Link to="/productos" className="rv-btn-glass">
            Solo necesito equipos
          </Link>
        </div>
        <AvisoRespaldo className="mt-4 max-w-2xl" />
      </GlassPanel>

      <section aria-labelledby="titulo-alcance" className="mt-10">
        <div className="mb-4 px-1">
          <p className="rv-eyebrow mb-1.5">Qué resuelve</p>
          <h2 id="titulo-alcance" className="text-onglass font-display text-xl font-bold sm:text-2xl">
            Todo lo que va más allá de adquirir el equipo
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ALCANCE_IARED.map((a) => (
            <li key={a.titulo}>
              <GlassPanel tilt={2} className="flex h-full flex-col gap-3 p-6">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-black/75 dark:text-white/80" style={caja}>
                  <IconoLinea d={a.icono} />
                </span>
                <h3 className="text-onglass font-display text-base font-semibold">{a.titulo}</h3>
                <p className="rv-muted text-sm leading-relaxed">{a.texto}</p>
              </GlassPanel>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-confianza" className="mt-10 grid gap-4 lg:grid-cols-12">
        <GlassPanel variant="thin" className="p-6 sm:p-7 lg:col-span-5">
          <p className="rv-eyebrow mb-2">Por qué IARED</p>
          <h2 id="titulo-confianza" className="text-onglass font-display text-xl font-bold leading-tight sm:text-2xl">
            Un proyecto requiere a alguien dedicado solo a eso
          </h2>
          <p className="rv-muted mt-3 text-sm leading-relaxed">
            Separar la comercialización de los proyectos deja a cada empresa en su especialidad. IARED es una marca nueva: cuando habilite sus
            propios canales, este botón lo llevará directamente a ellos.
          </p>
        </GlassPanel>
        <ul className="grid gap-3 lg:col-span-7">
          {CONFIANZA.map((c) => (
            <li key={c.titulo}>
              <GlassPanel variant="thin" className="flex items-start gap-3 p-5">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mt-0.5 h-4 w-4 shrink-0 text-black/60 dark:text-white/70"
                  aria-hidden="true"
                >
                  <path d="m4 12 5 5L20 6" />
                </svg>
                <span>
                  <span className="text-onglass block font-display text-sm font-semibold">{c.titulo}</span>
                  <span className="rv-muted mt-1 block text-sm leading-relaxed">{c.texto}</span>
                </span>
              </GlassPanel>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-pasos" className="mt-10">
        <div className="mb-4 px-1">
          <p className="rv-eyebrow mb-1.5">Cómo es el contacto</p>
          <h2 id="titulo-pasos" className="text-onglass font-display text-xl font-bold sm:text-2xl">
            Tres pasos
          </h2>
        </div>
        <ol className="grid gap-3 sm:grid-cols-3">
          {PASOS.map((p) => (
            <li key={p.n} className="rounded-2xl p-5" style={caja}>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full font-display text-[11px] font-bold" style={caja} aria-hidden="true">
                {p.n}
              </span>
              <h3 className="text-onglass mt-3 font-display text-sm font-semibold">{p.titulo}</h3>
              <p className="rv-muted mt-1.5 text-sm leading-relaxed">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <GlassPanel variant="thin" className="mt-10 flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
        <p className="text-onglass font-display text-lg font-semibold">¿Desea que IARED evalúe su proyecto?</p>
        <BotonIared className="shrink-0" />
      </GlassPanel>
    </Pagina>
  )
}
