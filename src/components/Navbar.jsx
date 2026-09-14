import { useCallback, useEffect, useRef, useState } from 'react'
import { useSite } from '../context/SiteContext.jsx'
import GlassPanel from './GlassPanel.jsx'

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'catalogo', label: 'Catálogo' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'capacitaciones', label: 'Capacitaciones' },
  { id: 'contacto', label: 'Contacto' },
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

/* ================================================================== Navbar */
export default function Navbar() {
  const { canHover, isDark } = useSite()
  const [scrolled, setScrolled] = useState(false)
  const [activo, setActivo] = useState('inicio')
  const [menuOpen, setMenuOpen] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const itemsRef = useRef([])

  /* Scroll: estado compacto + barra de progreso de lectura */
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

  /* Seccion activa */
  useEffect(() => {
    const secciones = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean)
    if (!secciones.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActivo(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] }
    )
    secciones.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

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
        node.style.transform = `scale(${(1 + fuerza * 0.22).toFixed(3)}) translateY(${(-fuerza * 3).toFixed(2)}px)`
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
    const onKey = (e) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      {/* Barra de progreso de lectura */}
      <div className="h-[3px] w-full bg-transparent">
        <div
          className="h-full origin-left bg-rv-red transition-transform duration-150 ease-linear"
          style={{ transform: `scaleX(${progreso})` }}
          aria-hidden="true"
        />
      </div>

      <div className="pt-safe mx-auto flex max-w-[1400px] items-start gap-3 px-3 sm:px-5">
        {/* ---------------- Capsula principal ---------------- */}
        <GlassPanel
          as="nav"
          aria-label="Navegación principal"
          variant="chrome"
          className={`pointer-events-auto flex flex-1 items-center gap-3 rounded-pill transition-all duration-400 ease-apple
                      ${scrolled ? 'px-2.5 py-2 sm:px-4' : 'px-3 py-2.5 sm:px-5 sm:py-3'}`}
          style={{ borderRadius: 999 }}
        >
          {/* Logotipo institucional: protagonista */}
          <a
            href="#inicio"
            aria-label="REDVISION - Inicio"
            className="group flex min-w-0 shrink cursor-pointer items-center pl-1 pr-1 sm:pr-2"
          >
            <img
              src={isDark ? '/redvision-logo-dark.png' : '/redvision-logo.png'}
              alt="REDVISION - Tecnología sin límites"
              width="300"
              height="62"
              className={`w-auto max-w-full object-contain transition-all duration-400 ease-apple group-hover:scale-[1.04]
                          ${scrolled ? 'h-7 xs:h-8 sm:h-10' : 'h-8 xs:h-10 sm:h-14'}`}
              loading="eager"
              decoding="async"
            />
          </a>

          {/* Dock de enlaces */}
          <ul
            className="mx-auto hidden items-center gap-1 lg:flex"
            onPointerMove={onDockMove}
            onPointerLeave={onDockLeave}
          >
            {NAV_LINKS.map((link, i) => {
              const esActivo = activo === link.id
              return (
                <li key={link.id}>
                  <a
                    ref={(node) => (itemsRef.current[i] = node)}
                    href={`#${link.id}`}
                    aria-current={esActivo ? 'true' : undefined}
                    className={`relative block cursor-pointer rounded-pill px-4 py-2 font-display text-sm font-medium
                                transition-[color,background-color,transform] duration-200 ease-apple
                                ${esActivo ? 'text-white' : 'text-black/75 hover:text-rv-red dark:text-white/75 dark:hover:text-rv-red'}`}
                    style={esActivo ? { background: '#D61922', boxShadow: '0 8px 22px -10px rgba(214,25,34,0.9)' } : undefined}
                  >
                    {link.label}
                  </a>
                </li>
              )
            })}
          </ul>

          {/* Acciones */}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">
            <LensSwitch />
            <ThemeSwitch />

            <a href="#contacto" className="rv-btn-primary hidden px-5 py-2.5 text-xs xl:inline-flex">
              Cotizar
            </a>

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

        {/* ---------------- Pastilla Dahua ---------------- */}
        <PreHeader className="pointer-events-auto hidden shrink-0 md:flex" />
      </div>

      {/* ---------------- Hoja movil ---------------- */}
      <div
        id="rv-sheet"
        hidden={!menuOpen}
        className="pointer-events-auto mx-3 mt-3 sm:mx-5 lg:hidden"
      >
        <GlassPanel variant="chrome" className="rounded-glass-lg p-4">
          <PreHeader className="mb-4 w-full justify-center md:hidden" />
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-[52px] cursor-pointer items-center rounded-2xl px-4 font-display text-base font-medium
                              transition-colors duration-200
                              ${activo === link.id ? 'text-white' : 'text-black hover:text-rv-red dark:text-white dark:hover:text-rv-red'}`}
                  style={activo === link.id ? { background: '#D61922' } : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#contacto" onClick={() => setMenuOpen(false)} className="rv-btn-primary mt-4 w-full">
            Pedir cotización
          </a>
        </GlassPanel>
      </div>
    </header>
  )
}
