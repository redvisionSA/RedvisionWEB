import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTienda } from './TiendaContext.jsx'
import { buscarRanking } from './motor.js'
import { registrarEvento } from './popularidad.js'
import { formatoPrecio } from './formato.js'
import { IconoBuscar } from './Iconos.jsx'
import { ImagenProducto } from './piezas.jsx'

/**
 * Buscador con sugerencias instantaneas.
 *
 * Quien busca ya sabe lo que quiere: es el visitante con mas intencion de
 * compra. Las sugerencias muestran precio para que decida sin cambiar de
 * pagina; Enter lleva al listado completo con la consulta en la URL.
 * Atajo "/" para enfocarlo (solo la instancia con `atajo`).
 */
export default function Buscador({ className = '', grande = false, atajo = false, autoFocus = false, onBuscar }) {
  const { catalogo } = useTienda()
  const navigate = useNavigate()
  const [consulta, setConsulta] = useState('')
  const [abierto, setAbierto] = useState(false)
  const [activo, setActivo] = useState(-1)
  const inputRef = useRef(null)
  const cajaRef = useRef(null)
  const listaId = useId()

  /* Sugerencias mientras se escribe, con una espera corta: no se recalcula en
     cada tecla, sino cuando el visitante hace una pausa. */
  const [diferida, setDiferida] = useState('')
  useEffect(() => {
    const id = window.setTimeout(() => setDiferida(consulta), 180)
    return () => window.clearTimeout(id)
  }, [consulta])
  const busqueda = useMemo(() => {
    if (diferida.trim().length < 2) return { resultados: [], correccion: null }
    return buscarRanking(catalogo.datos.motor, diferida)
  }, [catalogo.datos.motor, diferida])
  const resultados = busqueda.resultados.map((r) => r.p)
  const sugerencias = resultados.slice(0, 6)

  useEffect(() => {
    if (!atajo) return undefined
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [atajo])

  useEffect(() => {
    const fuera = (e) => {
      if (cajaRef.current && !cajaRef.current.contains(e.target)) setAbierto(false)
    }
    document.addEventListener('pointerdown', fuera)
    return () => document.removeEventListener('pointerdown', fuera)
  }, [])

  function irAProducto(p) {
    registrarEvento('busqueda', [p.id])
    ir(`/producto/${p.slug}`)
  }

  function ir(ruta) {
    setAbierto(false)
    setActivo(-1)
    inputRef.current?.blur()
    navigate(ruta)
    onBuscar?.()
  }

  function onSubmit(e) {
    e.preventDefault()
    if (activo >= 0 && sugerencias[activo]) return irAProducto(sugerencias[activo])
    const q = consulta.trim()
    ir(q ? `/productos?q=${encodeURIComponent(q)}` : '/productos')
  }

  function onKeyDown(e) {
    if (!sugerencias.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setAbierto(true)
      setActivo((i) => (i + 1) % sugerencias.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActivo((i) => (i <= 0 ? sugerencias.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setAbierto(false)
    }
  }

  const mostrarLista = abierto && consulta.trim().length >= 2

  return (
    <div ref={cajaRef} className={`relative ${className}`}>
      <form role="search" onSubmit={onSubmit} className="relative">
        <IconoBuscar
          className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-black/50 dark:text-white/55 ${grande ? 'h-5 w-5' : 'h-[18px] w-[18px]'}`}
        />
        <input
          ref={inputRef}
          type="search"
          value={consulta}
          autoFocus={autoFocus}
          onChange={(e) => {
            setConsulta(e.target.value)
            setAbierto(true)
            setActivo(-1)
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={onKeyDown}
          placeholder={grande ? 'Buscar cámaras, grabadores, alarmas, switches…' : 'Buscar productos'}
          aria-label="Buscar productos"
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls={listaId}
          aria-activedescendant={activo >= 0 ? `${listaId}-${activo}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          className={`rv-field rounded-pill pr-24 text-base ${grande ? 'min-h-[58px] pl-12 sm:text-lg' : 'min-h-[44px] pl-11'}`}
          style={{ background: 'rgba(255,255,255,0.72)' }}
        />
        <button
          type="submit"
          className={`absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-pill bg-rv-red font-display font-semibold uppercase tracking-wide text-white transition-colors hover:bg-rv-red-press
                      ${grande ? 'px-5 py-3 text-xs' : 'px-3.5 py-2 text-[11px]'}`}
        >
          Buscar
        </button>
      </form>

      {mostrarLista && (
        <div
          id={listaId}
          role="listbox"
          className="rv-solido absolute inset-x-0 top-full z-50 mt-2 overflow-hidden p-2"
        >
          {sugerencias.length === 0 && consulta !== diferida ? (
            <p className="rv-muted px-3 py-4 text-sm">Buscando…</p>
          ) : sugerencias.length === 0 ? (
            <p className="rv-muted px-3 py-4 text-sm">
              Sin coincidencias para «{consulta.trim()}». Pruebe con otra palabra o consúltenos por WhatsApp.
            </p>
          ) : (
            <>
              {busqueda.correccion && (
                <p className="px-3 pb-1 pt-2 text-xs text-black/60 dark:text-white/60">
                  Resultados para «{busqueda.correccion}»
                </p>
              )}
              {sugerencias.map((p, i) => (
                <button
                  key={p.id}
                  id={`${listaId}-${i}`}
                  type="button"
                  role="option"
                  aria-selected={activo === i}
                  onMouseEnter={() => setActivo(i)}
                  onClick={() => irAProducto(p)}
                  className={`group flex w-full cursor-pointer items-center gap-3 rounded-2xl p-2 text-left transition-colors ${
                    activo === i ? 'bg-black/[0.06] dark:bg-white/10' : ''
                  }`}
                >
                  <ImagenProducto producto={p} tamano="xs" className="h-12 w-12 shrink-0 rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-black dark:text-white">{p.nombre}</span>
                    <span className="rv-muted block truncate text-xs">
                      {[p.marca?.nombre, p.categoria?.nombre].filter(Boolean).join(' · ')}
                    </span>
                  </span>
                  <span className="num shrink-0 font-display text-sm font-bold text-black dark:text-white">
                    {formatoPrecio(p.precio) || 'Consultar'}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => ir(`/productos?q=${encodeURIComponent(consulta.trim())}`)}
                className="mt-1 w-full cursor-pointer rounded-2xl px-3 py-2.5 text-left font-display text-xs font-semibold uppercase tracking-wide text-rv-red hover:bg-black/[0.04]"
              >
                Ver los {resultados.length} resultados
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
