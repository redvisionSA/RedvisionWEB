import { Link } from 'react-router-dom'
import { useTienda } from './TiendaContext.jsx'
import { MARCAS_DISPOSITIVOS } from './marcas.js'
import { LogoMarca } from './piezas.jsx'
import { IconoFlecha } from './Iconos.jsx'

/**
 * Cinta automatica de marcas: avanza sola y en bucle (la lista va dos veces y
 * la animacion recorre la mitad), se detiene con el cursor o el foco y queda
 * quieta con `prefers-reduced-motion` (ahi se recorre con el dedo o el
 * teclado). Cada tarjeta lleva a los productos de esa marca.
 */
function Tarjeta({ item, oculta }) {
  const { id, slug, n, marca } = item
  const comun = 'rv-solido rv-solido-hover group relative flex h-full w-[240px] shrink-0 flex-col overflow-hidden px-5 pb-5 pt-9 sm:w-[270px]'
  const contenido = id ? (
    <>
      <span className="absolute inset-x-0 top-0 h-1" style={{ background: id.color || '#0b0b0d' }} aria-hidden="true" />
      {/* Pastilla de medida fija: todas las marcas ocupan el mismo lugar y pesan lo mismo a la vista */}
      <span className="flex h-12 items-center">
        <LogoMarca marca={marca} alto={26} anchoMax={144} conChip caja="h-12 w-[172px]" />
      </span>
      <span className="mt-3 line-clamp-2 text-sm leading-relaxed text-black/70 dark:text-white/70">{id.texto}</span>
      <span className="mt-auto flex items-center justify-between pt-4 font-display text-xs font-semibold uppercase tracking-wide text-black dark:text-white">
        {n > 0 ? `Ver ${n} productos` : 'Ver productos'}
        <IconoFlecha className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
      {id.oficial && (
        <span className="absolute right-3 top-2.5 rounded-md bg-black px-2 py-1 font-display text-[9px] font-bold uppercase tracking-[0.14em] text-white dark:bg-white dark:text-black">
          Distribuidor oficial
        </span>
      )}
    </>
  ) : (
    <>
      <span className="absolute inset-x-0 top-0 h-1 bg-black dark:bg-white" aria-hidden="true" />
      <span className="flex h-12 items-center font-display text-xl font-bold text-black dark:text-white">Accesorios</span>
      <span className="mt-3 line-clamp-2 text-sm leading-relaxed text-black/70 dark:text-white/70">
        Soportes, conectores, cableado, energía e instrumental de las principales marcas.
      </span>
      <span className="mt-auto flex items-center justify-between pt-4 font-display text-xs font-semibold uppercase tracking-wide text-black dark:text-white">
        Ver accesorios
        <IconoFlecha className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </>
  )
  return (
    <li className="flex" aria-hidden={oculta || undefined}>
      <Link to={id ? `/productos?marca=${encodeURIComponent(slug)}` : '/productos/accesorios'} className={comun} tabIndex={oculta ? -1 : undefined}>
        {contenido}
      </Link>
    </li>
  )
}

export default function CarruselMarcas() {
  const { catalogo } = useTienda()
  const { marcas, productos } = catalogo.datos
  const items = [
    ...MARCAS_DISPOSITIVOS.map((id) => {
      const enCatalogo = marcas.find((m) => m.identidad?.clave === id.clave)
      const slug = enCatalogo?.slug || id.clave
      const n = productos.filter((p) => p.marca?.identidad?.clave === id.clave).length
      return { clave: id.clave, id, slug, n, marca: enCatalogo || { slug, nombre: id.nombre, identidad: id } }
    }),
    { clave: 'accesorios' },
  ]

  return (
    <section aria-labelledby="titulo-marcas">
      <div className="mb-4 px-1">
        <p className="rv-eyebrow mb-1.5">Marcas</p>
        <h2 id="titulo-marcas" className="text-onglass font-display text-xl font-bold sm:text-2xl">
          Las marcas líderes de la seguridad electrónica
        </h2>
      </div>
      <div className="rv-riel -mx-4 overflow-hidden px-4 py-1 motion-reduce:overflow-x-auto sm:-mx-5 sm:px-5">
        <ul className="flex w-max animate-rv-marquee gap-4 hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none">
          {[...items, ...items, ...items, ...items].map((item, i) => (
            <Tarjeta key={`${item.clave}-${i}`} item={item} oculta={i >= items.length} />
          ))}
        </ul>
      </div>
    </section>
  )
}
