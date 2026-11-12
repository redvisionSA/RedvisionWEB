import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTienda } from '../tienda/TiendaContext.jsx'
import {
  buscarRanking,
  calcularFacetas,
  chipsActivos,
  filtrar,
  leerSeleccion,
  ORDENES,
  ordenarLista,
  PARAMS_FACETAS,
  rangoPrecios,
} from '../tienda/motor.js'
import { formatoPrecio } from '../tienda/formato.js'
import { LINEAS, lineaPorId } from '../tienda/lineas.js'
import ProductoCard from '../tienda/ProductoCard.jsx'
import { LogoMarca, Migas } from '../tienda/piezas.jsx'
import { IconoBuscar, IconoCerrar, IconoWhatsapp } from '../tienda/Iconos.jsx'
import { enlaceWhatsapp } from '../tienda/whatsapp.js'
import Pagina, { usePagina } from './Pagina.jsx'

const POR_TANDA = 24
const CLAVE_VISTA = 'rv-vista-v1'
/* Lo que casi todo el catalogo tiene no sirve como atajo */
const GENERICAS = new Set(['IP', 'H.265+', 'Audio / micrófono', 'PoE'])

/* ======================================================= piezas de filtro */
const IconoChevron = ({ abierto }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`h-4 w-4 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

function Grupo({ titulo, activas = 0, abiertoInicial = true, children }) {
  const [abierto, setAbierto] = useState(abiertoInicial)
  return (
    <section className="border-b border-black/[0.07] py-3 last:border-0 dark:border-white/10">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        className="flex min-h-[40px] w-full cursor-pointer items-center justify-between gap-2 text-left font-display text-[13px] font-semibold text-black dark:text-white"
      >
        <span>
          {titulo}
          {activas > 0 && <span className="ml-2 rounded-md bg-rv-red px-1.5 py-0.5 text-[10px] text-white">{activas}</span>}
        </span>
        <IconoChevron abierto={abierto} />
      </button>
      {abierto && <div className="pt-1.5">{children}</div>}
    </section>
  )
}

function FacetaLista({ faceta, onAlternar }) {
  const [verTodo, setVerTodo] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const filtradas = busqueda
    ? faceta.opciones.filter((o) => String(o.etiqueta).toLowerCase().includes(busqueda.toLowerCase()))
    : faceta.opciones
  const LIMITE = 6
  const visibles = verTodo || busqueda ? filtradas : filtradas.slice(0, LIMITE)

  return (
    <Grupo titulo={faceta.titulo} activas={faceta.activas} abiertoInicial={faceta.activas > 0 || ['marca', 'tec', 'mp', 'forma'].includes(faceta.id)}>
      {faceta.buscable && faceta.opciones.length > 8 && (
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={`Buscar ${faceta.titulo.toLowerCase()}`}
          aria-label={`Buscar en ${faceta.titulo}`}
          className="mb-2 min-h-[40px] w-full rounded-lg border border-black/10 bg-white px-3 text-base outline-none focus:border-rv-red dark:border-white/15 dark:bg-white/5 dark:text-white sm:text-sm"
        />
      )}
      <ul className="flex flex-col">
        {visibles.map((o) => (
          <li key={o.valor}>
            <label
              className={`flex min-h-[36px] cursor-pointer items-center gap-2.5 rounded-lg px-1.5 text-sm transition-colors hover:bg-black/[0.04] dark:hover:bg-white/5
                          ${o.n === 0 && !o.activa ? 'opacity-40' : ''} ${o.activa ? 'font-semibold text-black dark:text-white' : 'text-black/80 dark:text-white/80'}`}
            >
              <input
                type="checkbox"
                checked={o.activa}
                disabled={o.n === 0 && !o.activa}
                onChange={() => onAlternar(faceta.param, o.valor)}
                className="h-4 w-4 shrink-0 accent-[#D61922]"
              />
              <span className="min-w-0 flex-1 truncate">
                {faceta.id === 'marca' && o.marca?.identidad ? <LogoMarca marca={o.marca} alto={14} /> : o.etiqueta}
              </span>
              <span className="num text-xs text-black/45 dark:text-white/45">{o.n}</span>
            </label>
          </li>
        ))}
      </ul>
      {!busqueda && filtradas.length > LIMITE && (
        <button type="button" onClick={() => setVerTodo((v) => !v)} className="mt-1 px-1.5 text-xs font-semibold text-rv-red hover:underline">
          {verTodo ? 'Ver menos' : `Ver ${filtradas.length - LIMITE} más`}
        </button>
      )}
    </Grupo>
  )
}

function FiltroPrecio({ rango, min, max, onAplicar }) {
  const [desde, setDesde] = useState(min ?? rango.min)
  const [hasta, setHasta] = useState(max ?? rango.max)
  useEffect(() => {
    setDesde(min ?? rango.min)
    setHasta(max ?? rango.max)
  }, [min, max, rango.min, rango.max])

  const aplicar = (d = desde, h = hasta) => {
    const a = Math.max(rango.min, Math.min(Number(d) || rango.min, Number(h) || rango.max))
    const b = Math.min(rango.max, Math.max(Number(d) || rango.min, Number(h) || rango.max))
    onAplicar(a <= rango.min ? null : Math.floor(a), b >= rango.max ? null : Math.ceil(b))
  }

  const alto = Math.max(...rango.histograma, 1)
  const paso = Math.max(1, Math.round((rango.max - rango.min) / 200))

  return (
    <Grupo titulo="Precio" activas={min !== null || max !== null ? 1 : 0}>
      <div className="px-1">
        <div className="flex h-12 items-end gap-[2px]" aria-hidden="true">
          {rango.histograma.map((n, i) => {
            const inicio = rango.min + i * rango.ancho
            const dentro = inicio + rango.ancho >= desde && inicio <= hasta
            return (
              <span
                key={i}
                className={`flex-1 rounded-t-sm ${dentro ? 'bg-black/70 dark:bg-white/70' : 'bg-black/15 dark:bg-white/15'}`}
                style={{ height: `${Math.max(4, (n / alto) * 100)}%` }}
              />
            )
          })}
        </div>
        <div className="relative h-7">
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-black/10 dark:bg-white/15" />
          <div
            className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-rv-red"
            style={{
              left: `${((desde - rango.min) / (rango.max - rango.min || 1)) * 100}%`,
              right: `${100 - ((hasta - rango.min) / (rango.max - rango.min || 1)) * 100}%`,
            }}
          />
          <input
            type="range"
            min={rango.min}
            max={rango.max}
            step={paso}
            value={desde}
            onChange={(e) => setDesde(Math.min(Number(e.target.value), hasta))}
            onPointerUp={() => aplicar()}
            onKeyUp={() => aplicar()}
            aria-label="Precio mínimo"
            className="rv-rango"
          />
          <input
            type="range"
            min={rango.min}
            max={rango.max}
            step={paso}
            value={hasta}
            onChange={(e) => setHasta(Math.max(Number(e.target.value), desde))}
            onPointerUp={() => aplicar()}
            onKeyUp={() => aplicar()}
            aria-label="Precio máximo"
            className="rv-rango"
          />
        </div>
        <form
          className="mt-2 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            aplicar()
          }}
        >
          {[
            ['Mínimo', desde, setDesde],
            ['Máximo', hasta, setHasta],
          ].map(([etq, val, set]) => (
            <label key={etq} className="flex-1">
              <span className="mb-1 block text-[11px] text-black/55 dark:text-white/55">{etq}</span>
              <span className="flex items-center rounded-lg border border-black/10 bg-white px-2 focus-within:border-rv-red dark:border-white/15 dark:bg-white/5">
                <span className="text-sm text-black/50 dark:text-white/50">$</span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={Math.round(val)}
                  onChange={(e) => set(Number(e.target.value))}
                  onBlur={() => aplicar()}
                  className="num min-h-[38px] w-full bg-transparent px-1 text-base outline-none [appearance:textfield] dark:text-white sm:text-sm [&::-webkit-inner-spin-button]:appearance-none"
                />
              </span>
            </label>
          ))}
          <button type="submit" className="mt-5 inline-flex h-[38px] items-center rounded-lg bg-black px-3 text-xs font-semibold text-white dark:bg-white dark:text-black">
            Ir
          </button>
        </form>
      </div>
    </Grupo>
  )
}

/* ========================================================== pagina */
export default function Catalogo() {
  const { linea: lineaId } = useParams()
  const [params, setParams] = useSearchParams()
  const { catalogo } = useTienda()
  const [visibles, setVisibles] = useState(POR_TANDA)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)
  const [vista, setVista] = useState(() => {
    try {
      return window.localStorage.getItem(CLAVE_VISTA) || 'grilla'
    } catch {
      return 'grilla'
    }
  })

  const linea = lineaPorId(lineaId)
  const q = params.get('q') || ''
  const orden = params.get('orden') || 'relevancia'
  const sel = useMemo(() => leerSeleccion(params), [params])
  const { productos, motor, nombresMarca, nombresCategoria } = catalogo.datos

  usePagina({
    titulo: q ? `«${q}»` : linea ? linea.titulo : 'Productos',
    descripcion: linea ? `${linea.titulo}: ${linea.texto}` : undefined,
  })

  const cambiarVista = (v) => {
    setVista(v)
    try {
      window.localStorage.setItem(CLAVE_VISTA, v)
    } catch {
      /* sin almacenamiento */
    }
  }

  const actualizar = useCallback(
    (cambios) => {
      const nuevos = new URLSearchParams(params)
      Object.entries(cambios).forEach(([k, v]) => {
        if (v === null || v === '' || v === false) nuevos.delete(k)
        else nuevos.set(k, v)
      })
      setParams(nuevos, { replace: true })
    },
    [params, setParams]
  )

  const alternar = useCallback(
    (param, valor) => {
      const set = new Set((params.get(param) || '').split(',').filter(Boolean))
      set.has(valor) ? set.delete(valor) : set.add(valor)
      actualizar({ [param]: [...set].join(',') })
    },
    [params, actualizar]
  )

  const limpiarTodo = () => {
    const nuevos = new URLSearchParams()
    if (q) nuevos.set('q', q)
    setParams(nuevos, { replace: true })
  }

  /* 1. Busqueda con ranking  2. Linea  3. Facetas */
  const busqueda = useMemo(() => buscarRanking(motor, q), [motor, q])
  const base = useMemo(() => {
    const lista = busqueda.resultados.map((r) => r.p)
    return linea ? lista.filter((p) => p.linea === linea.id) : lista
  }, [busqueda, linea])

  const ctx = useMemo(
    () => ({ marcas: nombresMarca, categorias: nombresCategoria, listaMarcas: catalogo.datos.marcas }),
    [nombresMarca, nombresCategoria, catalogo.datos.marcas]
  )
  const facetas = useMemo(() => calcularFacetas(base, sel, ctx), [base, sel, ctx])
  const rango = useMemo(() => rangoPrecios(base, sel), [base, sel])
  const resultado = useMemo(() => ordenarLista(filtrar(base, sel), q && orden === 'relevancia' ? 'relevancia' : orden), [base, sel, orden, q])
  const chips = useMemo(() => chipsActivos(sel, facetas, formatoPrecio), [sel, facetas])
  const marcaUnica = useMemo(() => {
    const elegidas = sel.facetas.marca
    if (!elegidas || elegidas.size !== 1) return null
    const slug = [...elegidas][0]
    return catalogo.datos.marcas.find((m) => m.slug === slug) || null
  }, [sel, catalogo.datos.marcas])

  const conteoLineas = useMemo(() => {
    const c = {}
    busqueda.resultados.forEach(({ p }) => (c[p.linea] = (c[p.linea] || 0) + 1))
    return c
  }, [busqueda])

  /* Atajos: las opciones mas elegidas del momento, a un toque */
  const atajos = useMemo(() => {
    const out = []
    const tomar = (id, n) => {
      const f = facetas.find((x) => x.id === id)
      if (!f?.visible) return
      f.opciones
        .filter((o) => o.n > 0 && !o.activa && !GENERICAS.has(o.valor))
        .sort((a, b) => b.n - a.n)
        .slice(0, n)
        .forEach((o) => out.push({ param: f.param, valor: o.valor, texto: o.etiqueta }))
    }
    tomar('tec', 3)
    tomar('mp', 2)
    tomar('forma', 2)
    return out
  }, [facetas])

  useEffect(() => setVisibles(POR_TANDA), [lineaId, q, params])

  const quitarChip = (chip) => (chip.valor === null ? actualizar({ [chip.param]: null }) : alternar(chip.param, chip.valor))
  const hayFiltros = chips.length > 0
  const nFiltros = chips.length

  const panelFiltros = (
    <div>
      <Grupo titulo="Línea de producto" abiertoInicial>
        <ul className="flex flex-col">
          {[{ id: null, titulo: 'Todas las líneas', Icono: null }, ...LINEAS].map((l) => {
            const activa = (linea?.id || null) === l.id
            const resto = new URLSearchParams(params)
            PARAMS_FACETAS.forEach((k) => k !== 'marca' && resto.delete(k))
            const qs = resto.toString()
            return (
              <li key={l.id || 'todas'}>
                <Link
                  to={`/productos${l.id ? `/${l.id}` : ''}${qs ? `?${qs}` : ''}`}
                  aria-current={activa ? 'page' : undefined}
                  className={`flex min-h-[36px] items-center justify-between gap-2 rounded-lg px-1.5 text-sm transition-colors
                              ${activa ? 'bg-black font-semibold text-white dark:bg-white dark:text-black' : 'text-black/80 hover:bg-black/[0.04] dark:text-white/80 dark:hover:bg-white/5'}`}
                >
                  <span className="flex items-center gap-2 pl-1">
                    {l.Icono && <l.Icono className="h-4 w-4" />}
                    {l.titulo}
                  </span>
                  <span className="num pr-1 text-xs opacity-60">{l.id ? conteoLineas[l.id] || 0 : busqueda.resultados.length}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </Grupo>

      <section className="border-b border-black/[0.07] py-3 dark:border-white/10">
        <label className="flex min-h-[40px] cursor-pointer items-center justify-between gap-3 text-sm font-semibold text-black dark:text-white">
          Solo con stock para entrega
          <span className="relative inline-flex">
            <input
              type="checkbox"
              role="switch"
              checked={sel.stock}
              onChange={(e) => actualizar({ stock: e.target.checked ? '1' : null })}
              className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full bg-black/15 transition-colors peer-checked:bg-rv-red peer-focus-visible:ring-2 peer-focus-visible:ring-rv-red/40 dark:bg-white/20" />
            <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </span>
        </label>
      </section>

      {rango && rango.max > rango.min && <FiltroPrecio rango={rango} min={sel.precioMin} max={sel.precioMax} onAplicar={(a, b) => actualizar({ precio: a === null && b === null ? null : `${a ?? ''}-${b ?? ''}` })} />}

      {facetas
        .filter((f) => f.visible)
        .map((f) => (
          <FacetaLista key={`${f.id}-${linea?.id || ''}`} faceta={f} onAlternar={alternar} />
        ))}
    </div>
  )

  const titulo = q ? (
    <>
      Resultados para <span className="text-rv-red">«{q}»</span>
    </>
  ) : linea ? (
    linea.titulo
  ) : (
    'Todos los productos'
  )

  return (
    <Pagina>
      <Migas
        items={[
          { label: 'Inicio', to: '/' },
          linea || q ? { label: 'Productos', to: '/productos' } : { label: 'Productos' },
          ...(linea ? [{ label: linea.titulo }] : []),
        ]}
      />

      {marcaUnica && (
        <div className="rv-solido relative mb-5 flex flex-col gap-3 overflow-hidden p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <span className="absolute inset-y-0 left-0 w-1.5" style={{ background: marcaUnica.identidad?.color || '#0b0b0d' }} aria-hidden="true" />
          <LogoMarca marca={marcaUnica} alto={40} className="pl-2" />
          <div className="min-w-0 flex-1">
            {marcaUnica.identidad?.oficial && (
              <span className="mb-1 inline-block rounded-md bg-black px-2 py-1 font-display text-[10px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-black">
                Distribuidor oficial
              </span>
            )}
            <p className="text-sm leading-relaxed text-black/70 dark:text-white/70">
              {marcaUnica.identidad?.texto || `Productos ${marcaUnica.nombre} disponibles en REDVISION.`}
            </p>
          </div>
        </div>
      )}

      <header className="mb-5 flex flex-col gap-1.5 px-1">
        <h1 className="font-display text-3xl font-bold text-black dark:text-white sm:text-4xl">{titulo}</h1>
        {linea && !q && <p className="max-w-3xl text-sm leading-relaxed text-black/65 dark:text-white/65">{linea.resumen} {linea.texto}</p>}
        {busqueda.correccion && (
          <p className="text-sm text-black/75 dark:text-white/75">
            Sin resultados exactos. Mostramos resultados para <strong>«{busqueda.correccion}»</strong>.
          </p>
        )}
        {busqueda.aproximado && <p className="text-sm text-black/75 dark:text-white/75">No hay productos con todas las palabras: mostramos los más parecidos.</p>}
      </header>

      <div className="grid gap-5 lg:grid-cols-[272px_minmax(0,1fr)] lg:gap-6">
        <aside className="hidden lg:block" aria-label="Filtros">
          <div className="rv-solido sticky top-[150px] max-h-[calc(100svh-170px)] overflow-y-auto overscroll-contain px-4 py-1">{panelFiltros}</div>
        </aside>

        <div className="min-w-0">
          {/* Barra de resultados */}
          <div className="rv-solido mb-3 flex flex-wrap items-center gap-2 px-3 py-2.5 sm:px-4">
            <p className="mr-auto text-sm text-black/70 dark:text-white/70" aria-live="polite">
              {catalogo.estado === 'cargando' ? (
                'Cargando catálogo…'
              ) : (
                <>
                  <strong className="num text-black dark:text-white">{resultado.length}</strong> {resultado.length === 1 ? 'producto' : 'productos'}
                </>
              )}
            </p>
            <button
              type="button"
              onClick={() => setFiltrosAbiertos(true)}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-black/15 px-3 text-sm font-semibold text-black dark:border-white/20 dark:text-white lg:hidden"
            >
              Filtrar{nFiltros ? ` (${nFiltros})` : ''}
            </button>
            <label className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
              <span className="hidden sm:inline">Ordenar por</span>
              <select
                value={orden}
                onChange={(e) => actualizar({ orden: e.target.value === 'relevancia' ? null : e.target.value })}
                className="min-h-[40px] cursor-pointer rounded-lg border border-black/15 bg-white px-2.5 text-base font-semibold text-black outline-none focus:border-rv-red dark:border-white/20 dark:bg-[#141417] dark:text-white sm:text-sm"
              >
                {ORDENES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
            </label>
            <div className="hidden items-center rounded-lg border border-black/15 p-0.5 dark:border-white/20 sm:flex" role="group" aria-label="Vista">
              {[
                ['grilla', 'Grilla', 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z'],
                ['lista', 'Lista', 'M4 6h16M4 12h16M4 18h16'],
              ].map(([v, etq, d]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => cambiarVista(v)}
                  aria-pressed={vista === v}
                  aria-label={`Vista en ${etq.toLowerCase()}`}
                  title={etq}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-md ${vista === v ? 'bg-black text-white dark:bg-white dark:text-black' : 'text-black/60 hover:text-black dark:text-white/60'}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
                    <path d={d} />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Filtros activos y atajos */}
          {(hayFiltros || atajos.length > 0) && (
            <div className="mb-4 flex flex-wrap items-center gap-1.5">
              {chips.map((c) => (
                <button
                  key={c.clave}
                  type="button"
                  onClick={() => quitarChip(c)}
                  className="inline-flex min-h-[34px] items-center gap-1.5 rounded-full bg-black px-3 text-xs font-semibold text-white hover:bg-rv-red dark:bg-white dark:text-black"
                  aria-label={`Quitar filtro ${c.texto}`}
                >
                  {c.texto}
                  <IconoCerrar className="h-3.5 w-3.5" />
                </button>
              ))}
              {hayFiltros && (
                <button type="button" onClick={limpiarTodo} className="min-h-[34px] px-2 text-xs font-semibold text-rv-red hover:underline">
                  Limpiar todo
                </button>
              )}
              {atajos.map((a) => (
                <button
                  key={`${a.param}:${a.valor}`}
                  type="button"
                  onClick={() => alternar(a.param, a.valor)}
                  className="rv-solido inline-flex min-h-[34px] items-center gap-1 !rounded-full px-3 text-xs font-semibold text-black hover:border-rv-red hover:text-rv-red dark:text-white"
                >
                  + {a.texto}
                </button>
              ))}
            </div>
          )}

          {catalogo.estado === 'cargando' ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="rv-solido aspect-[3/5] animate-pulse" />
              ))}
            </ul>
          ) : resultado.length === 0 ? (
            <div className="rv-solido p-8 text-center">
              <IconoBuscar className="mx-auto mb-3 h-10 w-10 text-black/25 dark:text-white/30" />
              <p className="font-display text-lg font-semibold text-black dark:text-white">No encontramos productos con esos criterios.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-black/65 dark:text-white/65">
                Pruebe quitar algún filtro. Trabajamos con todo el mercado: si no figura en la tienda, lo cotizamos igual.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {hayFiltros && (
                  <button type="button" onClick={limpiarTodo} className="rv-btn-primary">
                    Quitar filtros
                  </button>
                )}
                <a
                  href={enlaceWhatsapp(`Hola, busco ${q || linea?.titulo || 'un producto'} y no lo encuentro en la tienda.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-black/15 px-5 text-sm font-semibold text-black hover:border-rv-red hover:text-rv-red dark:border-white/20 dark:text-white"
                >
                  <IconoWhatsapp className="h-4 w-4" />
                  Pedir cotización
                </a>
              </div>
            </div>
          ) : (
            <>
              <ul className={vista === 'lista' ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4'}>
                {resultado.slice(0, visibles).map((p) => (
                  <li key={p.id}>
                    <ProductoCard producto={p} vista={vista === 'lista' ? 'lista' : 'grilla'} />
                  </li>
                ))}
              </ul>
              {visibles < resultado.length && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="text-xs text-black/60 dark:text-white/60">
                    Viendo {Math.min(visibles, resultado.length)} de {resultado.length}
                  </p>
                  <div className="h-1 w-48 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
                    <div className="h-full bg-rv-red" style={{ width: `${(visibles / resultado.length) * 100}%` }} />
                  </div>
                  <button
                    type="button"
                    onClick={() => setVisibles((v) => v + POR_TANDA)}
                    className="mt-1 inline-flex min-h-[44px] items-center rounded-full border border-black/15 bg-white px-6 text-sm font-semibold text-black hover:border-rv-red hover:text-rv-red dark:border-white/20 dark:bg-[#141417] dark:text-white"
                  >
                    Mostrar más productos
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Hoja de filtros en telefono y tablet */}
      {filtrosAbiertos && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltrosAbiertos(false)} />
          <div className="pb-safe absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-[24px] bg-white dark:bg-[#141417]">
            <div className="flex items-center justify-between border-b border-black/10 px-5 py-3 dark:border-white/10">
              <p className="font-display text-lg font-bold text-black dark:text-white">Filtrar{nFiltros ? ` (${nFiltros})` : ''}</p>
              <button type="button" onClick={() => setFiltrosAbiertos(false)} aria-label="Cerrar filtros" className="inline-flex h-11 w-11 items-center justify-center rounded-full text-black dark:text-white">
                <IconoCerrar className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto overscroll-contain px-5">{panelFiltros}</div>
            <div className="flex gap-2 border-t border-black/10 px-5 pt-3 dark:border-white/10">
              {hayFiltros && (
                <button type="button" onClick={limpiarTodo} className="min-h-[48px] flex-1 rounded-xl border border-black/15 text-sm font-semibold text-black dark:border-white/20 dark:text-white">
                  Limpiar
                </button>
              )}
              <button type="button" onClick={() => setFiltrosAbiertos(false)} className="min-h-[48px] flex-[2] rounded-xl bg-rv-red text-sm font-semibold text-white">
                Ver {resultado.length} productos
              </button>
            </div>
          </div>
        </div>
      )}
    </Pagina>
  )
}
