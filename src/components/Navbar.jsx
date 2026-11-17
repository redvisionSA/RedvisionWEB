import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSite } from '../context/SiteContext.jsx'
import GlassPanel from './GlassPanel.jsx'
import Buscador from '../tienda/Buscador.jsx'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { enlaceCategoria } from '../tienda/categorias.js'
import { EN_LA_BARRA } from '../datos/categorias.js'
import { IconoCarrito, IconoCorazon, IconoUsuario, IconoWhatsapp } from '../tienda/Iconos.jsx'
import { useCuenta } from '../cuenta/CuentaContext.jsx'
import { LogoMarca } from '../tienda/piezas.jsx'
import EMPRESA from '../datos/empresa.js'

/* Pestañas institucionales: cada una es una pagina propia. La tienda es el
   centro del sitio; lo institucional queda a un clic y tambien resumido en
   el inicio. */
const SECCIONES = [
  { to: '/empresa', label: 'Empresa' },
  { to: '/proyectos', label: 'Proyectos' },
  { to: '/tecnologia', label: 'Tecnología' },
  { to: '/capacitaciones', label: 'Capacitación' },
]



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
 * Sello "Distribuidor oficial Dahua".
 *
 * Logotipo oficial de Dahua Technology (public/dahua-logo.png) sin alterar
 * colores ni proporciones. Como el wordmark es negro y rojo, viaja siempre
 * dentro de un chip blanco (.rv-chip-marca): se lee igual en clear y en dark.
 *
 *   variante 'chrome'  pastilla de vidrio de la barra
 *   variante 'solido'  superficie blanca plena (tienda, fichas)
 */
