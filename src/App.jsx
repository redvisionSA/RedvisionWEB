import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { SiteContext } from './context/SiteContext.jsx'
import VideoBackground from './components/VideoBackground.jsx'
import IntroCinematica from './components/IntroCinematica.jsx'
import Navbar from './components/Navbar.jsx'
import Hero3D from './components/Hero3D.jsx'

/* Todo lo que esta debajo del Hero se descarga en un chunk aparte. En el
   primer pintado el navegador solo ejecuta la barra, el Hero y el robot; el
   resto llega mientras el visitante lee el titular. */
const BentoCanvas = lazy(() => import('./components/BentoCanvas.jsx'))
const Contacto = lazy(() => import('./components/Contacto.jsx'))
const Footer = lazy(() => import('./components/Footer.jsx'))

const INTRO_KEY = 'rv-intro-vista'

/**
 * El sitio SIEMPRE arranca en clear mode.
 *
 * Decision de marca, no tecnica: la identidad de REDVISION es negro sobre
 * blanco con el rojo institucional, y esa es la primera impresion que tiene
 * que recibir cualquier visitante. Por eso no se lee `prefers-color-scheme`
 * ni se restaura un tema guardado al cargar.
 *
 * El dark mode sigue disponible: el visitante lo activa cuando quiere con el
 * switch de la barra, y dura mientras dure la visita.
 */
const TEMA_INICIAL = 'light'

/** La intro se salta con prefers-reduced-motion y en la segunda carga de la
 *  misma pestana: ver la cinematica en cada recarga cansa y cuesta tiempo. */
function decidirIntro() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    if (window.sessionStorage.getItem(INTRO_KEY)) return false
  } catch (e) {
    /* sessionStorage bloqueado: mostramos la intro igual */
  }
  return true
}

export default function App() {
  const [theme, setTheme] = useState(TEMA_INICIAL)
  const [lens, setLens] = useState(false)
  const [canHover, setCanHover] = useState(true)

  const [conIntro] = useState(decidirIntro)
  /* paginaLista habilita lo caro: el canvas del Hero y la descarga del video.
     Durante la intro el ancho de banda va entero al modelo. */
  const [paginaLista, setPaginaLista] = useState(() => !decidirIntro())

  /* La clase .dark en <html> conmuta TODAS las superficies.
     El rojo #D61922 nunca depende de ella, por eso no se altera. */
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])

  /* Dispositivos tactiles: sin reflejo especular, sin tilt, sin lente */
  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine)')
    setCanHover(media.matches)
    const onChange = (event) => setCanHover(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  /* Bloquea el scroll mientras la intro ocupa la pantalla */
  useEffect(() => {
    if (paginaLista) return
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [paginaLista])

  const alTerminarIntro = useCallback(() => {
    setPaginaLista(true)
    try {
      window.sessionStorage.setItem(INTRO_KEY, '1')
    } catch (e) {
      /* no-op */
    }
  }, [])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const toggleLens = useCallback(() => setLens((l) => !l), [])

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme, lens, toggleLens, canHover }),
    [theme, toggleTheme, lens, toggleLens, canHover]
  )

  return (
    <SiteContext.Provider value={value}>
      {conIntro && <IntroCinematica onFin={alTerminarIntro} />}

      <VideoBackground activo={paginaLista} />

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-rv-red focus:px-5 focus:py-2.5 focus:text-white"
      >
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id="contenido" className="relative z-10">
        {/* El canvas del Hero se monta despues de la intro: nunca hay dos
            contextos WebGL vivos a la vez. */}
        <Hero3D montarRobot={paginaLista} />
        <Suspense fallback={<div className="min-h-[40vh]" aria-hidden="true" />}>
          <BentoCanvas />
          <Contacto />
        </Suspense>
      </main>

      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </SiteContext.Provider>
  )
}
