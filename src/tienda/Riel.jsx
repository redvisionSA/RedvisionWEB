import { useRef } from 'react'
import { Link } from 'react-router-dom'
import ProductoCard from './ProductoCard.jsx'
import { IconoFlecha } from './Iconos.jsx'

/**
 * Riel horizontal de productos (destacados, vistos, complementos).
 * Desplazamiento nativo con scroll-snap: en tactil se arrastra con el dedo
 * sin capturar el scroll vertical; en escritorio hay flechas.
 */
export default function Riel({ eyebrow, titulo, productos, verTodo, className = '' }) {
  const pista = useRef(null)
  if (!productos?.length) return null

  const mover = (dir) => {
    const nodo = pista.current
    if (nodo) nodo.scrollBy({ left: dir * nodo.clientWidth * 0.85, behavior: 'smooth' })
  }

  return (
    <section className={className}>
      <div className="mb-4 flex items-end justify-between gap-4 px-1">
        <div>
          {eyebrow && <p className="rv-eyebrow mb-1.5">{eyebrow}</p>}
          <h2 className="text-onglass font-display text-xl font-bold sm:text-2xl">{titulo}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {verTodo && (
            <Link to={verTodo} className="rv-link hidden font-display text-xs font-semibold uppercase tracking-wide sm:inline">
              Ver todo
            </Link>
          )}
          <button
            type="button"
            onClick={() => mover(-1)}
            aria-label="Anteriores"
            className="rv-solido hidden h-10 w-10 cursor-pointer items-center justify-center !rounded-full text-black hover:text-rv-red dark:text-white md:inline-flex"
          >
            <IconoFlecha className="h-4 w-4 rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => mover(1)}
            aria-label="Siguientes"
            className="rv-solido hidden h-10 w-10 cursor-pointer items-center justify-center !rounded-full text-black hover:text-rv-red dark:text-white md:inline-flex"
          >
            <IconoFlecha className="h-4 w-4" />
          </button>
        </div>
      </div>
      <ul
        ref={pista}
        className="rv-riel -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:gap-4 sm:px-5"
      >
        {productos.map((p) => (
          <li key={p.id} className="w-[46vw] shrink-0 snap-start xs:w-[44vw] sm:w-[240px] lg:w-[250px]">
            <ProductoCard producto={p} />
          </li>
        ))}
      </ul>
    </section>
  )
}
