import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import GlassPanel from '../components/GlassPanel.jsx'
import { useTienda } from '../tienda/TiendaContext.jsx'
import { buscar, ordenar, ORDENES } from '../tienda/catalogo.js'
import { LINEAS, lineaPorId } from '../tienda/lineas.js'
import ProductoCard from '../tienda/ProductoCard.jsx'
import { Migas } from '../tienda/piezas.jsx'
import { IconoCerrar, IconoWhatsapp } from '../tienda/Iconos.jsx'
import { enlaceWhatsapp } from '../tienda/whatsapp.js'
import Pagina, { usePagina } from './Pagina.jsx'

const POR_TANDA = 24

/**
 * Listado de productos con filtros en la URL (se pueden compartir y el boton
 * Atras los respeta): ?q= busqueda, ?marca= slugs separados por coma,
 * ?stock=1 solo disponibles, ?orden=.
 */
export default function Catalogo() {
  const { linea: lineaId } = useParams()
  const [params, setParams] = useSearchParams()
  const { catalogo } = useTienda()
  const [visibles, setVisibles] = useState(POR_TANDA)
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  const linea = lineaPorId(lineaId)
  const q = params.get('q') || ''
  const marcasSel = (params.get('marca') || '').split(',').filter(Boolean)
  const soloStock = params.get('stock') === '1'
  const orden = params.get('orden') || 'relevancia'

  usePagina({
    titulo: linea ? linea.titulo : q ? `Resultados para «${q}»` : 'Productos',
    descripcion: linea ? `${linea.titulo}: ${linea.texto}` : undefined,
  })

  const actualizar = (cambios) => {
    const nuevos = new URLSearchParams(params)
    Object.entries(cambios).forEach(([k, v]) => {
      if (v === null || v === '' || v === false) nuevos.delete(k)
      else nuevos.set(k, v)
    })
    setParams(nuevos, { replace: true })
  }

  useEffect(() => setVisibles(POR_TANDA), [lineaId, q, marcasSel.join(','), soloStock, orden])

  const { productos } = catalogo.datos
  const base = useMemo(() => {
    let lista = linea ? productos.filter((p) => p.linea === linea.id) : productos
    return buscar(lista, q)
  }, [productos, linea, q])

  const marcasDisponibles = useMemo(() => {
    const c = new Map()
    base.forEach((p) => p.marca && c.set(p.marca.slug, { ...p.marca, n: (c.get(p.marca.slug)?.n || 0) + 1 }))
    return [...c.values()].sort((a, b) => b.n - a.n)
  }, [base])

  const resultado = useMemo(() => {
    let lista = base
    if (marcasSel.length) lista = lista.filter((p) => p.marca && marcasSel.includes(p.marca.slug))
    if (soloStock) lista = lista.filter((p) => p.disponibilidad === 'disponible' || p.disponibilidad === 'ultimas')
    return ordenar(lista, orden)
  }, [base, marcasSel.join(','), soloStock, orden])

  const conteoLineas = useMemo(() => {
    const filtrados = buscar(productos, q)
    const c = {}
    filtrados.forEach((p) => (c[p.linea] = (c[p.linea] || 0) + 1))
    return c
  }, [productos, q])

  const alternarMarca = (slug) => {
    const set = new Set(marcasSel)
    set.has(slug) ? set.delete(slug) : set.add(slug)
    actualizar({ marca: [...set].join(',') })
  }

  const hayFiltros = marcasSel.length > 0 || soloStock || q

  const filtros = (
    <div className="flex flex-col gap-6">
      <div>
        <p className="rv-eyebrow mb-3">Líneas</p>
        <ul className="flex flex-col gap-1">
          <li>
            <Link
              to={`/productos${q ? `?q=${encodeURIComponent(q)}` : ''}`}
              className={`flex min-h-[40px] items-center justify-between rounded-xl px-3 text-sm ${!linea ? 'bg-black font-semibold text-white dark:bg-white dark:text-black' : 'text-black/80 hover:text-rv-red dark:text-white/80'}`}
            >
              Todas
            </Link>
          </li>
          {LINEAS.map((l) => (
            <li key={l.id}>
              <Link
                to={`/productos/${l.id}${q ? `?q=${encodeURIComponent(q)}` : ''}`}
                className={`flex min-h-[40px] items-center justify-between gap-2 rounded-xl px-3 text-sm ${linea?.id === l.id ? 'bg-black font-semibold text-white dark:bg-white dark:text-black' : 'text-black/80 hover:text-rv-red dark:text-white/80'}`}
              >
                <span className="flex items-center gap-2">
                  <l.Icono className="h-4 w-4" />
                  {l.titulo}
                </span>
                <span className="num text-xs opacity-60">{conteoLineas[l.id] || 0}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {marcasDisponibles.length > 1 && (
        <fieldset>
          <legend className="rv-eyebrow mb-3">Marcas</legend>
          <ul className="flex flex-col gap-1">
            {marcasDisponibles.map((m) => (
              <li key={m.slug}>
                <label className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-xl px-3 text-sm text-black/85 hover:text-rv-red dark:text-white/85">
                  <input
                    type="checkbox"
                    checked={marcasSel.includes(m.slug)}
                    onChange={() => alternarMarca(m.slug)}
                    className="h-4 w-4 accent-[#D61922]"
                  />
                  <span className="flex-1">{m.nombre}</span>
                  <span className="num text-xs opacity-60">{m.n}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-3 text-sm font-semibold text-black dark:text-white">
        <input
          type="checkbox"
          checked={soloStock}
          onChange={(e) => actualizar({ stock: e.target.checked ? '1' : null })}
          className="h-4 w-4 accent-[#D61922]"
        />
        Solo con stock para entrega
      </label>

      {hayFiltros && (
        <button
          type="button"
          onClick={() => setParams({}, { replace: true })}
          className="rv-link self-start px-3 font-display text-xs font-semibold uppercase tracking-wide"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  )

  return (
    <Pagina>
      <Migas
        items={[
          { label: 'Inicio', to: '/' },
          linea ? { label: 'Productos', to: '/productos' } : { label: 'Productos' },
          ...(linea ? [{ label: linea.titulo }] : []),
        ]}
      />

      <header className="mb-6 flex flex-col gap-2 px-1">
        <h1 className="text-onglass font-display text-3xl font-bold sm:text-4xl">
          {q ? (
            <>
              Resultados para <span className="text-rv-red">«{q}»</span>
            </>
          ) : linea ? (
            linea.titulo
          ) : (
            'Todos los productos'
          )}
        </h1>
        {linea && !q && <p className="rv-muted max-w-3xl text-sm leading-relaxed">{linea.texto}</p>}
      </header>

      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <GlassPanel variant="thin" className="sticky top-[150px] p-4">
            {filtros}
          </GlassPanel>
        </aside>

        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="rv-muted text-sm" aria-live="polite">
              {catalogo.estado === 'cargando' ? 'Cargando catálogo…' : `${resultado.length} ${resultado.length === 1 ? 'producto' : 'productos'}`}
            </p>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setFiltrosAbiertos(true)} className="rv-btn-glass px-4 py-2 text-xs lg:hidden">
                Filtros{marcasSel.length + (soloStock ? 1 : 0) > 0 ? ` (${marcasSel.length + (soloStock ? 1 : 0)})` : ''}
              </button>
              <label className="sr-only" htmlFor="orden">
                Ordenar por
              </label>
              <select
                id="orden"
                value={orden}
                onChange={(e) => actualizar({ orden: e.target.value === 'relevancia' ? null : e.target.value })}
                className="rv-field min-h-[44px] w-auto cursor-pointer rounded-pill py-2 pr-8 text-base sm:text-sm"
              >
                {ORDENES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.etiqueta}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {catalogo.estado === 'cargando' ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
              {Array.from({ length: 8 }).map((_, i) => (
                <li key={i} className="aspect-[3/5] animate-pulse rounded-3xl" style={{ background: 'var(--glass-bg-thin)' }} />
              ))}
            </ul>
          ) : resultado.length === 0 ? (
            <GlassPanel className="p-8 text-center">
              <p className="text-onglass font-display text-lg font-semibold">No encontramos productos con esos criterios.</p>
              <p className="rv-muted mx-auto mt-2 max-w-md text-sm">
                Trabajamos con todo el mercado: si no figura en la tienda, lo cotizamos igual.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <a
                  href={enlaceWhatsapp(`Hola, busco ${q || linea?.titulo || 'un producto'} y no lo encuentro en la tienda.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rv-btn-primary"
                >
                  <IconoWhatsapp className="h-4 w-4" />
                  Pedir cotización
                </a>
                {hayFiltros && (
                  <button type="button" onClick={() => setParams({}, { replace: true })} className="rv-btn-glass">
                    Limpiar filtros
                  </button>
                )}
              </div>
            </GlassPanel>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
                {resultado.slice(0, visibles).map((p) => (
                  <li key={p.id}>
                    <ProductoCard producto={p} />
                  </li>
                ))}
              </ul>
              {visibles < resultado.length && (
                <div className="mt-6 flex flex-col items-center gap-2">
                  <p className="rv-muted text-xs">
                    Viendo {visibles} de {resultado.length}
                  </p>
                  <button type="button" onClick={() => setVisibles((v) => v + POR_TANDA)} className="rv-btn-glass">
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
          <div className="absolute inset-0 bg-black/35" onClick={() => setFiltrosAbiertos(false)} />
          <div className="rv-panel-solido pb-safe absolute inset-x-0 bottom-0 max-h-[85svh] overflow-y-auto rounded-t-[28px] p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-lg font-bold text-black dark:text-white">Filtros</p>
              <button
                type="button"
                onClick={() => setFiltrosAbiertos(false)}
                aria-label="Cerrar filtros"
                className="inline-flex h-11 w-11 items-center justify-center rounded-pill text-black dark:text-white"
              >
                <IconoCerrar className="h-5 w-5" />
              </button>
            </div>
            {filtros}
            <button type="button" onClick={() => setFiltrosAbiertos(false)} className="rv-btn-primary mt-6 w-full">
              Ver {resultado.length} productos
            </button>
          </div>
        </div>
      )}
    </Pagina>
  )
}
