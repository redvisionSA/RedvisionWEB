import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSite } from '../context/SiteContext.jsx'
import GlassPanel from './GlassPanel.jsx'
import Buscador from '../tienda/Buscador.jsx'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { LINEAS } from '../tienda/lineas.js'
import { IconoCarrito, IconoCorazon, IconoWhatsapp } from '../tienda/Iconos.jsx'
import EMPRESA from '../datos/empresa.js'

/* Pestañas institucionales: cada una es una pagina propia. La tienda es el
   centro del sitio; lo institucional queda a un clic y tambien resumido en
   el inicio. */
const SECCIONES = [
  { to: '/empresa', label: 'Empresa' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/tecnologia', label: 'Tecnología' },
  { to: '/capacitaciones', label: 'Capacitación' },
  { to: '/contacto', label: 'Contacto' },
]


const RADIO_IMAN = 110 // px: alcance de la magnificacion tipo dock

/* ------------------------------------------------------------------ iconos */
const svg = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

const SunIcon = (p) => (
  <svg {...svg} {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M2 12h2m16 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
  </svg>
)

const MoonIcon = (p) => (
  <svg {...svg} {...p}>
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
  </svg>
)

const LensIcon = (p) => (
  <svg {...svg} {...p}>
    <circle cx="12" cy="12" r="7.5" />
    <circle cx="12" cy="12" r="2.2" />
    <path d="M12 1.5v3m0 15v3M1.5 12h3m15 0h3" />
  </svg>
)

const MenuIcon = (p) => (
  <svg {...svg} strokeWidth="2" {...p}>
    <path d="M4 8h16M4 16h16" />
  </svg>
)

const CloseIcon = (p) => (
  <svg {...svg} strokeWidth="2" {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

/* ============================================================== PreHeader */
/**
 * Pastilla institucional "Powered by Dahua".
 *
 * Se usa una sola version del logotipo: la oficial, con el wordmark negro.
 * Como ese negro desaparece sobre una superficie oscura, el logotipo viaja
 * dentro de un chip blanco (.rv-chip-marca) que lo mantiene identico en clear
 * mode y en dark mode, sin alterar los colores de la marca.
 */
export function PreHeader({ className = '' }) {
  return (
    <div
      className={`glass-chrome flex h-12 items-center gap-2.5 rounded-pill px-3.5 ${className}`}
      style={{ borderRadius: 999 }}
    >
      <span className="h-1.5 w-1.5 shrink-0 animate-rv-breathe rounded-full bg-rv-red" aria-hidden="true" />
      <span className="whitespace-nowrap font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-black/75 dark:text-white/80">
        Powered by
      </span>
      <span className="rv-chip-marca px-2.5 py-1.5">
        <img
          src="/dahua-logo.png"
          alt="Dahua Technology"
          width="294"
          height="88"
          className="h-[26px] w-auto object-contain"
          loading="eager"
          decoding="async"
        />
      </span>
    </div>
  )
}

/* ============================================================ ThemeSwitch */
export function ThemeSwitch({ className = '' }) {
  const { isDark, toggleTheme } = useSite()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      className={`inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-pill
                  text-black transition-all duration-300 ease-apple hover:text-rv-red active:scale-90
                  dark:text-white dark:hover:text-rv-red ${className}`}
      style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
    >
      <span className="relative block h-5 w-5">
        <SunIcon
          className={`absolute inset-0 h-5 w-5 transition-all duration-400 ease-apple ${
            isDark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
          }`}
        />
        <MoonIcon
          className={`absolute inset-0 h-5 w-5 transition-all duration-400 ease-apple ${
            isDark ? 'rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
          }`}
        />
      </span>
    </button>
  )
}

/* ============================================================= LensSwitch */
/** Activa el "modo vigilancia": una lente circular revela el video sin velo. */
export function LensSwitch({ className = '' }) {
  const { lens, toggleLens, canHover } = useSite()
  if (!canHover) return null

  return (
    <button
      type="button"
      onClick={toggleLens}
      role="switch"
      aria-checked={lens}
      aria-label="Modo vigilancia: lente que revela el video de fondo"
      title="Modo vigilancia"
      className={`inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-pill
                  transition-all duration-300 ease-apple active:scale-90
                  ${lens ? 'text-white' : 'text-black hover:text-rv-red dark:text-white dark:hover:text-rv-red'} ${className}`}
      style={{
        background: lens ? '#D61922' : 'var(--glass-bg-thin)',
        border: `1px solid ${lens ? '#D61922' : 'var(--glass-border)'}`,
      }}
    >
      <LensIcon className={`h-5 w-5 ${lens ? 'animate-rv-breathe' : ''}`} />
    </button>
  )
}


/* ============================================================ Carrito */
function BotonCarrito() {
  const { resumen, setCarritoAbierto, ultimoAgregado } = useTienda()
  const [latido, setLatido] = useState(false)

  /* Pulso breve en cada agregado: confirma la accion donde el ojo la busca */
  useEffect(() => {
    if (!ultimoAgregado) return undefined
    setLatido(true)
    const id = window.setTimeout(() => setLatido(false), 650)
    return () => window.clearTimeout(id)
  }, [ultimoAgregado])

  return (
    <button
      type="button"
      onClick={() => setCarritoAbierto(true)}
      aria-label={`Abrir carrito (${resumen.unidades} ${resumen.unidades === 1 ? 'unidad' : 'unidades'})`}
      className={`relative inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-white
                  transition-transform duration-300 ease-apple active:scale-90 ${latido ? 'scale-110' : ''}`}
      style={{ background: '#D61922', boxShadow: '0 8px 22px -10px rgba(214,25,34,0.9)' }}
    >
      <IconoCarrito className="h-5 w-5" />
      {resumen.unidades > 0 && (
        <span className="num absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-black px-1 text-[11px] font-bold text-white ring-2 ring-white dark:bg-white dark:text-black dark:ring-black">
          {resumen.unidades > 99 ? '99+' : resumen.unidades}
        </span>
      )}
    </button>
  )
}

function BotonFavoritos({ className = '' }) {
  const { favoritos } = useTienda()
  return (
    <Link
      to="/favoritos"
      aria-label={`Favoritos (${favoritos.length})`}
      title="Favoritos"
      className={`relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-black transition-all duration-300 ease-apple hover:text-rv-red active:scale-90 dark:text-white ${className}`}
      style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
    >
      <IconoCorazon className="h-5 w-5" lleno={favoritos.length > 0} />
    </Link>
  )
}

/* ========================================================= Mega menu */
function MenuProductos({ abierto, onCerrar }) {
  if (!abierto) return null
  return (
    <GlassPanel
      variant="chrome"
      className="pointer-events-auto absolute left-0 right-0 top-full mt-2 rounded-glass p-4"
      onMouseLeave={onCerrar}
    >
      <ul className="grid grid-cols-3 gap-2">
        {LINEAS.map((l) => (
          <li key={l.id}>
            <Link
              to={`/productos/${l.id}`}
              onClick={onCerrar}
              className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-black/[0.05] dark:hover:bg-white/10"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-black text-white transition-colors group-hover:bg-rv-red dark:bg-white dark:text-black dark:group-hover:bg-rv-red dark:group-hover:text-white">
                <l.Icono className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-display text-sm font-semibold text-black group-hover:text-rv-red dark:text-white">{l.titulo}</span>
                <span className="rv-muted block text-xs leading-snug">{l.resumen}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t rv-hairline px-2 pt-3">
        <p className="rv-muted text-xs">¿Es instalador o empresa? Consulte por la lista mayorista.</p>
        <Link to="/productos" onClick={onCerrar} className="rv-btn-primary px-5 py-2 text-xs">
          Ver todos los productos
        </Link>
      </div>
    </GlassPanel>
  )
}

/* ================================================================== Navbar */
const claseEnlace = ({ isActive }) =>
  `relative block cursor-pointer rounded-pill px-3.5 py-1.5 font-display text-[13px] font-medium
   transition-[color,background-color,transform] duration-200 ease-apple
   ${isActive ? 'bg-rv-red text-white shadow-[0_8px_22px_-10px_rgba(214,25,34,0.9)]' : 'text-black/75 hover:text-rv-red dark:text-white/75 dark:hover:text-rv-red'}`

export default function Navbar() {
  const { canHover, isDark } = useSite()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const itemsRef = useRef([])

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 12)
      const alto = document.documentElement.scrollHeight - window.innerHeight
      setProgreso(alto > 0 ? Math.min(1, y / alto) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setMegaOpen(false)
  }, [location.pathname, location.search])

  /* Magnificacion tipo dock de macOS */
  const onDockMove = useCallback(
    (event) => {
      if (!canHover) return
      itemsRef.current.forEach((node) => {
        if (!node) return
        const rect = node.getBoundingClientRect()
        const centro = rect.left + rect.width / 2
        const distancia = Math.abs(event.clientX - centro)
        const fuerza = Math.max(0, 1 - distancia / RADIO_IMAN)
        node.style.transform = `scale(${(1 + fuerza * 0.16).toFixed(3)}) translateY(${(-fuerza * 2).toFixed(2)}px)`
      })
    },
    [canHover]
  )

  const onDockLeave = useCallback(() => {
    itemsRef.current.forEach((node) => {
      if (node) node.style.transform = ''
    })
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMegaOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const enTienda = location.pathname.startsWith('/producto')

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="h-[3px] w-full bg-transparent">
        <div
          className="h-full origin-left bg-rv-red transition-transform duration-150 ease-linear"
          style={{ transform: `scaleX(${progreso})` }}
          aria-hidden="true"
        />
      </div>

      <div className="pt-safe mx-auto flex max-w-[1400px] items-start gap-3 px-3 sm:px-5">
        <div className="relative flex min-w-0 flex-1 flex-col gap-2">
          {/* ---------------- Capsula principal ---------------- */}
          <GlassPanel
            as="nav"
            aria-label="Navegación principal"
            variant="chrome"
            className={`pointer-events-auto flex items-center gap-2 rounded-pill transition-all duration-400 ease-apple sm:gap-3
                        ${scrolled ? 'px-2.5 py-2 sm:px-4' : 'px-3 py-2.5 sm:px-5 sm:py-3'}`}
            style={{ borderRadius: 999 }}
          >
            <Link to="/" aria-label="REDVISION - Inicio" className="group flex min-w-0 shrink-0 cursor-pointer items-center pl-1 pr-1 sm:pr-2">
              <img
                src={isDark ? '/redvision-logo-dark.png' : '/redvision-logo.png'}
                alt="REDVISION - Tecnología sin límites"
                width="300"
                height="62"
                className={`w-auto max-w-[108px] object-contain xs:max-w-[150px] transition-all duration-400 ease-apple group-hover:scale-[1.04] sm:max-w-none
                            ${scrolled ? 'h-7 sm:h-9' : 'h-8 sm:h-11 lg:h-12'}`}
                loading="eager"
                decoding="async"
              />
            </Link>

            <Buscador atajo className="mx-auto hidden w-full max-w-xl md:block" />

            <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2 md:ml-0">
              <LensSwitch className="hidden xl:inline-flex" />
              <ThemeSwitch />
              <BotonFavoritos className="hidden sm:inline-flex" />
              <BotonCarrito />
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-controls="rv-sheet"
                aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-pill text-black
                           transition-all duration-300 ease-apple hover:text-rv-red active:scale-90 dark:text-white lg:hidden"
                style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
              >
                {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
              </button>
            </div>
          </GlassPanel>

          {/* ---------------- Segunda fila: departamentos e institucional (escritorio) ---------------- */}
          <div
            className={`pointer-events-auto relative hidden transition-all duration-400 ease-apple lg:block ${
              scrolled ? 'pointer-events-none -translate-y-2 opacity-0' : 'opacity-100'
            }`}
            aria-hidden={scrolled}
          >
            <GlassPanel variant="chrome" className="flex items-center gap-2 rounded-pill px-2 py-1.5" style={{ borderRadius: 999 }}>
              <button
                type="button"
                onClick={() => setMegaOpen((v) => !v)}
                onMouseEnter={() => canHover && setMegaOpen(true)}
                aria-expanded={megaOpen}
                tabIndex={scrolled ? -1 : 0}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-pill px-4 py-1.5 font-display text-[13px] font-semibold transition-colors
                            ${megaOpen || enTienda ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-black hover:text-rv-red dark:text-white'}`}
              >
                <MenuIcon className="h-4 w-4" />
                Productos
              </button>

              <ul className="flex items-center gap-0.5" onPointerMove={onDockMove} onPointerLeave={onDockLeave}>
                {SECCIONES.map((s, i) => (
                  <li key={s.to}>
                    <NavLink ref={(node) => (itemsRef.current[i] = node)} to={s.to} className={claseEnlace} tabIndex={scrolled ? -1 : 0}>
                      {s.label}
                    </NavLink>
                  </li>
                ))}
              </ul>

              <p className="rv-muted ml-auto hidden items-center gap-2 pr-3 text-[12px] xl:flex">
                <span className="h-1.5 w-1.5 animate-rv-breathe rounded-full bg-rv-red" aria-hidden="true" />
                Envíos a todo el país · Retiro en el local · Asesoramiento técnico sin cargo
              </p>
            </GlassPanel>
            <MenuProductos abierto={megaOpen && !scrolled} onCerrar={() => setMegaOpen(false)} />
          </div>

          {/* ---------------- Buscador en telefono ---------------- */}
          <div
            className={`pointer-events-auto transition-all duration-400 ease-apple md:hidden ${
              scrolled ? 'pointer-events-none -translate-y-2 opacity-0' : 'opacity-100'
            }`}
          >
            <Buscador />
          </div>
        </div>

        <PreHeader className="pointer-events-auto hidden shrink-0 2xl:flex" />
      </div>

      {/* ---------------- Hoja movil ---------------- */}
      <div id="rv-sheet" hidden={!menuOpen} className="pointer-events-auto mx-3 mt-2 sm:mx-5 lg:hidden">
        <GlassPanel variant="chrome" className="max-h-[calc(100svh-120px)] overflow-y-auto rounded-glass-lg p-4">
          <p className="rv-eyebrow mb-2 px-2">Productos</p>
          <ul className="grid grid-cols-2 gap-1.5">
            {LINEAS.map((l) => (
              <li key={l.id}>
                <Link
                  to={`/productos/${l.id}`}
                  className="flex min-h-[52px] items-center gap-2.5 rounded-2xl px-3 font-display text-sm font-medium text-black hover:text-rv-red dark:text-white"
                  style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
                >
                  <l.Icono className="h-5 w-5 shrink-0" />
                  <span className="leading-tight">{l.titulo}</span>
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/productos" className="rv-btn-primary mt-3 w-full">
            Ver todos los productos
          </Link>

          <p className="rv-eyebrow mb-2 mt-5 px-2">REDVISION</p>
          <ul className="flex flex-col gap-1">
            {[{ to: '/favoritos', label: 'Mis favoritos' }, ...SECCIONES].map((s) => (
              <li key={s.to}>
                <NavLink
                  to={s.to}
                  className={({ isActive }) =>
                    `flex min-h-[48px] items-center rounded-2xl px-4 font-display text-base font-medium transition-colors
                     ${isActive ? 'bg-rv-red text-white' : 'text-black hover:text-rv-red dark:text-white'}`
                  }
                >
                  {s.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <a href={EMPRESA.telefono.whatsapp} target="_blank" rel="noopener noreferrer" className="rv-btn-glass mt-4 w-full">
            <IconoWhatsapp className="h-4 w-4" />
            Hablar con un asesor
          </a>
          <PreHeader className="mt-4 w-full justify-center" />
        </GlassPanel>
      </div>
    </header>
  )
}
