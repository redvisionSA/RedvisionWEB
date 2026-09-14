import { useEffect, useRef, useState } from 'react'
import { useSite } from '../context/SiteContext.jsx'

/* El video de fondo viene YA DESENFOCADO desde ffmpeg y a 854 px.
   Antes el desenfoque lo hacia el navegador con `backdrop-filter` sobre toda
   la pantalla, en cada frame y en cada scroll. Hornearlo en el archivo saca
   ese trabajo del hilo de composicion y ademas baja el peso de 3,9 MB a
   717 KB, porque un video desenfocado comprime muchisimo mejor. */
const VIDEO_SRC = '/hero-bg.mp4'
/* Copia nitida, solo para el modo vigilancia. Se descarga unicamente si
   alguien enciende la lente, y eso es de escritorio. */
const VIDEO_NITIDO = '/hero-sharp.mp4'
const POSTER_SRC = '/hero-poster.jpg'
const RADIO_LENTE = 130 // px

/**
 * VideoBackground
 * ----------------------------------------------------------------------
 * Capa 1 (z-index -30): el video institucional, fijo, en bucle, sin audio.
 *                       Cubre todo el viewport, no solo el Hero.
 * Capa 2 (z-index -20): velo (scrim) con backdrop-filter. Atenua y desatura
 *                       el video para que lea como fondo, nunca como contenido.
 * Capa 3 (z-index -10): vineta roja institucional + grano fino.
 * Capa 4 (z-index   5): "modo vigilancia" opcional. Un circulo que recorta
 *                       una segunda copia del video SIN velo y la revela
 *                       nitida bajo el cursor, como la optica de una camara.
 *
 * El video se pausa cuando la pestana pierde foco: ahorra bateria y CPU.
 */
/** Conexiones lentas o modo ahorro: el video no se descarga y queda el poster.
 *  Son 3,9 MB; en una red movil medida eso es dinero del visitante. */
function detectarAhorro() {
  if (typeof navigator === 'undefined') return false
  const conexion = navigator.connection || navigator.mozConnection || navigator.webkitConnection
  if (!conexion) return false
  if (conexion.saveData) return true
  return ['slow-2g', '2g', '3g'].includes(conexion.effectiveType)
}

export default function VideoBackground({ activo = true }) {
  const { lens, canHover } = useSite()
  const videoRef = useRef(null)
  const lensVideoRef = useRef(null)
  const lensRef = useRef(null)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [ahorroDatos] = useState(detectarAhorro)

  /* El video solo arranca si hay permiso de movimiento y de datos */
  const reproducir = activo && !ahorroDatos && !reducedMotion

  /* Respeta prefers-reduced-motion: sin movimiento, el fondo queda en el poster */
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = (matches) => {
      setReducedMotion(matches)
      const video = videoRef.current
      if (!video) return
      if (matches) video.pause()
      else video.play().catch(() => {})
    }
    apply(media.matches)
    const onChange = (event) => apply(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  /* El src llega despues del montaje, asi que autoPlay no alcanza: arrancamos
     la reproduccion cuando `activo` pasa a true. */
  useEffect(() => {
    if (!reproducir) return
    const video = videoRef.current
    if (video) video.play().catch(() => {})
  }, [reproducir])

  /* Pausa el video en segundo plano */
  useEffect(() => {
    const onVisibility = () => {
      const video = videoRef.current
      if (!video || reducedMotion) return
      if (document.hidden) video.pause()
      else video.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [reducedMotion])

  /* Modo vigilancia: mueve el recorte circular siguiendo al cursor */
  useEffect(() => {
    if (!lens || !canHover) return

    let frame = 0
    const onMove = (event) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const node = lensRef.current
        if (!node) return
        node.style.clipPath = `circle(${RADIO_LENTE}px at ${event.clientX}px ${event.clientY}px)`
        node.style.setProperty('--lx', `${event.clientX}px`)
        node.style.setProperty('--ly', `${event.clientY}px`)
      })
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
    }
  }, [lens, canHover])

  /* Arranca la copia nitida al encender la lente */
  useEffect(() => {
    if (!lens) return
    const copia = lensVideoRef.current
    if (copia) copia.play().catch(() => {})
  }, [lens])

  return (
    <>
      {/* ---------- Capa 1: video ---------- */}
      <div className="pointer-events-none fixed inset-0 -z-30 overflow-hidden">
        {/* El src se asigna recien cuando `activo` es true. Durante la intro el
            ancho de banda va entero al modelo; el poster ya cubre la pantalla. */}
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src={reproducir ? VIDEO_SRC : undefined}
          poster={POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload={reproducir ? 'auto' : 'none'}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      {/* ---------- Capa 2: velo con desenfoque ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-20"
        style={{
          background: 'var(--scrim)',
          backdropFilter: 'blur(var(--scrim-blur)) saturate(75%)',
          WebkitBackdropFilter: 'blur(var(--scrim-blur)) saturate(75%)',
        }}
      />

      {/* ---------- Capa 3: vineta roja + grano ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(120% 80% at 50% 0%, rgba(214,25,34,0.16), transparent 58%), radial-gradient(90% 60% at 100% 100%, rgba(214,25,34,0.10), transparent 60%)',
        }}
      />
      <div aria-hidden="true" className="rv-grain pointer-events-none fixed inset-0 -z-10 opacity-[0.18] mix-blend-overlay" />

      {/* ---------- Capa 4: modo vigilancia (solo con cursor) ---------- */}
      {lens && canHover && (
        <div ref={lensRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]" style={{ clipPath: 'circle(0px at 50% 50%)' }}>
          <video
            ref={lensVideoRef}
            className="h-full w-full object-cover"
            src={VIDEO_NITIDO}
            autoPlay
            loop
            muted
            playsInline
            tabIndex={-1}
          />
          {/* Reticula de camara dentro de la lente */}
          <div
            className="absolute rounded-full border-2 border-rv-red"
            style={{
              width: RADIO_LENTE * 2,
              height: RADIO_LENTE * 2,
              left: `calc(var(--lx, 50%) - ${RADIO_LENTE}px)`,
              top: `calc(var(--ly, 50%) - ${RADIO_LENTE}px)`,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.5), 0 0 40px rgba(214,25,34,0.5)',
            }}
          >
            <span className="absolute left-1/2 top-0 h-5 w-px -translate-x-1/2 bg-rv-red" />
            <span className="absolute bottom-0 left-1/2 h-5 w-px -translate-x-1/2 bg-rv-red" />
            <span className="absolute left-0 top-1/2 h-px w-5 -translate-y-1/2 bg-rv-red" />
            <span className="absolute right-0 top-1/2 h-px w-5 -translate-y-1/2 bg-rv-red" />
          </div>
        </div>
      )}
    </>
  )
}
