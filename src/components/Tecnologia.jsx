import { useCallback, useEffect, useRef, useState } from 'react'
import GlassPanel from './GlassPanel.jsx'

/**
 * Tecnologia.jsx
 * -----------------------------------------------------------------------
 *   TileFullColor   comparador deslizante Full-Color contra infrarrojo
 *   TileTecnologia  (default) conmutador de plataformas Dahua del catalogo
 */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

/* Filtro infrarrojo: no es solo escala de grises. Una camara IR real vira al
   verde -el tubo intensificador y muchos sensores CCD son mas sensibles ahi-,
   nunca queda en blanco y negro puro. grayscale quita el color; sepia+hue-rotate
   reintroduce un UNICO tinte (verde) sobre ese monocromo; saturate lo hace notar. */
const FILTRO_IR = 'grayscale(1) brightness(0.85) sepia(0.5) hue-rotate(78deg) saturate(1.9) contrast(1.15)'
const FILTRO_COLOR = 'saturate(1.3) contrast(1.06) brightness(1.03)'

/* =========================================================================
 * 1. ESCENA NOCTURNA
 *
 * Ilustracion vectorial propia, no una foto de stock. Tres razones:
 *   - Pesa cero: va inline en el bundle, no hay descarga.
 *   - Es nitida en cualquier tamano y en cualquier pantalla.
 *   - Concentra a proposito los elementos que Full-color permite identificar
 *     y el infrarrojo borra: color de vehiculo, color de ropa, patente,
 *     senaletica. Una foto cualquiera rara vez los tiene todos juntos.
 *
 * Fotografia real en uso: `public/full-color-real.webp` (Caminito, La Boca,
 * 1900x1259). No hace falta tocar mas codigo para cambiarla: <Capa> la usa
 * apenas existe el archivo con este nombre, y si algun dia se borra, cae
 * sola en la ilustracion de abajo sin romper el layout.
 * ====================================================================== */
const IMAGEN_REAL = '/full-color-real.webp'

