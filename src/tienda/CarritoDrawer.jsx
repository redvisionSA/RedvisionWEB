import { useEffect, useMemo, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTienda } from './TiendaContext.jsx'
import { formatoPrecio } from './formato.js'
import { COMPLEMENTOS } from './lineas.js'
import LineaCarrito from './LineaCarrito.jsx'
import { ImagenProducto, sePuedeComprar } from './piezas.jsx'
import { IconoCarrito, IconoCerrar, IconoMas } from './Iconos.jsx'

/**
 * Cajon lateral del carrito.
 *
 * Confirma cada agregado sin sacar al visitante de lo que estaba mirando,
 * muestra el subtotal en todo momento (sin sorpresas) y sugiere lo que la
 * instalacion necesita al lado: fuente, red, accesorios.
 */
export default function CarritoDrawer() {
  const { lineas, resumen, carritoAbierto, setCarritoAbierto, catalogo, agregar } = useTienda()
  const panelRef = useRef(null)
  const location = useLocation()
  const cerrar = () => setCarritoAbierto(false)

  useEffect(() => {
    setCarritoAbierto(false)
  }, [location.pathname, setCarritoAbierto])

  useEffect(() => {
    if (!carritoAbierto) return undefined
    const onKey = (e) => e.key === 'Escape' && setCarritoAbierto(false)
    window.addEventListener('keydown', onKey)
    const previo = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previo
    }
  }, [carritoAbierto, setCarritoAbierto])

  const sugeridos = useMemo(() => {
    const enCarrito = new Set(lineas.map((l) => l.id))
    const lineasCarrito = [...new Set(lineas.map((l) => l.producto?.linea).filter(Boolean))]
    const objetivo = new Set(lineasCarrito.flatMap((l) => COMPLEMENTOS[l] || []))
    return catalogo.datos.productos
      .filter((p) => objetivo.has(p.linea) && !enCarrito.has(p.id) && p.precio !== null && sePuedeComprar(p))
      .slice(0, 3)
  }, [lineas, catalogo.datos.productos])

  return (
    <div className={`fixed inset-0 z-[80] overflow-hidden ${carritoAbierto ? '' : 'pointer-events-none'}`} aria-hidden={!carritoAbierto}>
      <div
        onClick={cerrar}
        className={`absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 ${carritoAbierto ? 'opacity-100' : 'opacity-0'}`}
      />
      <aside
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={`rv-panel-solido absolute bottom-0 right-0 top-0 flex w-full max-w-[440px] flex-col outline-none transition-transform duration-400 ease-apple sm:bottom-3 sm:right-3 sm:top-3 sm:rounded-glass
                    ${carritoAbierto ? 'translate-x-0' : 'translate-x-[105%]'}`}
      >
        <header className="flex items-center justify-between border-b rv-hairline px-5 py-4">
          <div>
            <p className="font-display text-lg font-bold text-black dark:text-white">Su carrito</p>
            <p className="rv-muted text-xs">
              {resumen.unidades === 0 ? 'Todavía no agregó productos' : `${resumen.unidades} ${resumen.unidades === 1 ? 'unidad' : 'unidades'}`}
            </p>
          </div>
          <button
            type="button"
            onClick={cerrar}
            aria-label="Cerrar carrito"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-pill text-black hover:text-rv-red dark:text-white"
          >
            <IconoCerrar className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5">
          {lineas.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 py-10 text-center">
              <IconoCarrito className="h-12 w-12 text-black/25 dark:text-white/30" />
              <p className="rv-muted max-w-[260px] text-sm">
                Explore el catálogo y arme su pedido. Un asesor confirma stock y entrega antes de cobrar.
              </p>
              <Link to="/productos" className="rv-btn-primary">
                Ver productos
              </Link>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-black/10 dark:divide-white/10">
                {lineas.map((l) => (
                  <LineaCarrito key={l.id} linea={l} onNavegar={cerrar} compacta />
                ))}
              </ul>

              {sugeridos.length > 0 && (
                <section className="rv-sutil mb-4 mt-2 rounded-2xl p-4">
                  <p className="rv-eyebrow mb-3">Complete la instalación</p>
                  <ul className="flex flex-col gap-2.5">
                    {sugeridos.map((p) => (
                      <li key={p.id} className="flex items-center gap-3">
                        <ImagenProducto producto={p} className="h-12 w-12 shrink-0 rounded-xl" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-black dark:text-white">{p.nombre}</p>
                          <p className="num text-xs font-bold text-black/75 dark:text-white/80">{formatoPrecio(p.precio)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => agregar(p.id, 1, { abrir: false })}
                          aria-label={`Agregar ${p.nombre}`}
                          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-pill bg-black text-white hover:bg-rv-red dark:bg-white dark:text-black"
                        >
                          <IconoMas className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </div>

        {lineas.length > 0 && (
          <footer className="pb-safe border-t rv-hairline px-5 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-black dark:text-white">Subtotal</span>
              <span className="num font-display text-2xl font-bold text-black dark:text-white">{formatoPrecio(resumen.subtotal) || '$ 0'}</span>
            </div>
            <p className="rv-muted mb-3 mt-1 text-xs">
              IVA incluido. {resumen.hayAConfirmar ? 'Hay productos con precio a confirmar. ' : ''}El envío se cotiza al confirmar.
            </p>
            <Link to="/carrito" className="rv-btn-primary w-full">
              Finalizar pedido
            </Link>
            <button type="button" onClick={cerrar} className="rv-link mx-auto mt-2 block py-2 text-xs font-semibold uppercase tracking-wide">
              Seguir comprando
            </button>
          </footer>
        )}
      </aside>
    </div>
  )
}
