import { Link } from 'react-router-dom'
import { ALCANCE_IARED, AvisoRespaldo, BotonIared, IconoLinea, MarcaIared, useFuenteIared } from '../components/Iared.jsx'
import IARED from '../datos/iared.js'
import { Migas } from '../tienda/piezas.jsx'
import Pagina, { usePagina } from './Pagina.jsx'

/**
 * /iared: pagina que deriva los proyectos a IARED. REDVISION no ofrece
 * proyectos ni puesta en marcha; aca se explica que resuelve IARED y se
 * deriva al interesado. Sin cifras, clientes ni plazos (no hay datos todavia).
 * /proyectos redirige aca (App.jsx).
 *
 * El contenido va en superficies solidas `.iared-zona` (colores, Sora y logo
 * del manual de IARED, sin el rojo de REDVISION); la barra, el video y el pie
 * siguen siendo de la tienda.
 */

/* Por que confiar: solo lo que es cierto por como se organizan las marcas */
const CONFIANZA = [
  {
    titulo: 'Dedicada a proyectos',
    texto: 'Es su actividad, no un complemento de una venta: relevamiento, ingeniería y puesta en marcha son lo que hace.',
  },
  {
    titulo: 'Un único interlocutor',
    texto: 'IARED lo acompaña desde la primera visita hasta que el sistema queda en funcionamiento.',
  },
  {
    titulo: 'Recomendada por REDVISION',
    texto: 'Es a quien REDVISION deriva los proyectos de sus clientes.',
  },
]

const PASOS = [
  { n: '01', titulo: 'Cuéntenos qué necesita', texto: 'El lugar, lo que desea cubrir y cualquier dato con el que ya cuente.' },
  { n: '02', titulo: 'IARED lo contacta', texto: 'Para comprender el caso y coordinar el relevamiento.' },
  { n: '03', titulo: 'Acuerdo directo con IARED', texto: 'Relevamiento, propuesta y condiciones se acuerdan directamente con IARED.' },
]

export default function Iared() {
  useFuenteIared()
  usePagina({
    titulo: 'Proyectos de seguridad electrónica con IARED',
    descripcion: `IARED, ${IARED.eslogan}: relevamiento, ingeniería, integración y puesta en marcha de proyectos de seguridad electrónica. REDVISION lo deriva.`,
  })

  return (
    <Pagina>
      <Migas items={[{ label: 'Inicio', to: '/' }, { label: 'Proyectos' }]} />

      <div className="iared-zona flex flex-col gap-4">
        <section aria-labelledby="titulo-pagina-iared" className="iared-panel iared-panel--banda p-6 sm:p-8 lg:p-10">
          <MarcaIared grande />
          <h1 id="titulo-pagina-iared" className="iared-h1 max-w-3xl">
            Proyectos de seguridad electrónica, con IARED
          </h1>
          <p className="iared-suave mt-4 max-w-2xl text-base leading-relaxed">
            REDVISION comercializa equipamiento. Si lo que usted necesita es un proyecto completo, desde el relevamiento hasta la puesta en marcha,
            lo derivamos a <strong className="iared-fuerte">IARED</strong>, que se dedica a proyectos e integración con inteligencia aplicada a la
            red.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <BotonIared />
            <Link to="/productos" className="iared-cta-sec">
              Solo necesito equipos
            </Link>
          </div>
          <AvisoRespaldo className="mt-4 max-w-2xl" />
        </section>

        <section aria-labelledby="titulo-alcance" className="iared-panel p-6 sm:p-8">
          <p className="iared-etiqueta">Qué resuelve</p>
          <h2 id="titulo-alcance" className="iared-h2 mt-2">
            Todo lo que va más allá de adquirir el equipo
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALCANCE_IARED.map((a) => (
              <li key={a.titulo} className="iared-tarjeta flex h-full flex-col gap-3 p-5">
                <span className="iared-icono">
                  <IconoLinea d={a.icono} />
                </span>
                <h3 className="iared-h3">{a.titulo}</h3>
                <p className="iared-suave text-sm leading-relaxed">{a.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-confianza" className="iared-panel grid gap-6 p-6 sm:p-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="iared-etiqueta">Por qué IARED</p>
            <h2 id="titulo-confianza" className="iared-h2 mt-2">
              Un proyecto requiere a alguien dedicado solo a eso
            </h2>
            <p className="iared-suave mt-3 text-sm leading-relaxed">
              Separar la comercialización de los proyectos deja a cada uno en su especialidad. IARED es una marca nueva: cuando habilite sus
              propios canales, este botón lo llevará directamente a ellos.
            </p>
          </div>
          <ul className="grid gap-3 lg:col-span-7">
            {CONFIANZA.map((c) => (
              <li key={c.titulo} className="iared-tarjeta flex items-start gap-3 p-5">
                <span className="iared-tilde" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </span>
                <span>
                  <span className="iared-h3 block">{c.titulo}</span>
                  <span className="iared-suave mt-1 block text-sm leading-relaxed">{c.texto}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-pasos" className="iared-panel p-6 sm:p-8">
          <p className="iared-etiqueta">Cómo es el contacto</p>
          <h2 id="titulo-pasos" className="iared-h2 mt-2">
            Tres pasos
          </h2>
          <ol className="mt-5 grid gap-3 sm:grid-cols-3">
            {PASOS.map((p) => (
              <li key={p.n} className="iared-tarjeta p-5">
                <span className="iared-numero" aria-hidden="true">
                  {p.n}
                </span>
                <h3 className="iared-h3 mt-2">{p.titulo}</h3>
                <p className="iared-suave mt-1.5 text-sm leading-relaxed">{p.texto}</p>
              </li>
            ))}
          </ol>
          <div className="iared-tarjeta mt-6 flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <p className="iared-h3">¿Desea que IARED evalúe su proyecto?</p>
            <BotonIared className="shrink-0" />
          </div>
        </section>
      </div>
    </Pagina>
  )
}
