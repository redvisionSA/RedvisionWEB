import { useSite } from '../context/SiteContext.jsx'
import GlassPanel from './GlassPanel.jsx'
import EMPRESA from '../datos/empresa.js'

const COLUMNAS = [
  {
    titulo: 'Catálogo',
    enlaces: [
      { href: '#catalogo', label: 'Videovigilancia' },
      { href: '#catalogo', label: 'Control de accesos' },
      { href: '#catalogo', label: 'Detección de intrusión' },
      { href: '#catalogo', label: 'Redes y energía' },
    ],
  },
  {
    titulo: 'Compañía',
    enlaces: [
      { href: '#proyectos', label: 'Departamento de proyectos' },
      { href: '#proyectos', label: 'La empresa' },
      { href: '#capacitaciones', label: 'Capacitaciones' },
      { href: '#contacto', label: 'Contacto' },
    ],
  },
]

const IconoWhatsapp = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.8 9.8 0 0 0 4.69 1.2h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.09.81.83-3.02-.2-.31a8.14 8.14 0 0 1-1.25-4.3c0-4.5 3.67-8.17 8.18-8.17a8.17 8.17 0 0 1 8.17 8.18c0 4.5-3.67 8.13-8.17 8.13Zm4.49-6.09c-.25-.12-1.46-.72-1.68-.8-.23-.09-.39-.13-.55.12s-.64.8-.78.97c-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.58.26 1.04.41 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
)

const IconoInstagram = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true" {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
  </svg>
)

const IconoFacebook = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.25-1.5 1.5-1.5H16.6V4.4A21 21 0 0 0 14.3 4.3c-2.3 0-3.8 1.4-3.8 4v2.2H8v3h2.5V21Z" />
  </svg>
)

const IconoTienda = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M4 4h1.6l1.7 9.4a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.6L20 7H6.2" />
    <circle cx="10" cy="19.5" r="1.4" />
    <circle cx="17" cy="19.5" r="1.4" />
  </svg>
)

const REDES = [
  { href: EMPRESA.telefono.whatsapp, label: 'WhatsApp', Icono: IconoWhatsapp },
  { href: EMPRESA.redes.instagram, label: 'Instagram', Icono: IconoInstagram },
  { href: EMPRESA.redes.facebook, label: 'Facebook', Icono: IconoFacebook },
  { href: EMPRESA.redes.tienda, label: 'Tienda online', Icono: IconoTienda },
]

const CONTACTO = [
  { titulo: 'Ventas', valor: EMPRESA.telefono.display, href: `tel:${EMPRESA.telefono.tel}` },
  { titulo: 'Correo', valor: EMPRESA.email, href: `mailto:${EMPRESA.email}` },
  { titulo: 'Local', valor: EMPRESA.direccion.completa, href: EMPRESA.direccion.ficha },
]

export default function Footer() {
  const { isDark } = useSite()
  const anio = new Date().getFullYear()

  return (
    <footer className="pb-safe relative z-10 mx-auto max-w-[1400px] px-3 sm:px-5">
      {/* Material chrome: el mismo de la barra. En dark mode es cristal gris,
          para que el logotipo de REDVISION se lea sobre el. */}
      <GlassPanel variant="chrome" className="rounded-glass-lg p-7 sm:p-9">
        <div className="grid gap-8 sm:grid-cols-2 sm:gap-9 lg:grid-cols-12">
          {/* Marca */}
          <div className="sm:col-span-2 lg:col-span-4">
            <img
              src={isDark ? '/redvision-logo-dark.png' : '/redvision-logo.png'}
              alt="REDVISION - Tecnología sin límites"
              width="320"
              height="66"
              className="h-12 w-auto object-contain sm:h-14 lg:h-16"
              loading="lazy"
              decoding="async"
            />
            <p className="rv-muted mt-5 max-w-sm text-sm leading-relaxed">
              Comercialización de equipamiento de seguridad electrónica en Argentina, con catálogo
              multimarca y Dahua Technology como plataforma de referencia. Departamento de proyectos
              llave en mano y formación técnica para instaladores.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {REDES.map(({ href, label, Icono }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-pill text-black
                             transition-all duration-300 ease-apple hover:text-rv-red active:scale-90 dark:text-white"
                  style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
                >
                  <Icono className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Enlaces */}
          {COLUMNAS.map((columna) => (
            <nav key={columna.titulo} aria-label={columna.titulo} className="lg:col-span-2">
              <h3 className="rv-eyebrow">{columna.titulo}</h3>
              <ul className="mt-5 space-y-3">
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.label}>
                    <a href={enlace.href} className="rv-link text-sm">
                      {enlace.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contacto directo */}
          <div className="lg:col-span-2">
            <h3 className="rv-eyebrow">Contacto</h3>
            <dl className="mt-5 space-y-3">
              {CONTACTO.map((dato) => (
                <div key={dato.titulo}>
                  <dt className="rv-muted text-[10px] uppercase tracking-[0.16em]">{dato.titulo}</dt>
                  <dd>
                    <a
                      href={dato.href}
                      target={dato.href.startsWith('http') ? '_blank' : undefined}
                      rel={dato.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      className="rv-link break-words text-sm"
                    >
                      {dato.valor}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Respaldo tecnologico */}
          <div className="lg:col-span-2">
            <h3 className="rv-eyebrow">Plataforma de referencia</h3>
            {/* Chip blanco: el wordmark oficial de Dahua es negro y asi se lee
                igual en clear mode y en dark mode, sin retocar la marca. */}
            <span className="rv-chip-marca mt-5 px-4 py-3">
              <img
                src="/dahua-logo.png"
                alt="Dahua Technology"
                width="294"
                height="88"
                className="h-11 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </span>
            <p className="rv-muted mt-4 text-xs leading-relaxed">
              Powered by Dahua. Comercializamos además las principales marcas del mercado. Los
              nombres y logotipos citados pertenecen a sus respectivos titulares.
            </p>
          </div>
        </div>

        <div className="mt-9 flex flex-col gap-3 border-t border-black/10 pt-6 dark:border-white/20 sm:flex-row sm:items-center sm:justify-between">
          <p className="rv-muted text-xs">&copy; {anio} {EMPRESA.nombre}. Todos los derechos reservados.</p>
          <p className="rv-muted text-xs">
            {EMPRESA.lema} <span className="text-rv-red">&middot;</span> {EMPRESA.direccion.pais}
          </p>
        </div>
      </GlassPanel>
    </footer>
  )
}