function EscenaNocturna({ titulo }) {
  return (
    <svg
      viewBox="0 0 800 500"
      className="h-full w-full"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={titulo}
    >
      <defs>
        <linearGradient id="rv-cielo" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0A0D18" />
          <stop offset="100%" stopColor="#1A2138" />
        </linearGradient>
        <linearGradient id="rv-asfalto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#242938" />
          <stop offset="100%" stopColor="#12151F" />
        </linearGradient>
        <radialGradient id="rv-farol" cx="50%" cy="0%" r="80%">
          <stop offset="0%" stopColor="#FFCE63" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFCE63" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="rv-neon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FF2E88" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FF2E88" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cielo y calle */}
      <rect width="800" height="500" fill="url(#rv-cielo)" />
      <rect y="330" width="800" height="170" fill="url(#rv-asfalto)" />
      <rect y="328" width="800" height="3" fill="#000000" opacity="0.5" />

      {/* Edificios de fondo con ventanas encendidas */}
      <g fill="#0D111C">
        <rect x="20" y="120" width="130" height="212" />
        <rect x="170" y="80" width="90" height="252" />
        <rect x="560" y="100" width="120" height="232" />
        <rect x="700" y="160" width="90" height="172" />
      </g>
      <g>
        {[
          [40, 150], [70, 150], [100, 150], [40, 190], [100, 190], [70, 230], [40, 270],
          [190, 110], [225, 110], [190, 150], [225, 190], [190, 230], [225, 270],
          [580, 130], [615, 130], [645, 170], [580, 210], [615, 250],
          [720, 190], [755, 190], [720, 230], [755, 270],
        ].map(([x, y], i) => (
          <rect
            key={`v${i}`}
            x={x}
            y={y}
            width="18"
            height="24"
            fill={i % 5 === 0 ? '#7FD4FF' : '#F5C542'}
            opacity={i % 3 === 0 ? 0.85 : 0.55}
          />
        ))}
      </g>

      {/* Cartel de neon */}
      <ellipse cx="640" cy="248" rx="130" ry="90" fill="url(#rv-neon)" />
      <rect x="592" y="215" width="96" height="66" rx="6" fill="#141A2E" stroke="#FF2E88" strokeWidth="3" />
      <g fill="#FF2E88">
        <rect x="608" y="232" width="64" height="7" rx="3.5" />
        <rect x="608" y="248" width="46" height="7" rx="3.5" />
        <rect x="608" y="264" width="56" height="7" rx="3.5" />
      </g>

      {/* Farolas con su cono de luz */}
      {[130, 520].map((x) => (
        <g key={`f${x}`}>
          <path d={`M${x - 90} 500 L${x - 26} 150 L${x + 26} 150 L${x + 90} 500 Z`} fill="url(#rv-farol)" />
          <rect x={x - 4} y="150" width="8" height="182" fill="#2C3346" />
          <rect x={x - 22} y="140" width="44" height="12" rx="5" fill="#3A4258" />
          <rect x={x - 16} y="150" width="32" height="5" fill="#FFE09B" />
        </g>
      ))}

      {/* Contenedor verde */}
      <g>
        <rect x="42" y="280" width="96" height="54" rx="4" fill="#2E8B57" />
        <rect x="42" y="274" width="96" height="10" rx="4" fill="#38A468" />
        <rect x="56" y="334" width="10" height="10" fill="#161A26" />
        <rect x="114" y="334" width="10" height="10" fill="#161A26" />
      </g>

      {/* Vehiculo rojo con patente legible */}
      <g>
        <path
          d="M250 330 L262 288 C266 278 274 272 285 272 L370 272 C381 272 390 277 396 286 L418 318 L432 322 C440 324 444 329 444 336 L444 348 C444 353 440 356 435 356 L258 356 C252 356 248 352 248 346 Z"
          fill="#E02B27"
        />
        <path d="M282 286 L364 286 C372 286 378 290 383 297 L397 316 L282 316 Z" fill="#8FC8E8" opacity="0.55" />
        <rect x="288" y="286" width="5" height="30" fill="#141A2E" opacity="0.7" />
        <rect x="330" y="286" width="5" height="30" fill="#141A2E" opacity="0.7" />
        {/* Patente */}
        <rect x="248" y="330" width="40" height="17" rx="2" fill="#F2E14C" />
        <g fill="#141A2E">
          <rect x="253" y="335" width="5" height="8" />
          <rect x="261" y="335" width="5" height="8" />
          <rect x="269" y="335" width="5" height="8" />
          <rect x="277" y="335" width="5" height="8" />
        </g>
        {/* Opticas */}
        <rect x="430" y="330" width="14" height="10" rx="2" fill="#FFF3C4" />
        <circle cx="290" cy="360" r="20" fill="#11141C" />
        <circle cx="290" cy="360" r="8" fill="#39415A" />
        <circle cx="404" cy="360" r="20" fill="#11141C" />
        <circle cx="404" cy="360" r="8" fill="#39415A" />
      </g>

      {/* Persona con campera amarilla y jean azul */}
      <g>
        <circle cx="520" cy="268" r="15" fill="#E8B48C" />
        <rect x="508" y="256" width="24" height="8" rx="4" fill="#1F2536" />
        <path d="M506 284 L534 284 L538 336 L502 336 Z" fill="#F2C230" />
        <rect x="498" y="288" width="10" height="38" rx="5" fill="#F2C230" />
        <rect x="532" y="288" width="10" height="38" rx="5" fill="#F2C230" />
        <rect x="506" y="336" width="13" height="42" fill="#3457B4" />
        <rect x="521" y="336" width="13" height="42" fill="#3457B4" />
        <rect x="503" y="376" width="18" height="9" rx="3" fill="#15192A" />
        <rect x="519" y="376" width="18" height="9" rx="3" fill="#15192A" />
        {/* Mochila roja */}
        <rect x="534" y="290" width="14" height="26" rx="5" fill="#D61922" />
      </g>

      {/* Conos de obra naranjas */}
      {[600, 636].map((x) => (
        <g key={`c${x}`}>
          <path d={`M${x} 362 L${x + 13} 404 L${x - 13} 404 Z`} fill="#F07A1A" />
          <rect x={x - 17} y="404" width="34" height="7" rx="2" fill="#C85E0C" />
          <rect x={x - 7} y="378" width="14" height="6" fill="#FFFFFF" opacity="0.85" />
        </g>
      ))}

      {/* Linea divisoria de la calzada */}
      <g fill="#C9CEDB" opacity="0.28">
        {[0, 120, 240, 360, 480, 600, 720].map((x) => (
          <rect key={`l${x}`} x={x} y="452" width="64" height="7" />
        ))}
      </g>
    </svg>
  )
}

