import { useEffect, useRef, useState } from 'react'
import GlassPanel from './GlassPanel.jsx'
import { useSite } from '../context/SiteContext.jsx'
import EMPRESA from '../datos/empresa.js'

/**
 * Ubicacion.jsx
 * -----------------------------------------------------------------------
 *   TileMapa     mapa de Google con activacion por click y tratamiento de marca
 *   TileResenas  resenas de Google, alimentadas por public/resenas.json
 */

/* ========================================================================
 * 1. MAPA
 *
 * El iframe arranca cubierto por una capa de marca. Dos motivos:
 *   - Un mapa vivo dentro de una pagina larga secuestra la rueda del mouse.
 *     Hasta que el visitante no lo activa, el scroll sigue siendo de la pagina.
 *   - El mapa de Google entra con su propia paleta y rompe el dark mode. La
 *     capa permite mostrarlo tratado hasta que alguien decide usarlo.
 *
 * El iframe no se carga hasta que la tesela entra en pantalla: un mapa en el
 * pie de la pagina no tiene por que costar peticiones en el primer pintado.
 * ===================================================================== */
export function TileMapa({ className = '' }) {
  const { isDark } = useSite()
  const [activo, setActivo] = useState(false)
  const [enPantalla, setEnPantalla] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setEnPantalla(true),
      { rootMargin: '300px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* Tratamiento del mapa segun el tema. En dark mode se invierte para que
     entre en la paleta en lugar de abrir un rectangulo blanco. */
  const filtro = isDark
    ? 'invert(0.92) hue-rotate(180deg) saturate(0.7) brightness(0.95) contrast(0.95)'
    : 'grayscale(0.55) contrast(1.06) brightness(1.02)'

  return (
    <GlassPanel ref={ref} className={`flex flex-col overflow-hidden p-6 sm:p-7 ${className}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div>
          <p className="rv-eyebrow mb-2">Dónde estamos</p>
          <h3 className="text-onglass font-display text-xl font-bold sm:text-2xl">
            {EMPRESA.direccion.calle}
          </h3>
          <p className="rv-muted mt-1 text-sm">
            {EMPRESA.direccion.codigoPostal} &middot; {EMPRESA.direccion.localidad}
          </p>
        </div>

        <dl className="flex flex-col gap-1">
          {EMPRESA.horarios.map((h) => (
            <div key={h.dias} className="flex items-baseline gap-2">
              <dt className="rv-muted text-[11px] uppercase tracking-[0.14em]">{h.dias}</dt>
              <dd className="text-onglass font-display text-sm font-semibold tabular-nums">{h.horas}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ---------------- Lienzo del mapa ---------------- */}
      <div
        className="relative mt-5 aspect-[4/3] w-full overflow-hidden rounded-glass sm:mt-6 sm:aspect-[16/10] lg:aspect-[2/1]"
        style={{ border: '1px solid var(--glass-border)' }}
      >
        {enPantalla && (
          <iframe
            title={`Mapa de ${EMPRESA.nombre} en ${EMPRESA.direccion.completa}`}
            src={EMPRESA.direccion.embed}
            className="absolute inset-0 h-full w-full transition-[filter] duration-700 ease-apple"
            style={{
              border: 0,
              filter: activo ? 'none' : filtro,
              pointerEvents: activo ? 'auto' : 'none',
            }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        )}

        {/* Reticula de camara centrada en el local */}
        <div
          className={`pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2
                      transition-opacity duration-500 ease-apple ${activo ? 'opacity-0' : 'opacity-100'}`}
          aria-hidden="true"
        >
          <span className="relative flex h-16 w-16 items-center justify-center">
            <span className="absolute inset-0 animate-rv-pulse-ring rounded-full border-2 border-rv-red" />
            <span className="absolute inset-[30%] rounded-full bg-rv-red" />
            <span className="absolute left-1/2 top-[-14px] h-4 w-px -translate-x-1/2 bg-rv-red" />
            <span className="absolute bottom-[-14px] left-1/2 h-4 w-px -translate-x-1/2 bg-rv-red" />
            <span className="absolute left-[-14px] top-1/2 h-px w-4 -translate-y-1/2 bg-rv-red" />
            <span className="absolute right-[-14px] top-1/2 h-px w-4 -translate-y-1/2 bg-rv-red" />
          </span>
        </div>

        {/* Capa de activacion */}
        <button
          type="button"
          onClick={() => setActivo(true)}
          hidden={activo}
          className="group absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-end gap-3 pb-6
                     transition-colors duration-300"
          style={{ background: 'var(--glass-bg-thin)' }}
          aria-label="Activar el mapa interactivo"
        >
          {/* Linea de escaneo, la misma firma visual del Hero */}
          <span className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <span className="block h-24 w-full animate-rv-scan bg-gradient-to-b from-transparent via-rv-red/25 to-transparent" />
          </span>

          <span className="rv-chip text-rv-red transition-transform duration-300 ease-apple group-hover:scale-105">
            Active el mapa interactivo
          </span>
        </button>

        {activo && (
          <button
            type="button"
            onClick={() => setActivo(false)}
            className="absolute right-3 top-3 z-20 cursor-pointer rounded-pill px-3 py-1.5 font-display text-[10px]
                       font-semibold uppercase tracking-[0.16em] text-black transition-colors duration-200
                       hover:text-rv-red dark:text-white dark:hover:text-rv-red"
            style={{ background: 'var(--glass-bg-strong)', border: '1px solid var(--glass-border)' }}
          >
            Bloquear desplazamiento
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={EMPRESA.direccion.comoLlegar}
          target="_blank"
          rel="noopener noreferrer"
          className="rv-btn-primary w-full sm:w-auto"
        >
          Cómo llegar
        </a>
        <a
          href={EMPRESA.direccion.ficha}
          target="_blank"
          rel="noopener noreferrer"
          className="rv-btn-glass w-full sm:w-auto"
        >
          Ver en Google Maps
        </a>
      </div>
    </GlassPanel>
  )
}

/* ========================================================================
 * 2. RESENAS DE GOOGLE
 *
 * Se leen de public/resenas.json, que se sirve estatico: se puede actualizar
 * sin recompilar el sitio. El README explica las dos formas de completarlo
 * (pegado manual, o un job que consulte la Places API y reescriba el archivo).
 *
 * Nunca se muestran resenas de ejemplo. Si el archivo esta vacio, la tesela
 * cae en un estado honesto que invita a leerlas en Google.
 * ===================================================================== */
function Estrellas({ puntaje = 5, size = 'h-4 w-4' }) {
  const llenas = Math.round(puntaje)
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${puntaje} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={size}
          fill={i <= llenas ? '#D61922' : 'none'}
          stroke="#D61922"
          strokeWidth="1.6"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m12 3 2.7 5.8 6.3.8-4.6 4.3 1.2 6.3L12 17.9 6.4 20.2l1.2-6.3L3 9.6l6.3-.8Z" />
        </svg>
      ))}
    </span>
  )
}

function inicial(nombre = '') {
  return (nombre.trim()[0] || '?').toUpperCase()
}

/** Contador que sube al entrar en pantalla. Acepta decimales. */
function useContador(valorFinal, activo, { decimales = 0, duracion = 1400 } = {}) {
  const [valor, setValor] = useState(0)

  useEffect(() => {
    if (!activo || valorFinal == null) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValor(valorFinal)
      return
    }
    let frame = 0
    const inicio = performance.now()
    const tick = (ahora) => {
      const t = Math.min(1, (ahora - inicio) / duracion)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      const v = valorFinal * eased
      setValor(decimales ? Number(v.toFixed(decimales)) : Math.round(v))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [valorFinal, activo, decimales, duracion])

  return valor
}

const IconoLocalGuide = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 21s-7-5.2-7-10a7 7 0 1 1 14 0c0 4.8-7 10-7 10Z" />
    <circle cx="12" cy="11" r="2.4" />
  </svg>
)

/** Tarjeta de una resena. Se renderiza dos veces en la cinta, por eso el
 *  atributo aria-hidden se controla desde afuera. */
function TarjetaResena({ resena }) {
  return (
    <figure
      className="rounded-glass p-5 transition-colors duration-300 ease-apple"
      style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-center justify-between gap-3">
        <Estrellas puntaje={resena.puntaje ?? 5} />
        <span className="rv-muted shrink-0 text-[11px]">{resena.fecha}</span>
      </div>

      <blockquote className="text-onglass mt-3.5 text-sm leading-relaxed">{resena.texto}</blockquote>

      <figcaption className="mt-4 flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rv-red
                     font-display text-sm font-bold text-white"
          aria-hidden="true"
        >
          {inicial(resena.autor)}
        </span>
        <span className="min-w-0">
          <span className="text-onglass block truncate font-display text-sm font-semibold">
            {resena.autor}
          </span>
          <span className="rv-muted flex items-center gap-1.5 text-[11px]">
            {resena.localGuide && (
              <span className="inline-flex items-center gap-1 text-rv-red">
                <IconoLocalGuide className="h-3 w-3" />
                Local Guide
              </span>
            )}
            {resena.localGuide && resena.autorMeta && <span aria-hidden="true">·</span>}
            {resena.autorMeta}
          </span>
        </span>
      </figcaption>
    </figure>
  )
}

export function TileResenas({ className = '' }) {
  const [datos, setDatos] = useState(null)
  const [pausado, setPausado] = useState(false)
  const [enVista, setEnVista] = useState(false)
  const [sinMovimiento, setSinMovimiento] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    let vivo = true
    fetch('/resenas.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => vivo && setDatos(json))
      .catch(() => vivo && setDatos(null))
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSinMovimiento(media.matches)
    const onChange = (e) => setSinMovimiento(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([e]) => e.isIntersecting && setEnVista(true), {
      rootMargin: '-10%',
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const resenas = datos?.resenas || []
  const hay = resenas.length > 0
  const perfil = datos?.perfil || EMPRESA.direccion.ficha

  const puntaje = useContador(datos?.puntaje ?? null, enVista, { decimales: 1 })
  const total = useContador(datos?.total ?? null, enVista, { duracion: 1800 })

  return (
    <GlassPanel ref={ref} className={`flex flex-col overflow-hidden p-6 sm:p-7 ${className}`}>
      <p className="rv-eyebrow mb-4">Opiniones en Google</p>

      {/* ---------------- Puntuacion agregada ---------------- */}
      {datos?.puntaje != null && (
        <div
          className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-glass p-4"
          style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
        >
          <p className="font-display text-5xl font-bold leading-none text-rv-red tabular-nums">
            {puntaje.toFixed(1)}
          </p>
          <div>
            <Estrellas puntaje={datos.puntaje} size="h-5 w-5" />
            <p className="rv-muted mt-1.5 text-sm tabular-nums">
              {total.toLocaleString('es-AR')} opiniones
            </p>
          </div>
        </div>
      )}

      {/* ---------------- Cinta de resenas ---------------- */}
      {hay ? (
        <div
          className="relative mt-4 flex-1"
          onMouseEnter={() => setPausado(true)}
          onMouseLeave={() => setPausado(false)}
          onFocusCapture={() => setPausado(true)}
          onBlurCapture={() => setPausado(false)}
        >
          {sinMovimiento ? (
            /* Sin movimiento: lista normal, con scroll propio */
            <ul className="flex max-h-[300px] flex-col gap-3 overflow-y-auto pr-1 sm:max-h-[420px]">
              {resenas.map((r) => (
                <li key={r.autor}>
                  <TarjetaResena resena={r} />
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="h-[300px] overflow-hidden sm:h-[420px]"
              style={{
                maskImage: 'linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 7%, #000 93%, transparent)',
              }}
            >
              <div
                className="flex animate-rv-marquee-y flex-col gap-3"
                style={{ animationPlayState: pausado ? 'paused' : 'running' }}
              >
                {/* La lista va dos veces: al desplazarse media altura el bucle
                    vuelve al punto de partida sin salto visible. */}
                {resenas.map((r) => (
                  <TarjetaResena key={`a-${r.autor}`} resena={r} />
                ))}
                {resenas.map((r) => (
                  <div key={`b-${r.autor}`} aria-hidden="true">
                    <TarjetaResena resena={r} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {!sinMovimiento && (
            <p className="rv-muted pointer-events-none absolute inset-x-0 bottom-0 text-center text-[10px] uppercase tracking-[0.18em]">
              {pausado ? 'En pausa' : 'Pase el cursor para pausar'}
            </p>
          )}
        </div>
      ) : (
        /* Estado sin resenas cargadas: nunca se inventan opiniones */
        <div className="mt-5 flex flex-1 flex-col justify-center gap-4 text-center">
          <span className="mx-auto">
            <Estrellas puntaje={5} size="h-6 w-6" />
          </span>
          <p className="text-onglass font-display text-lg font-semibold">
            Lo que dicen nuestros clientes
          </p>
          <p className="rv-muted mx-auto max-w-xs text-sm leading-relaxed">
            Las opiniones verificadas se publican en nuestra ficha de Google, junto con las fotos del local
            y los horarios actualizados.
          </p>
        </div>
      )}

      <a href={perfil} target="_blank" rel="noopener noreferrer" className="rv-btn-glass mt-5 w-full">
        Ver las {datos?.total ? datos.total.toLocaleString('es-AR') : ''} opiniones en Google
      </a>

      {datos?.actualizado && (
        <p className="rv-muted mt-3 text-center text-[11px]">Actualizado el {datos.actualizado}</p>
      )}
    </GlassPanel>
  )
}

export default TileMapa