export function PreHeader({ className = '', variante = 'chrome', compacto = false }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-pill ${compacto ? 'h-10 px-2.5' : 'h-12 px-3.5'} ${
        variante === 'solido' ? 'rv-solido !rounded-full' : 'glass-chrome'
      } ${className}`}
      style={{ borderRadius: 999 }}
      title="REDVISION es distribuidor oficial de Dahua Technology"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 shrink-0 text-rv-red" aria-hidden="true">
        <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8 7.5 9.5 4.4-1.5 7.5-5.1 7.5-9.5V6Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <span className="whitespace-nowrap font-display text-[10px] font-bold uppercase leading-tight tracking-[0.16em] text-black/80 dark:text-white/85">
        Distribuidor
        <br />
        oficial
      </span>
      <span className={`rv-chip-marca ${compacto ? 'px-2 py-1' : 'px-2.5 py-1.5'}`}>
        <img
          src="/dahua-logo.png"
          alt="Dahua Technology"
          width="294"
          height="88"
          className={`${compacto ? 'h-[20px]' : 'h-[24px]'} w-auto object-contain`}
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
      style={{ background: '#0b0b0d', border: '1px solid rgba(255,255,255,0.15)' }}
    >
      <IconoCarrito className="h-5 w-5" />
      {resumen.unidades > 0 && (
        <span className="num absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-pill bg-rv-red px-1 text-[11px] font-bold text-white ring-2 ring-white dark:ring-black">
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

/* ============================================================ Cuenta */
/* Cliente con sesion: su nombre (desde xl) y acceso a «Mi cuenta». Sin
   sesion: «Ingresar». En telefono angosto (< xs) vive solo en la hoja del menu. */
function BotonCuenta({ className = '' }) {
  const { cuenta } = useCuenta()
  const { pathname } = useLocation()
  const activo = pathname.startsWith('/cuenta')
  return (
    <Link
      to={cuenta ? '/cuenta' : '/cuenta/ingresar'}
      aria-label={cuenta ? `Mi cuenta: ${cuenta.name}` : 'Ingresar a mi cuenta'}
      title={cuenta ? cuenta.name : 'Ingresar'}
      aria-current={activo ? 'page' : undefined}
      className={`relative h-11 min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-pill px-2.5 font-display text-[13px] font-semibold transition-all duration-300 ease-apple hover:text-rv-red active:scale-95
                  ${activo ? 'text-rv-red' : 'text-black dark:text-white'} ${className}`}
      style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
    >
      <IconoUsuario className="h-5 w-5 shrink-0" />
      {cuenta ? (
        <>
          <span className="hidden max-w-[130px] truncate xl:inline">{cuenta.name}</span>
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rv-red ring-2 ring-white dark:ring-black xl:hidden" aria-hidden="true" />
        </>
      ) : (
        <span className="hidden pr-1 xl:inline">Ingresar</span>
      )}
    </Link>
  )
}

/* ========================================================= Mega menu */
function MarcasMenu({ onCerrar }) {
  const { catalogo } = useTienda()
  const marcas = catalogo.datos.marcas.filter((m) => m.identidad)
  if (!marcas.length) return null
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t rv-hairline px-2 pt-3">
      <span className="rv-eyebrow mr-2">Marcas</span>
      {marcas.map((m) => (
        <Link
          key={m.slug}
          to={`/productos?marca=${encodeURIComponent(m.slug)}`}
          onClick={onCerrar}
          className="inline-flex h-10 items-center rounded-xl bg-white px-3 ring-1 ring-black/10 transition-shadow hover:ring-2"
          style={m.identidad.color ? { '--tw-ring-color': m.identidad.color } : undefined}
        >
          <LogoMarca marca={m} alto={16} />
        </Link>
      ))}
    </div>
  )
}

/* Categorias del ERP (orden en src/datos/categorias.js): cada raiz con sus
   primeras hijas; el resto, en la pagina de la categoria */
const HIJAS_EN_MENU = 5
const opcionMenu =
  'flex min-h-[34px] items-center rounded-lg px-2 transition-colors hover:bg-black/[0.05] hover:text-rv-red dark:hover:bg-white/10 [@media(pointer:coarse)]:min-h-[44px]'

function MenuProductos({ abierto, onCerrar }) {
  const { catalogo } = useTienda()
  const raices = catalogo.datos.categorias.raices
  if (!abierto) return null
  return (
    /* Superficie solida (como la tienda): con tantas opciones, el vidrio dejaba pasar el contenido de abajo */
    <div
      id="rv-menu-categorias"
      className="rv-solido pointer-events-auto absolute left-0 right-0 top-full mt-2 max-h-[calc(100svh-120px)] overflow-y-auto overscroll-contain p-4"
      onMouseLeave={onCerrar}
    >
      <ul className="columns-4 gap-6 xl:columns-5">
        {raices.map((r) => (
          <li key={r.slug} className="break-inside-avoid pb-3">
            <Link to={enlaceCategoria(r.slug)} onClick={onCerrar} className={`${opcionMenu} font-display text-sm font-semibold text-black dark:text-white`}>
              {r.nombre}
            </Link>
            {r.hijos.length > 0 && (
              <ul>
                {r.hijos.slice(0, HIJAS_EN_MENU).map((h) => (
                  <li key={h.slug}>
                    <Link to={enlaceCategoria(h.slug)} onClick={onCerrar} className={`${opcionMenu} rv-muted text-[13px]`}>
                      {h.nombre}
                    </Link>
                  </li>
                ))}
                {r.hijos.length > HIJAS_EN_MENU && (
                  <li>
                    <Link to={enlaceCategoria(r.slug)} onClick={onCerrar} className={`${opcionMenu} text-[13px] font-semibold text-black underline underline-offset-2 dark:text-white`}>
                      Ver las {r.hijos.length} de {r.nombre}
                    </Link>
                  </li>
                )}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <MarcasMenu onCerrar={onCerrar} />
      <div className="mt-3 flex items-center justify-between border-t rv-hairline px-2 pt-3">
        <p className="rv-muted text-xs">¿Es instalador o empresa? Consulte por la lista mayorista.</p>
        <Link to="/productos" onClick={onCerrar} className="rv-btn-primary px-5 py-2 text-xs">
          Ver todos los productos
        </Link>
      </div>
    </div>
  )
}

/* ================================================================== Navbar */
const Chevron = ({ abierto, className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`h-3.5 w-3.5 transition-transform duration-200 ${abierto ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const IconoLupa = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true" {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
)

const botonRedondo =
  'inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-pill text-black transition-all duration-300 ease-apple hover:text-rv-red active:scale-90 dark:text-white'
const fondoBoton = { background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }

/* Menu desplegable simple (Empresa): se abre con clic o, con cursor, al pasar */
function MenuEmpresa({ abierto, setAbierto, canHover }) {
  const { pathname } = useLocation()
  const activo = SECCIONES.some((s) => pathname.startsWith(s.to))
  return (
    <div className="relative" onMouseEnter={() => canHover && setAbierto(true)} onMouseLeave={() => canHover && setAbierto(false)}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-haspopup="true"
        className={`inline-flex h-11 items-center gap-1.5 rounded-pill px-3.5 font-display text-[13px] font-semibold transition-colors
                    ${activo ? 'text-rv-red' : 'text-black/80 hover:text-rv-red dark:text-white/85'}`}
      >
        Empresa
        <Chevron abierto={abierto} />
      </button>
      {abierto && (
        <div className="absolute left-0 top-full pt-2">
          <GlassPanel variant="chrome" className="w-56 rounded-3xl p-2">
            <ul className="flex flex-col">
              {SECCIONES.map((s) => (
                <li key={s.to}>
                  <NavLink
                    to={s.to}
                    onClick={() => setAbierto(false)}
                    className={({ isActive }) =>
                      `flex min-h-[44px] items-center rounded-2xl px-3.5 font-display text-sm font-medium transition-colors
                       ${isActive ? 'bg-rv-red text-white' : 'text-black hover:bg-black/[0.05] hover:text-rv-red dark:text-white dark:hover:bg-white/10'}`
                    }
                  >
                    {s.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </div>
      )}
    </div>
  )
}

export default function Navbar() {
  const { canHover, isDark } = useSite()
  const { cuenta } = useCuenta()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [empresaOpen, setEmpresaOpen] = useState(false)
  const [buscarOpen, setBuscarOpen] = useState(false)
  const [progreso, setProgreso] = useState(0)

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
    setEmpresaOpen(false)
    setBuscarOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setMegaOpen(false)
        setEmpresaOpen(false)
        setBuscarOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const enTienda = location.pathname.startsWith('/producto')
  const { catalogo } = useTienda()
  const raicesMenu = catalogo.datos.categorias.raices

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="h-[3px] w-full bg-transparent">
        <div
          className="h-full origin-left bg-rv-red transition-transform duration-150 ease-linear"
          style={{ transform: `scaleX(${progreso})` }}
          aria-hidden="true"
        />
      </div>

      <div className="pt-safe relative mx-auto max-w-[1400px] px-3 sm:px-5">
        {/* ---------------- Una sola barra con todo ---------------- */}
        <GlassPanel
          as="nav"
          aria-label="Navegación principal"
          variant="chrome"
          className={`pointer-events-auto flex items-center gap-1.5 rounded-pill transition-all duration-400 ease-apple sm:gap-2
                      ${scrolled ? 'px-2.5 py-1.5 sm:px-3' : 'px-3 py-2 sm:px-4'}`}
          style={{ borderRadius: 999 }}
        >
          <Link to="/" aria-label="REDVISION - Inicio" className="group flex shrink-0 items-center pl-1 pr-1">
            <img
              src={isDark ? '/redvision-logo-dark.png' : '/redvision-logo.png'}
              alt="REDVISION - Tecnología sin límites"
              width="300"
              height="62"
              className={`w-auto max-w-[118px] object-contain transition-all duration-400 ease-apple group-hover:scale-[1.04] xs:max-w-[150px] lg:max-w-[180px]
                          ${scrolled ? 'h-7 sm:h-8' : 'h-8 sm:h-10'}`}
              loading="eager"
              decoding="async"
            />
          </Link>

          {/* Productos: clic va al catalogo; la flecha (o el cursor) abre categorias y marcas */}
          <div
            className="hidden shrink-0 items-center lg:flex"
            onMouseEnter={() => canHover && setMegaOpen(true)}
          >
            <Link
              to="/productos"
              aria-current={enTienda ? 'page' : undefined}
              className={`inline-flex h-11 items-center gap-2 rounded-l-pill pl-4 pr-2 font-display text-[13px] font-semibold text-white transition-colors
                          ${enTienda ? 'bg-black dark:bg-white dark:text-black' : 'bg-rv-red hover:bg-rv-red-press'}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-[18px] w-[18px]" aria-hidden="true">
                <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />
              </svg>
              Productos
            </Link>
            <button
              type="button"
              onClick={() => setMegaOpen((v) => !v)}
              aria-expanded={megaOpen}
              aria-controls="rv-menu-categorias"
              aria-label="Ver categorías y marcas"
              className={`inline-flex h-11 items-center rounded-r-pill border-l border-white/25 pl-2 pr-3 text-white transition-colors
                          ${enTienda ? 'bg-black dark:bg-white dark:text-black' : 'bg-rv-red hover:bg-rv-red-press'}`}
            >
              <Chevron abierto={megaOpen} />
            </button>
          </div>

          <div className="hidden lg:block">
            <MenuEmpresa abierto={empresaOpen} setAbierto={setEmpresaOpen} canHover={canHover} />
          </div>

          <Buscador atajo className="mx-1 hidden min-w-0 flex-1 lg:block" />

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-1.5 lg:ml-0">
            <PreHeader compacto className="hidden 2xl:flex" />
            <button
              type="button"
              onClick={() => setBuscarOpen((v) => !v)}
              aria-expanded={buscarOpen}
              aria-label="Buscar productos"
              className={`${botonRedondo} lg:hidden`}
              style={fondoBoton}
            >
              <IconoLupa className="h-5 w-5" />
            </button>
            <BotonCuenta className="hidden xs:inline-flex" />
            <BotonFavoritos className="hidden sm:inline-flex" />
            <ThemeSwitch className="hidden sm:inline-flex" />
            <BotonCarrito />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="rv-sheet"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              className={`${botonRedondo} lg:hidden`}
              style={fondoBoton}
            >
              {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </GlassPanel>

        {/* Categorias y marcas (escritorio) */}
        <div className="hidden lg:block" onMouseLeave={() => canHover && setMegaOpen(false)}>
          <MenuProductos abierto={megaOpen} onCerrar={() => setMegaOpen(false)} />
        </div>

        {/* Buscador en telefono y tablet: se despliega desde la lupa de la barra */}
        {buscarOpen && (
          <div className="pointer-events-auto mt-2 lg:hidden">
            <Buscador autoFocus onBuscar={() => setBuscarOpen(false)} />
          </div>
        )}
      </div>

      {/* ---------------- Hoja movil ---------------- */}
      <div id="rv-sheet" hidden={!menuOpen} className="pointer-events-auto mx-3 mt-2 sm:mx-5 lg:hidden">
        <GlassPanel variant="chrome" className="max-h-[calc(100svh-110px)] overflow-y-auto rounded-glass-lg p-4">
          <Link to="/productos" className="rv-btn-primary w-full">
            Ver todos los productos
          </Link>
          {raicesMenu.length > 0 && <p className="rv-eyebrow mb-2 mt-5 px-2">Categorías</p>}
          <ul className="grid grid-cols-2 gap-1.5">
            {raicesMenu.slice(0, EN_LA_BARRA).map((c) => (
              <li key={c.slug}>
                <Link
                  to={enlaceCategoria(c.slug)}
                  className="flex min-h-[52px] items-center rounded-2xl px-3 font-display text-sm font-medium text-black hover:text-rv-red dark:text-white"
                  style={fondoBoton}
                >
                  <span className="leading-tight">{c.nombre}</span>
                </Link>
              </li>
            ))}
          </ul>
          {raicesMenu.length > EN_LA_BARRA && (
            <details className="group mt-1.5">
              <summary
                className="flex min-h-[48px] cursor-pointer list-none items-center justify-between rounded-2xl px-4 font-display text-sm font-semibold text-black hover:text-rv-red dark:text-white [&::-webkit-details-marker]:hidden"
                style={fondoBoton}
              >
                Más categorías
                <Chevron className="group-open:rotate-180" />
              </summary>
              <ul className="mt-1.5 grid grid-cols-2 gap-1.5">
                {raicesMenu.slice(EN_LA_BARRA).map((c) => (
                  <li key={c.slug}>
                    <Link
                      to={enlaceCategoria(c.slug)}
                      className="flex min-h-[52px] items-center rounded-2xl px-3 font-display text-sm font-medium text-black hover:text-rv-red dark:text-white"
                      style={fondoBoton}
                    >
                      <span className="leading-tight">{c.nombre}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          )}

          <p className="rv-eyebrow mb-2 mt-5 px-2">REDVISION</p>
          <ul className="flex flex-col gap-1">
            {[
              cuenta ? { to: '/cuenta', label: `Mi cuenta · ${cuenta.name}` } : { to: '/cuenta/ingresar', label: 'Ingresar a mi cuenta' },
              { to: '/favoritos', label: 'Mis favoritos' },
              ...SECCIONES,
            ].map((s) => (
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
          <div className="mt-4 flex items-center justify-between rounded-2xl px-4 py-2" style={fondoBoton}>
            <span className="font-display text-sm font-medium text-black dark:text-white">Tema claro / oscuro</span>
            <ThemeSwitch />
          </div>
          <a href={EMPRESA.telefono.whatsapp} target="_blank" rel="noopener noreferrer" className="rv-btn-glass mt-3 w-full">
            <IconoWhatsapp className="h-4 w-4" />
            Hablar con un asesor
          </a>
          <PreHeader className="mt-4 w-full justify-center" />
        </GlassPanel>
      </div>
    </header>
  )
}
