import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { SiteContext } from './context/SiteContext.jsx'
import VideoBackground from './components/VideoBackground.jsx'
import PantallaCarga from './components/PantallaCarga.jsx'
import Navbar from './components/Navbar.jsx'
import Hero3D from './components/Hero3D.jsx'

/* Todo lo que esta debajo del Hero se descarga en un chunk aparte. En el
   primer pintado el navegador solo ejecuta la barra, el Hero y el robot; el
   resto llega mientras el visitante mira la PantallaCarga. */
const BentoCanvas = lazy(() => import('./components/BentoCanvas.jsx'))
const Contacto = lazy(() => import('./components/Contacto.jsx'))
const Footer = lazy(() => import('./components/Footer.jsx'))

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

/* Si todo ya estaba en cache (segunda visita, misma pestana) las tres
   condiciones de carga se cumplen casi al instante: sin este piso minimo la
   PantallaCarga parpadearia un frame y se sentiria como un glitch, no como
   una carga real. */
const ESPERA_MINIMA = 380 // ms
/* Techo de seguridad: una red que se cuelga no debe dejar a nadie mirando el
   loader para siempre. Pasado este tiempo, la pagina se revela igual. */
const TECHO_SEGURIDAD = 7000 // ms

export default function App() {
  const [theme, setTheme] = useState(TEMA_INICIAL)
  const [lens, setLens] = useState(false)
  const [canHover, setCanHover] = useState(true)

  /* Las tres condiciones que tienen que cumplirse JUNTAS antes de destapar la
     pagina. Video y robot arrancan a descargarse en paralelo desde el primer
     render (ver VideoBackground.jsx y RobotDahua.jsx): lo que antes generaba
     el render disparejo era mostrar la pagina antes de que ambos estuvieran
     listos, no la descarga en si. */
  const [videoListo, setVideoListo] = useState(false)
  const [robotListo, setRobotListo] = useState(false)
  const [fuentesListas, setFuentesListas] = useState(false)
  const [tiempoMinimoCumplido, setTiempoMinimoCumplido] = useState(false)

  const marcarVideoListo = useCallback(() => setVideoListo(true), [])
  const marcarRobotListo = useCallback(() => setRobotListo(true), [])

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

  /* Fuentes tipograficas: sin esperarlas, el desvanecido del loader revelaria
     un fallback del sistema que salta a Lexend/Source Sans un instante
     despues -el mismo tipo de sacudida que esta pantalla existe para evitar. */
  useEffect(() => {
    if (!document.fonts) {
      setFuentesListas(true)
      return undefined
    }
    let vivo = true
    document.fonts.ready
      .then(() => vivo && setFuentesListas(true))
      .catch(() => vivo && setFuentesListas(true))
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => setTiempoMinimoCumplido(true), ESPERA_MINIMA)
    return () => window.clearTimeout(id)
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      setVideoListo(true)
      setRobotListo(true)
      setFuentesListas(true)
    }, TECHO_SEGURIDAD)
    return () => window.clearTimeout(id)
  }, [])

  const listo = videoListo && robotListo && fuentesListas && tiempoMinimoCumplido

  /* Bloquea el scroll mientras la PantallaCarga tapa la pagina */
  useEffect(() => {
    if (listo) return undefined
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previo
    }
  }, [listo])

  const toggleTheme = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])
  const toggleLens = useCallback(() => setLens((l) => !l), [])

  const value = useMemo(
    () => ({ theme, isDark: theme === 'dark', toggleTheme, lens, toggleLens, canHover }),
    [theme, toggleTheme, lens, toggleLens, canHover]
  )

  return (
    <SiteContext.Provider value={value}>
      <PantallaCarga listo={listo} />

      <VideoBackground onListo={marcarVideoListo} />

      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-rv-red focus:px-5 focus:py-2.5 focus:text-white"
      >
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id="contenido" className="relative z-10">
        <Hero3D onRobotListo={marcarRobotListo} />
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
