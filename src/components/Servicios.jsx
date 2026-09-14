import { useState } from 'react'
import GlassPanel from './GlassPanel.jsx'

/**
 * Servicios.jsx
 * -----------------------------------------------------------------------
 * Teselas de la actividad principal de REDVISION: la COMERCIALIZACION de
 * equipamiento de seguridad electronica.
 *
 *   TileCatalogo    (default)  las seis lineas de producto
 *   TileMarcas                 posicionamiento multimarca
 *   TileComoComprar            modalidades de compra
 *
 * Registro: profesional. El interlocutor es un instalador, una empresa o un
 * integrador, y la pagina compite con proveedores del mismo rubro.
 */

const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const IconoCamara = (p) => (
  <svg {...svg} {...p}>
    <path d="M3 7.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H3Z" />
    <path d="m16 11 5-2.5v7L16 13" />
    <circle cx="7.5" cy="12" r="1.6" />
  </svg>
)
const IconoAcceso = (p) => (
  <svg {...svg} {...p}>
    <rect x="4" y="3" width="12" height="18" rx="2" />
    <path d="M12 12h.01M19 8v8" />
  </svg>
)
const IconoAlarma = (p) => (
  <svg {...svg} {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7Z" />
    <path d="M10.5 20a1.8 1.8 0 0 0 3 0" />
  </svg>
)
const IconoRed = (p) => (
  <svg {...svg} {...p}>
    <rect x="3" y="14" width="18" height="6" rx="1.6" />
    <path d="M7 17h.01M11 17h.01M12 14V9m-6 5V9h12v5M12 9V4" />
  </svg>
)
const IconoEnergia = (p) => (
  <svg {...svg} {...p}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7Z" />
  </svg>
)
const IconoAccesorio = (p) => (
  <svg {...svg} {...p}>
    <path d="m14.5 3.5 6 6-3 3-1.5-1.5L9 18l-4 1 1-4 7-7L11.5 6.5Z" />
  </svg>
)

export const LINEAS_CATALOGO = [
  {
    id: 'cctv',
    Icono: IconoCamara,
    titulo: 'Videovigilancia',
    resumen: 'Captación, grabación y almacenamiento.',
    texto:
      'Cámaras domo, bullet, multisensor, PTZ y motorizadas en tecnología IP y HDCVI. Grabadores NVR y XVR escalables en canales, discos de vigilancia dimensionados para operación continua y accesorios de montaje certificados.',
    detalles: ['IP y HDCVI', 'NVR y XVR', 'Almacenamiento de vigilancia'],
  },
  {
    id: 'accesos',
    Icono: IconoAcceso,
    titulo: 'Control de accesos',
    resumen: 'Credencialización, biometría y presentismo.',
    texto:
      'Lectoras de proximidad, teclado, código QR y reconocimiento facial. Cerraduras electromagnéticas, molinetes, barreras vehiculares y software de gestión con control de presentismo exportable a sistemas de recursos humanos.',
    detalles: ['Biometría y credencial', 'Molinetes y barreras', 'Control de presentismo'],
  },
  {
    id: 'alarmas',
    Icono: IconoAlarma,
    titulo: 'Detección de intrusión',
    resumen: 'Detección perimetral y disuasión activa.',
    texto:
      'Paneles cableados e inalámbricos, detectores volumétricos y de apertura, sirenas interiores y exteriores, barreras infrarrojas y dispositivos de disuasión activa con señalización lumínica y audio bidireccional.',
    detalles: ['Paneles y detectores', 'Barreras infrarrojas', 'Disuasión activa'],
  },
  {
    id: 'redes',
    Icono: IconoRed,
    titulo: 'Redes y conectividad',
    resumen: 'La infraestructura que sostiene el sistema.',
    texto:
      'Switches PoE y EPoE, enrutadores, enlaces inalámbricos punto a punto, patcheras, cable UTP interior y exterior, y fibra óptica. El rendimiento de una plataforma de video depende de su red tanto como de sus cámaras.',
    detalles: ['Switches PoE', 'Enlaces inalámbricos', 'Cableado y fibra'],
  },
  {
    id: 'energia',
    Icono: IconoEnergia,
    titulo: 'Energía y respaldo',
    resumen: 'Continuidad operativa del sistema.',
    texto:
      'Fuentes conmutadas y lineales, sistemas de alimentación ininterrumpida, baterías de respaldo, protección contra sobretensión y gabinetes con ventilación forzada. El consumo se dimensiona antes de definir la provisión.',
    detalles: ['Fuentes y UPS', 'Baterías de respaldo', 'Protección eléctrica'],
  },
  {
    id: 'accesorios',
    Icono: IconoAccesorio,
    titulo: 'Accesorios e instrumental',
    resumen: 'Terminación y verificación de obra.',
    texto:
      'Soportes y cajas de conexión, conectores y herramienta de crimpeado, elementos de canalización y rotulado, e instrumental de medición para red y video. Determinan la calidad de terminación y la mantenibilidad de la instalación.',
    detalles: ['Soportes y canalización', 'Herramienta', 'Instrumental de medición'],
  },
]

export default function TileCatalogo({ className = '' }) {
  const [activo, setActivo] = useState(LINEAS_CATALOGO[0].id)
  const linea = LINEAS_CATALOGO.find((s) => s.id === activo) || LINEAS_CATALOGO[0]
  const { Icono } = linea

  return (
    <GlassPanel className={`flex flex-col overflow-hidden p-6 sm:p-8 ${className}`}>
      <header className="mb-6">
        <p className="rv-eyebrow mb-2">Comercialización</p>
        <h2 className="text-onglass font-display text-2xl font-bold sm:text-3xl">
          Seis líneas de producto, <span className="text-rv-red">un único proveedor</span>
        </h2>
        <p className="rv-muted mt-3 max-w-2xl text-sm leading-relaxed">
          Abastecemos a instaladores, empresas e integradores con equipamiento de seguridad
          electrónica de las principales marcas del mercado. Cadena de suministro oficial, garantía
          de fábrica y asesoramiento técnico previo a cada operación.
        </p>
      </header>

      <div className="grid flex-1 gap-6 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        {/* Selector */}
        <ul role="tablist" aria-label="Líneas de producto de REDVISION" className="flex flex-col gap-1.5">
          {LINEAS_CATALOGO.map((item) => {
            const esActivo = item.id === activo
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={esActivo}
                  aria-controls={`panel-${item.id}`}
                  id={`tab-${item.id}`}
                  onClick={() => setActivo(item.id)}
                  onMouseEnter={() => setActivo(item.id)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl px-3.5 py-3 text-left
                              transition-all duration-300 ease-apple
                              ${esActivo ? 'text-white' : 'text-black/75 hover:text-rv-red dark:text-white/75 dark:hover:text-rv-red'}`}
                  style={
                    esActivo
                      ? { background: '#D61922', boxShadow: '0 10px 26px -14px rgba(214,25,34,0.95)' }
                      : { background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }
                  }
                >
                  <item.Icono className="h-5 w-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-display text-sm font-semibold leading-tight">{item.titulo}</span>
                    <span className={`block text-xs leading-tight ${esActivo ? 'text-white/80' : 'rv-muted'}`}>
                      {item.resumen}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        {/* Panel */}
        <div
          role="tabpanel"
          id={`panel-${linea.id}`}
          aria-labelledby={`tab-${linea.id}`}
          key={linea.id}
          className="animate-rv-rise flex flex-col justify-between rounded-glass p-5 sm:p-6"
          style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
        >
          <div>
            <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rv-red text-white">
              <Icono className="h-6 w-6" />
            </span>
            <h3 className="text-onglass font-display text-xl font-semibold">{linea.titulo}</h3>
            <p className="rv-muted mt-3 text-sm leading-relaxed">{linea.texto}</p>
          </div>

          <ul className="mt-6 flex flex-wrap gap-2">
            {linea.detalles.map((d) => (
              <li key={d} className="rv-chip text-black/80 dark:text-white/80">
                {d}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </GlassPanel>
  )
}

/* =========================================================================
 * MULTIMARCA
 *
 * Tesela dedicada. Sin ella, la presencia de Dahua en la barra, en el pie y
 * en la seccion de tecnologia deja la impresion de una marca unica, y eso
 * cierra operaciones que la empresa si puede atender.
 * ====================================================================== */
const CRITERIOS = [
  {
    titulo: 'Dahua Technology',
    texto:
      'Concentra la mayor parte del catálogo por su integración nativa entre cámaras, grabadores, control de accesos y software de gestión, y por la continuidad de su soporte.',
    destacado: true,
  },
  {
    titulo: 'Otras marcas del mercado',
    texto:
      'Cotizamos e incorporamos equipamiento de cualquier fabricante cuando el proyecto, la normativa del cliente o una plataforma preexistente así lo requieren.',
    destacado: false,
  },
  {
    titulo: 'Instalaciones existentes',
    texto:
      'Trabajamos sobre sistemas ya instalados: ampliaciones, reemplazos parciales y convivencia de plataformas mediante estándares abiertos.',
    destacado: false,
  },
]

export function TileMarcas({ className = '' }) {
  return (
    <GlassPanel className={`flex flex-col p-6 sm:p-7 ${className}`}>
      <p className="rv-eyebrow mb-2">Catálogo multimarca</p>
      <h3 className="text-onglass font-display text-xl font-bold sm:text-2xl">
        Una plataforma de referencia,
        <br />
        <span className="font-light">el mercado completo como respaldo</span>
      </h3>

      <p className="rv-muted mt-3 text-sm leading-relaxed">
        Recomendamos Dahua porque entendemos que ofrece la mejor relación entre prestaciones,
        integración y soporte. Esa preferencia no limita la oferta: el objetivo es cubrir el
        requerimiento del cliente con el equipamiento que mejor lo resuelva.
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {CRITERIOS.map((c) => (
          <li
            key={c.titulo}
            className="rounded-2xl p-4"
            style={{
              background: 'var(--glass-bg-thin)',
              border: `1px solid ${c.destacado ? 'rgba(214,25,34,0.75)' : 'var(--glass-border)'}`,
            }}
          >
            <p
              className={`font-display text-sm font-semibold ${c.destacado ? 'text-rv-red' : 'text-onglass'}`}
            >
              {c.titulo}
            </p>
            <p className="rv-muted mt-1.5 text-xs leading-relaxed">{c.texto}</p>
          </li>
        ))}
      </ul>
    </GlassPanel>
  )
}

/* =========================================================================
 * MODALIDADES DE COMPRA
 * ====================================================================== */
const MODALIDADES = [
  {
    titulo: 'Venta minorista',
    texto:
      'Atención presencial en nuestro local, con disponibilidad confirmada previamente para evitar traslados innecesarios.',
    etiqueta: 'Retiro en el día',
  },
  {
    titulo: 'Canal mayorista',
    texto:
      'Lista de precios diferencial, condiciones por volumen y cuenta corriente para instaladores y empresas del rubro.',
    etiqueta: 'Instaladores y empresas',
  },
  {
    titulo: 'Despacho nacional',
    texto:
      'Envíos a todo el país por transporte o correo, con número de seguimiento informado el mismo día del despacho.',
    etiqueta: 'Cobertura nacional',
  },
]

export function TileComoComprar({ className = '' }) {
  return (
    <GlassPanel tilt={2.5} className={`flex flex-col p-6 sm:p-7 ${className}`}>
      <p className="rv-eyebrow mb-4">Modalidades de compra</p>

      <ul className="grid gap-3 sm:grid-cols-3">
        {MODALIDADES.map((m) => (
          <li
            key={m.titulo}
            className="flex flex-col rounded-2xl p-4 transition-colors duration-300 ease-apple"
            style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
          >
            <span className="rv-chip mb-3 self-start text-rv-red">{m.etiqueta}</span>
            <h3 className="text-onglass font-display text-base font-semibold">{m.titulo}</h3>
            <p className="rv-muted mt-2 text-xs leading-relaxed">{m.texto}</p>
          </li>
        ))}
      </ul>

      <a href="#contacto" className="rv-btn-primary mt-5 self-start">
        Solicitar lista de precios
      </a>
    </GlassPanel>
  )
}
