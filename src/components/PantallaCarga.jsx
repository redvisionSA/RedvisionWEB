import { useEffect, useState } from 'react'

/**
 * PantallaCarga
 * -----------------------------------------------------------------------
 * Reemplaza a la vieja IntroCinematica.
 *
 * Antes la pagina montaba en dos tiempos: primero un canvas de intro con su
 * propio robot y su propio zoom de camara, y RECIEN cuando esa animacion
 * terminaba se montaban el video de fondo y el canvas real del Hero. Ese
 * "recien" es lo que se sentia como tirones: dos descargas pesadas (el GLB
 * del robot y el video) empezaban en momentos distintos, y el robot
 * definitivo aparecia encima de una pagina que ya llevaba un rato quieta.
 *
 * Ahora el video y el robot arrancan a descargarse JUNTOS, desde el primer
 * render, mientras esta pantalla los tapa. `listo` (que decide App.jsx) solo
 * se vuelve true cuando las tres condiciones de abajo se cumplen a la vez, asi
 * que lo que se revela al desvanecerse este overlay es la pagina COMPLETA y
 * estable, nunca una pagina construyendose en vivo delante del visitante:
 *
 *   - el video de fondo tiene el primer cuadro listo para reproducirse
 *   - el modelo 3D del robot esta cargado y montado
 *   - las fuentes tipograficas terminaron de aplicarse (evita el salto de
 *     layout de un fallback del sistema a Lexend/Source Sans)
 *
 * El "carrusel" es la lista de mensajes de abajo: no hay una barra de
 * progreso inventada -séria mentir- pero rotar el mensaje comunica que algo
 * sigue en curso, no que la pagina esta trabada.
 */

const MENSAJES = [
  'Cargando el video institucional',
  'Inicializando el robot 3D',
  'Afinando el material Liquid Glass',
  'Optimizando la experiencia',
]

const ROTACION_MENSAJE = 1500 // ms
const DURACION_SALIDA = 480 // ms

export default function PantallaCarga({ listo }) {
  const [indice, setIndice] = useState(0)
  const [saliendo, setSaliendo] = useState(false)
  const [oculto, setOculto] = useState(false)

  /* Carrusel de mensajes: solo mientras se sigue esperando */
  useEffect(() => {
    if (listo) return undefined
    const id = window.setInterval(() => setIndice((i) => (i + 1) % MENSAJES.length), ROTACION_MENSAJE)
    return () => window.clearInterval(id)
  }, [listo])

  useEffect(() => {
    if (!listo) return undefined
    setSaliendo(true)
    const id = window.setTimeout(() => setOculto(true), DURACION_SALIDA)
    return () => window.clearTimeout(id)
  }, [listo])

  if (oculto) return null

  return (
    <div
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-7 bg-white transition-opacity ease-apple dark:bg-black"
      style={{
        opacity: saliendo ? 0 : 1,
        pointerEvents: saliendo ? 'none' : 'auto',
        transitionDuration: `${DURACION_SALIDA}ms`,
      }}
      role="status"
      aria-live="polite"
      aria-label="Cargando el sitio de REDVISION"
    >
      {/* Vineta grafito de marca, coherente con el resto del sitio */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 45%, rgba(10,10,14,0.08), transparent 62%), radial-gradient(60% 45% at 100% 0%, rgba(214,25,34,0.08), transparent 62%)',
        }}
      />

      <img
        src="/redvision-logo.png"
        alt="REDVISION"
        width="300"
        height="62"
        className="h-11 w-auto object-contain dark:hidden sm:h-14"
        decoding="async"
      />
      <img
        src="/redvision-logo-dark.png"
        alt="REDVISION"
        width="300"
        height="62"
        className="hidden h-11 w-auto object-contain dark:block sm:h-14"
        decoding="async"
      />

      {/* Anillo de carga: gira mientras se espera, un check al terminar */}
      <span className="relative flex h-11 w-11 items-center justify-center">
        <span
          className="absolute inset-0 rounded-full border-2 border-black/10 dark:border-white/15"
          aria-hidden="true"
        />
        <span
          className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-rv-red"
          style={{ animationDuration: '900ms', opacity: saliendo ? 0 : 1, transition: 'opacity 200ms ease' }}
          aria-hidden="true"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="#d61922"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 transition-opacity duration-200 ease-apple"
          style={{ opacity: saliendo ? 1 : 0 }}
          aria-hidden="true"
        >
          <path d="m4 12 5 5L20 6" />
        </svg>
      </span>

      {/* Carrusel de mensajes: uno visible a la vez, se desvanece entre sí */}
      <div className="relative h-4 overflow-hidden px-6 text-center">
        {MENSAJES.map((mensaje, i) => (
          <p
            key={mensaje}
            className="absolute inset-x-0 font-display text-[10px] uppercase tracking-[0.28em] text-black/60 transition-opacity duration-300 ease-apple dark:text-white/60"
            style={{ opacity: i === indice && !saliendo ? 1 : 0 }}
            aria-hidden={i !== indice}
          >
            {mensaje}
          </p>
        ))}
        <p
          className="absolute inset-x-0 font-display text-[10px] uppercase tracking-[0.28em] text-black/60 transition-opacity duration-300 ease-apple dark:text-white/60"
          style={{ opacity: saliendo ? 1 : 0 }}
        >
          Listo
        </p>
      </div>
    </div>
  )
}
