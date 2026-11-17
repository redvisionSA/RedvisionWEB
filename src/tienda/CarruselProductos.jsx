import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import ProductoCard from './ProductoCard.jsx'
import { IconoFlecha } from './Iconos.jsx'

const INTERVALO = 3800 // ms entre pasos

/**
 * Carrusel automatico de productos: el unico bloque de productos del inicio.
 *
 * Avanza solo de a una tarjeta y vuelve al principio al terminar. Se detiene
 * mientras el visitante lo usa (cursor encima, foco de teclado o toque), con la
 * pestaña oculta o fuera de pantalla, y no se mueve nunca con
 * `prefers-reduced-motion`. Desplazamiento nativo con scroll-snap: en tactil
 * se arrastra con el dedo sin capturar el scroll vertical.
 */
export default function CarruselProductos({ eyebrow, titulo, productos }) {
  const pista = useRef(null)
  const seccion = useRef(null)
  const [pausado, setPausado] = useState(false)
  const [visible, setVisible] = useState(false)
  const [sinMovimiento, setSinMovimiento] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    setSinMovimiento(media.matches)
    const onChange = (e) => setSinMovimiento(e.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    const nodo = seccion.current
    if (!nodo) return undefined
    const obs = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.3 })
    obs.observe(nodo)
    return () => obs.disconnect()
  }, [])

  const mover = useCallback((dir) => {
    const nodo = pista.current
    if (!nodo) return
    const tarjeta = nodo.querySelector('li')
    const paso = tarjeta ? tarjeta.getBoundingClientRect().width + 16 : nodo.clientWidth * 0.8
    const alFinal = nodo.scrollLeft + nodo.clientWidth >= nodo.scrollWidth - 8
    if (dir > 0 && alFinal) nodo.scrollTo({ left: 0, behavior: 'smooth' })
    else nodo.scrollBy({ left: dir * paso, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (pausado || !visible || sinMovimiento || (productos?.length || 0) < 2) return undefined
    const id = window.setInterval(() => {
      if (!document.hidden) mover(1)
    }, INTERVALO)
    return () => window.clearInterval(id)
  }, [pausado, visible, sinMovimiento, productos, mover])

  if (!productos?.length) return null

  return (
    <section
      ref={seccion}
      aria-roledescription="carrusel"
      aria-label={titulo}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
      onFocusCapture={() => setPausado(true)}
      onBlurCapture={() => setPausado(false)}
      onPointerDown={() => setPausado(true)}
    >
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          {eyebrow && <p className="rv-eyebrow mb-1.5">{eyebrow}</p>}
          <h2 className="text-onglass font-display text-xl font-bold sm:text-2xl">{titulo}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {[
            [-1, 'Anteriores', 'rotate-180'],
            [1, 'Siguientes', ''],
          ].map(([dir, etq, giro]) => (
            <button
              key={etq}
              type="button"
              onClick={() => mover(dir)}
              aria-label={etq}
              className="rv-solido inline-flex h-11 w-11 cursor-pointer items-center justify-center !rounded-[4px] text-black hover:text-rv-red dark:text-white"
            >
              <IconoFlecha className={`h-4 w-4 ${giro}`} />
            </button>
          ))}
        </div>
      </div>

      <ul ref={pista} className="rv-riel -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:gap-4 sm:px-5">
        {productos.map((p) => (
          <li key={p.id} className="w-[46vw] shrink-0 snap-start xs:w-[44vw] sm:w-[240px] lg:w-[250px]">
            <ProductoCard producto={p} />
          </li>
        ))}
      </ul>

      <div className="mt-5 flex justify-center">
        <Link to="/productos" className="rv-btn-primary min-h-[52px] px-8">
          Ver todos los productos
          <IconoFlecha className="h-5 w-5" />
        </Link>
      </div>
    </section>
  )
}
