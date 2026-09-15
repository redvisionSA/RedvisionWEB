import { useCallback, useState } from 'react'
import { useSite } from '../context/SiteContext.jsx'
import GlassPanel from './GlassPanel.jsx'
import RobotDahua from './RobotDahua.jsx'

/* Pastillas de dato. En pantallas medianas y grandes flotan sobre el robot;
   en telefono pasan a una fila debajo del lienzo, donde no lo tapan. */
const HUD = [
  { valor: 'Multimarca', etiqueta: 'Catálogo integral', pos: 'left-0 top-[14%]', delay: '120ms' },
  { valor: 'Mayorista', etiqueta: 'Condiciones para instaladores', pos: 'right-0 top-[44%]', delay: '260ms' },
  { valor: 'Oficial', etiqueta: 'Garantía de fábrica', pos: 'left-[2%] bottom-[8%]', delay: '400ms' },
]

const TICKER = ['Full-color', 'WizSense', 'TiOC', 'WizMind', 'HDCVI', 'DSS Pro', 'Airshield', 'SMD Plus', 'ANPR', 'EPoE']

const IconoGiro = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
    <path d="M3 9a6 6 0 0 0 0 6M21 9a6 6 0 0 1 0 6" />
  </svg>
)

/* ------------------------------------------------------------------------
 * Control del robot en tactil.
 *
 * En escritorio el cursor recorre la ventana y no hace falta explicar nada.
 * Sin cursor el seguimiento lo lleva el giroscopio, encendido de entrada y
 * sin interruptor: el dispositivo se inclina y el objetivo se queda apuntando
 * a la persona.
 *
 * Deliberadamente no hay arrastre con el dedo. El robot ocupa casi toda la
 * altura visible de un telefono, y un lienzo que captura el gesto deja la
 * pagina aparentemente trabada para quien apoya el dedo ahi para bajar. El
 * scroll gana.
 *
 * iOS 13+ exige que el permiso del sensor se pida desde un gesto del usuario.
 * Es el unico caso en que aparece un boton, y desaparece al concederlo.
 * ---------------------------------------------------------------------- */
function ControlRobot({ controles, hayCursor }) {
  if (hayCursor) {
    return (
      <p className="rv-muted mt-3 text-center text-[11px] uppercase tracking-[0.2em]">
        Mueva el cursor: el objetivo lo sigue
      </p>
    )
  }

  if (!controles) return null

  const { giroEstado, giroActivo, activarGiro } = controles

  /* Permiso pendiente: un solo toque, y no vuelve a aparecer */
  if (!giroActivo && giroEstado === 'requiere-permiso') {
    return (
      <div className="mt-4 flex flex-col items-center gap-2.5">
        <button
          type="button"
          onClick={activarGiro}
          className="inline-flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-pill px-5
                     font-display text-xs font-semibold uppercase tracking-[0.14em] text-white
                     transition-all duration-300 ease-apple active:scale-95"
          style={{ background: '#D61922', boxShadow: '0 12px 30px -14px rgba(214,25,34,0.95)' }}
        >
          <IconoGiro className="h-4 w-4" />
          Activar seguimiento
        </button>
        <p className="rv-muted max-w-[230px] text-center text-[11px] leading-relaxed">
          Su dispositivo pide autorización para el sensor de movimiento.
        </p>
      </div>
    )
  }

  if (giroActivo) {
    return (
      <p className="rv-muted mt-4 flex items-center justify-center gap-2 text-center text-[11px] uppercase tracking-[0.16em]">
        <IconoGiro className="h-3.5 w-3.5 animate-rv-breathe text-rv-red" />
        Incline el dispositivo: el objetivo lo sigue
      </p>
    )
  }

  /* Sensor denegado o inexistente: el robot conserva su barrido de reposo y
     no se menciona nada, porque no hay nada que el visitante pueda hacer. */
  return null
}

