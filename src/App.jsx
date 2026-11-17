import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { SiteContext } from './context/SiteContext.jsx'
import VideoBackground from './components/VideoBackground.jsx'
import PantallaCarga from './components/PantallaCarga.jsx'
import Navbar from './components/Navbar.jsx'
import { TiendaProvider } from './tienda/TiendaContext.jsx'
import { CuentaProvider } from './cuenta/CuentaContext.jsx'
import CarritoDrawer from './tienda/CarritoDrawer.jsx'
import LecturaAgregado from './tienda/LecturaAgregado.jsx'
import BotonWhatsapp from './tienda/BotonWhatsapp.jsx'
import { AvisoDemo } from './tienda/piezas.jsx'

/* Cada pagina es un chunk propio. El inicio arrastra el robot (three, ~1 MB):
   al ser diferido, quien entra directo a un producto no descarga WebGL. */
const Inicio = lazy(() => import('./paginas/Inicio.jsx'))
const Catalogo = lazy(() => import('./paginas/Catalogo.jsx'))
const Producto = lazy(() => import('./paginas/Producto.jsx'))
const Carrito = lazy(() => import('./paginas/Carrito.jsx'))
const Favoritos = lazy(() => import('./paginas/Favoritos.jsx'))
const institucional = (nombre) => lazy(() => import('./paginas/Institucionales.jsx').then((m) => ({ default: m[nombre] })))
const Empresa = institucional('Empresa')
const TecnologiaPagina = institucional('TecnologiaPagina')
const Capacitaciones = institucional('Capacitaciones')
const NoEncontrada = institucional('NoEncontrada')
const Iared = lazy(() => import('./paginas/Iared.jsx'))
const cuenta = (nombre) => lazy(() => import('./paginas/Cuenta.jsx').then((m) => ({ default: m[nombre] })))
const Ingresar = cuenta('Ingresar')
const Activar = cuenta('Activar')
const ActivarCodigo = cuenta('ActivarCodigo')
const Registrarse = cuenta('Registrarse')
const Olvide = cuenta('Olvide')
const Restablecer = cuenta('Restablecer')
const MiCuenta = cuenta('MiCuenta')
const Footer = lazy(() => import('./components/Footer.jsx'))

/* Al cambiar de pagina se vuelve arriba (salvo que la URL traiga un ancla);
   cambiar filtros (?q=, ?marca=) no mueve el scroll. */
function AlCambiarDePagina() {
  const { pathname, hash } = useLocation()
  /* Zona tienda: superficies solidas y video atenuado (ver index.css) */
  useEffect(() => {
    const tienda = /^\/(productos|producto|carrito|favoritos|cuenta)(\/|$)/.test(pathname)
    if (tienda) document.documentElement.dataset.zona = 'tienda'
    else delete document.documentElement.dataset.zona
  }, [pathname])
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

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
  /* El robot solo existe en el inicio. Si la visita entra por otra pagina
     (un producto compartido, un buscador), la compuerta no lo espera. */
  const [entraPorInicio] = useState(() => window.location.pathname === '/')
  const [videoListo, setVideoListo] = useState(false)
  const [robotListo, setRobotListo] = useState(!entraPorInicio)
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
      <CuentaProvider>
        <TiendaProvider>
          <PantallaCarga listo={listo} />
          <AlCambiarDePagina />

          <VideoBackground onListo={marcarVideoListo} />

          <a
            href="#contenido"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-rv-red focus:px-5 focus:py-2.5 focus:text-white"
          >
            Saltar al contenido principal
          </a>

          <Navbar />

          <main id="contenido" className="relative z-10 min-h-[70vh]">
            <Suspense fallback={<div className="min-h-[100svh]" aria-hidden="true" />}>
              <Routes>
                <Route path="/" element={<Inicio onRobotListo={marcarRobotListo} />} />
                <Route path="/productos" element={<Catalogo />} />
                <Route path="/productos/:categoria" element={<Catalogo />} />
                <Route path="/producto/:slug" element={<Producto />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/favoritos" element={<Favoritos />} />
                <Route path="/cuenta" element={<MiCuenta />} />
                <Route path="/cuenta/ingresar" element={<Ingresar />} />
                <Route path="/cuenta/activar" element={<Activar />} />
                <Route path="/cuenta/activar-codigo" element={<ActivarCodigo />} />
                <Route path="/cuenta/registrarse" element={<Registrarse />} />
                <Route path="/cuenta/olvide" element={<Olvide />} />
                <Route path="/cuenta/restablecer" element={<Restablecer />} />
                <Route path="/empresa" element={<Empresa />} />
                {/* Los proyectos los realiza IARED (empresa aparte): la ruta vieja va ahi */}
                <Route path="/iared" element={<Iared />} />
                <Route path="/proyectos" element={<Navigate to="/iared" replace />} />
                <Route path="/tecnologia" element={<TecnologiaPagina />} />
                <Route path="/capacitaciones" element={<Capacitaciones />} />
                <Route path="/contacto" element={<Navigate to="/empresa#ubicacion" replace />} />
                <Route path="*" element={<NoEncontrada />} />
              </Routes>
            </Suspense>
          </main>

          <Suspense fallback={null}>
            <Footer />
          </Suspense>

          <CarritoDrawer />
          <LecturaAgregado />
          <BotonWhatsapp />
          <AvisoDemo />
        </TiendaProvider>
      </CuentaProvider>
    </SiteContext.Provider>
  )
}