/* ============================================================== lente 2D */
/**
 * TileFullColor
 * -----------------------------------------------------------------------
 * Control deslizante horizontal: se prueba una lente circular 2D y no
 * mapeaba bien contra el contenedor en produccion (aro desalineado del
 * punto real de toque/cursor). Un divisor de UN solo eje es matematicamente
 * mas simple -un porcentaje, un clip-path `inset()`- y es el patron ya
 * validado en este mismo componente antes de probar la lente.
 */
export function TileFullColor({ className = '' }) {
  const [pos, setPos] = useState(58) // % visible del lado Full-Color (izquierda)
  const [arrastrando, setArrastrando] = useState(false)
  const contRef = useRef(null)

  const mover = useCallback((clientX) => {
    const node = contRef.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    const p = ((clientX - rect.left) / rect.width) * 100
    setPos(clamp(p, 0, 100))
  }, [])

  useEffect(() => {
    if (!arrastrando) return
    const onMove = (e) => mover(e.clientX)
    const onUp = () => setArrastrando(false)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [arrastrando, mover])

  const onKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setPos((p) => clamp(p - 4, 0, 100))
    else if (e.key === 'ArrowRight') setPos((p) => clamp(p + 4, 0, 100))
    else if (e.key === 'Home') setPos(0)
    else if (e.key === 'End') setPos(100)
    else return
    e.preventDefault()
  }

  /* Si `public/full-color-real.webp` todavia no existe, el <img> dispara
     onError una sola vez y el componente cae en la ilustracion: nunca se ve
     un icono de imagen rota mientras nadie subio la foto. */
  const [fotoRota, setFotoRota] = useState(false)
  const Capa = ({ titulo }) =>
    IMAGEN_REAL && !fotoRota ? (
      <img
        src={IMAGEN_REAL}
        alt={titulo}
        className="h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        onError={() => setFotoRota(true)}
      />
    ) : (
      <EscenaNocturna titulo={titulo} />
    )

  return (
    <GlassPanel className={`flex flex-col overflow-hidden p-6 sm:p-8 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="rv-eyebrow mb-2">Tecnología Dahua · Full-Color</p>
          <h2 className="text-onglass font-display text-2xl font-bold sm:text-3xl">
            Captación a color contra <span className="font-light">infrarrojo</span>
          </h2>
          <p className="rv-muted mt-3 text-sm leading-relaxed">
            <strong className="text-onglass font-semibold">Full-Color</strong> es la tecnología de
            Dahua Technology que reemplaza la silueta infrarroja por color real, las 24 horas y sin
            luz ambiente: conserva el color del vehículo y de la vestimenta, y la patente legible.
            Desplace el control para comparar ambos modos de captación.
          </p>
        </div>
        <span className="rv-fullcolor-badge shrink-0 self-start sm:self-auto">
          <span className="rv-fullcolor-text">Full-Color</span>
        </span>
      </div>

      {/* `touch-pan-y`, no `touch-none`: el arrastre horizontal mueve el
          comparador y el vertical sigue siendo scroll de la pagina. */}
      <div
        ref={contRef}
        onPointerDown={(e) => {
          setArrastrando(true)
          mover(e.clientX)
        }}
        className="relative mt-5 aspect-[16/11] w-full touch-pan-y cursor-ew-resize select-none overflow-hidden rounded-glass
                   sm:mt-6 sm:aspect-[16/9] lg:aspect-[21/9]"
        style={{ border: '1px solid var(--glass-border)' }}
      >
        {/* Capa base: infrarrojo verdoso, con la mascara de una camara real
            -escaneado, vineta y grano-, no un simple blanco y negro. */}
        <div className="absolute inset-0 overflow-hidden" style={{ filter: FILTRO_IR }}>
          <Capa titulo="La misma escena captada con iluminación infrarroja: monocromo con tinte verdoso" />
        </div>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
            opacity: 0.5,
          }}
        />
        <div
          aria-hidden="true"
          className="rv-grain pointer-events-none absolute inset-0 opacity-[0.16] mix-blend-overlay"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(120% 100% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)' }}
        />

        {/* Capa superior: Full-Color, recortada por el control deslizante.
            Sin mascara de camara: es la realidad que el control revela. */}
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <div className="h-full w-full" style={{ filter: FILTRO_COLOR }}>
            <Capa titulo="Escena captada con tecnología Full-Color: los colores reales se conservan" />
          </div>
        </div>

        {/* OSD: la sobreimpresion de una camara de seguridad real -no se
            recorta con el control, es la interfaz del equipo, no la escena. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-3 bottom-3 flex items-center gap-1.5 font-display text-[10px]
                     font-semibold uppercase tracking-[0.14em] text-white/85"
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
        >
          <span className="h-1.5 w-1.5 animate-rv-breathe rounded-full bg-rv-red" />
          REC · CAM 04 · IR
        </div>

        {/* Etiquetas fijas */}
        <span className="rv-chip absolute left-3 top-3 text-black/80 dark:text-white/80">Infrarrojo</span>
        <span className="rv-chip absolute right-3 top-3 text-rv-red">Full-Color</span>

        {/* Control deslizante */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90"
          style={{ left: `${pos}%`, boxShadow: '0 0 14px rgba(0,0,0,0.5)' }}
        >
          <button
            type="button"
            role="slider"
            aria-label="Comparador Full-Color contra infrarrojo"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            aria-valuetext={`${Math.round(pos)} por ciento Full-Color`}
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={(e) => {
              e.stopPropagation()
              setArrastrando(true)
            }}
            className="pointer-events-auto absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 sm:h-12 sm:w-12
                       cursor-ew-resize items-center justify-center rounded-full bg-rv-red text-white
                       transition-transform duration-200 ease-apple hover:scale-110 active:scale-95"
            style={{ boxShadow: '0 0 0 4px rgba(255,255,255,0.35), 0 10px 30px -10px rgba(214,25,34,0.9)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
              <path d="m9 6-5 6 5 6M15 6l5 6-5 6" />
            </svg>
          </button>
        </div>
      </div>

      <p className="rv-muted mt-3 text-[11px] leading-relaxed">
        Ilustración comparativa. El resultado real depende del modelo, de la apertura del objetivo y
        de la luz disponible en el sitio. La mesa técnica define el equipo adecuado para cada
        escenario.
      </p>
    </GlassPanel>
  )
}

/* =========================================================================
 * 2. PLATAFORMAS DAHUA DEL CATALOGO
 * ===================================================================== */
export const LINEAS = [
  {
    id: 'wizsense',
    marca: 'WizSense',
    titulo: 'Analítica embebida en el borde',
    texto:
      'Algoritmo de aprendizaje profundo que clasifica persona y vehículo y descarta el resto del movimiento. Vegetación, insectos, lluvia y sombras dejan de generar eventos: el operador atiende avisos pertinentes y la búsqueda posterior se filtra por atributo.',
    dato: '−90%',
    datoPie: 'reducción de falsas alarmas',
  },
  {
    id: 'fullcolor',
    marca: 'Full-Color',
    titulo: 'Color real sin luz ambiente',
    texto:
      'Sensor de gran apertura combinado con iluminación cálida sostenida. La grabación nocturna conserva el color de la vestimenta y del vehículo, y pasa de registrar una silueta a aportar material identificatorio.',
    dato: '24 h',
    datoPie: 'captación a color continua',
  },
  {
    id: 'tioc',
    marca: 'TiOC',
    titulo: 'Tres funciones en un solo equipo',
    texto:
      'Captación, iluminación y respuesta en un mismo equipo: reflector estroboscópico, sirena y audio bidireccional ante la detección perimetral. Integra en un solo dispositivo funciones que de otro modo requieren cámara y panel de disuasión por separado.',
    dato: '3 en 1',
    datoPie: 'captación, luz y alarma',
  },
  {
    id: 'hdcvi',
    marca: 'HDCVI',
    titulo: 'Migración sobre el coaxil existente',
    texto:
      'Alta definición sobre el cableado coaxial existente, con analítica SMD Plus para descartar falsas alarmas. Es la vía de actualización para instalaciones analógicas donde la obra civil resulta inviable.',
    dato: '0 obra',
    datoPie: 'reutiliza el coaxial existente',
  },
  {
    id: 'dss',
    marca: 'DSS / DMSS',
    titulo: 'Gestión centralizada y móvil',
    texto:
      'Administración multisitio con perfiles de usuario, mapa electrónico y auditoría de eventos, con acceso móvil de permisos diferenciados. La licencia de gestión no representa un costo adicional.',
    dato: 'Multisitio',
    datoPie: 'una consola para todas las sedes',
  },
]

export default function TileTecnologia({ className = '' }) {
  const [activo, setActivo] = useState(LINEAS[0].id)
  const linea = LINEAS.find((l) => l.id === activo) || LINEAS[0]

  return (
    <GlassPanel className={`flex flex-col p-6 sm:p-8 ${className}`}>
      <p className="rv-eyebrow mb-2">Plataforma de referencia</p>
      <h2 className="text-onglass font-display text-2xl font-bold sm:text-3xl">
        <span className="text-rv-red">Dahua Technology</span>, dentro de un catálogo multimarca
      </h2>
      <p className="rv-muted mt-3 max-w-3xl text-sm leading-relaxed">
        Dahua concentra la mayor parte de nuestro catálogo por su integración nativa entre cámaras,
        grabadores, control de accesos, detección de intrusión y software de gestión: el sistema
        crece sin incompatibilidades a lo largo del tiempo. Cuando el proyecto lo requiere,
        incorporamos equipamiento de otras marcas del mercado o convivimos con plataformas ya
        instaladas mediante estándares abiertos.
      </p>

      {/* Conmutador */}
      <div role="tablist" aria-label="Plataformas Dahua" className="mt-6 flex flex-wrap gap-2">
        {LINEAS.map((item) => {
          const esActivo = item.id === activo
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={esActivo}
              aria-controls={`tec-${item.id}`}
              onClick={() => setActivo(item.id)}
              className={`cursor-pointer rounded-pill px-4 py-2 font-display text-xs font-bold uppercase tracking-[0.14em]
                          transition-all duration-300 ease-apple active:scale-95
                          ${esActivo ? 'text-white' : 'text-black/75 hover:text-rv-red dark:text-white/75 dark:hover:text-rv-red'}`}
              style={
                esActivo
                  ? { background: '#D61922', boxShadow: '0 10px 26px -14px rgba(214,25,34,0.95)' }
                  : { background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }
              }
            >
              {item.marca}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      <div
        role="tabpanel"
        id={`tec-${linea.id}`}
        key={linea.id}
        className="animate-rv-rise mt-5 grid flex-1 gap-5 rounded-glass p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_auto]"
        style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
      >
        <div>
          <h3 className="text-onglass font-display text-lg font-semibold">{linea.titulo}</h3>
          <p className="rv-muted mt-3 text-sm leading-relaxed">{linea.texto}</p>
        </div>

        <div className="flex flex-col justify-center border-black/10 pt-4 dark:border-white/15 md:border-l md:border-t-0 md:pl-6 md:pt-0">
          <p className="text-onglass font-display text-3xl font-bold leading-none sm:text-4xl">{linea.dato}</p>
          <p className="rv-muted mt-2 max-w-[140px] text-[11px] uppercase tracking-[0.14em]">{linea.datoPie}</p>
        </div>
      </div>
    </GlassPanel>
  )
}