export default function Hero3D({ onRobotListo }) {
  const { canHover } = useSite()
  const [controles, setControles] = useState(null)
  const [qrEnFoco, setQrEnFoco] = useState(false)
  const recibirControles = useCallback((c) => setControles(c), [])
  const recibirFoco = useCallback((v) => setQrEnFoco(v), [])

  return (
    <section
      id="inicio"
      className="relative min-h-[100svh] overflow-hidden pb-8 pt-[108px] sm:pb-10 sm:pt-[140px] lg:pt-[150px]"
    >
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5">
        {/* Maquetado asimetrico en escritorio; apilado en telefono y tablet */}
        <div className="relative grid gap-8 lg:grid-cols-12 lg:gap-5">
          {/* ---------------- Titular ---------------- */}
          <div className="animate-rv-rise lg:col-span-7 lg:pt-10 xl:col-span-6">
            <span className="rv-chip mb-5 text-rv-red sm:mb-6">
              <span className="h-1.5 w-1.5 animate-rv-breathe rounded-full bg-rv-red" aria-hidden="true" />
              <span className="hidden xs:inline">Comercialización y proyectos de seguridad electrónica</span>
              <span className="xs:hidden">Seguridad electrónica</span>
            </span>

            <h1 className="text-onglass font-display text-[clamp(2.4rem,9vw,5.4rem)] font-bold leading-[0.95]">
              Todo el equipamiento
              <br />
              <span className="inline-block text-rv-red">de seguridad</span>
              <br />
              <span className="font-light">en un solo proveedor</span>
            </h1>

            <p className="rv-muted text-onglass mt-6 max-w-xl text-base leading-relaxed sm:mt-7 sm:text-lg">
              REDVISION provee equipamiento de seguridad electrónica a instaladores, empresas e
              integradores: <strong className="font-semibold">videovigilancia, control de accesos,
              detección de intrusión, redes y energía</strong>. Trabajamos con las principales marcas
              del mercado, con <strong className="font-semibold">Dahua Technology</strong> como
              plataforma de referencia, y contamos con un{' '}
              <strong className="font-semibold">departamento de proyectos</strong> que cubre el ciclo
              completo, del relevamiento al servicio posventa.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap sm:items-center">
              <a href="#contacto" className="rv-btn-primary animate-rv-pulse-ring w-full sm:w-auto">
                Solicitar cotización
              </a>
              <a href="#catalogo" className="rv-btn-glass w-full sm:w-auto">
                Ver catálogo
              </a>
            </div>
          </div>

          {/* ---------------- Robot 3D ---------------- */}
          <div className="relative lg:col-span-5 lg:-ml-16 xl:col-span-6 xl:-ml-24">
            <div className="relative mx-auto aspect-square w-full max-w-[380px] sm:max-w-[520px] lg:max-w-[620px]">
              {/* Marco optico y linea de escaneo.
                  Se apagan mientras el QR del escudo esta en primer plano: el
                  aro y la linea cruzan el codigo y estorban al lector. */}
              <div
                className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ease-apple ${
                  qrEnFoco ? 'opacity-0' : 'opacity-100'
                }`}
                aria-hidden="true"
              >
                <div className="absolute inset-[8%] z-10 rounded-full border border-rv-red/25" />
                <div className="absolute inset-[16%] z-10 rounded-full border border-rv-red/15" />
                <div className="absolute inset-[8%] z-10 overflow-hidden rounded-full">
                  <div className="h-20 w-full animate-rv-scan bg-gradient-to-b from-transparent via-rv-red/30 to-transparent sm:h-28" />
                </div>
              </div>

              {/* El canvas se monta de entrada, junto con el resto de la
                  pagina: el GLB ya se precarga desde el import del modulo
                  (ver RobotDahua.jsx), asi que arrancar aca en paralelo con
                  el video de fondo es lo que evita el render disparejo. La
                  PantallaCarga de App.jsx tapa la pagina hasta que este
                  canvas -y el video- esten listos. */}
              <RobotDahua
                className="absolute inset-0"
                onControles={recibirControles}
                onFoco={recibirFoco}
                onListo={onRobotListo}
              />

              {/* HUD flotante: solo desde tablet en adelante */}
              {HUD.map((item) => (
                <GlassPanel
                  key={item.etiqueta}
                  variant="thin"
                  className={`animate-rv-rise absolute ${item.pos} z-20 hidden rounded-pill px-3.5 py-2
                              transition-opacity duration-500 ease-apple sm:block sm:px-4 sm:py-2.5
                              ${qrEnFoco ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
                  style={{ borderRadius: 999, animationDelay: item.delay }}
                >
                  <p className="text-onglass font-display text-sm font-bold leading-none sm:text-base">
                    {item.valor}
                  </p>
                  <p className="rv-muted mt-1 text-[10px] uppercase tracking-[0.16em]">{item.etiqueta}</p>
                </GlassPanel>
              ))}
            </div>

            {/* HUD en telefono: fila debajo del lienzo, sin tapar el robot */}
            <ul className="mt-4 flex gap-2 sm:hidden">
              {HUD.map((item) => (
                <li key={item.etiqueta} className="flex-1">
                  <GlassPanel variant="thin" className="h-full rounded-2xl px-3 py-2.5">
                    <p className="text-onglass font-display text-sm font-bold leading-none">{item.valor}</p>
                    <p className="rv-muted mt-1 text-[9px] uppercase leading-tight tracking-[0.12em]">
                      {item.etiqueta}
                    </p>
                  </GlassPanel>
                </li>
              ))}
            </ul>

            {!qrEnFoco && <ControlRobot controles={controles} hayCursor={canHover} />}
          </div>
        </div>

        {/* ---------------- Ticker de tecnologias ---------------- */}
        <GlassPanel
          variant="thin"
          className="mt-8 overflow-hidden rounded-pill py-2.5 sm:mt-10 sm:py-3"
          style={{ borderRadius: 999 }}
        >
          <div className="flex w-max animate-rv-marquee items-center gap-7 px-5 sm:gap-10 sm:px-6" aria-hidden="true">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span
                key={`${item}-${i}`}
                className="flex shrink-0 items-center gap-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.18em] sm:gap-3 sm:text-xs sm:tracking-[0.2em]"
              >
                <span className="h-1 w-1 rounded-full bg-black/50 dark:bg-white/55" />
                {item}
              </span>
            ))}
          </div>
          <span className="sr-only">Tecnologías Dahua soportadas: {TICKER.join(', ')}.</span>
        </GlassPanel>
      </div>
    </section>
  )
}
