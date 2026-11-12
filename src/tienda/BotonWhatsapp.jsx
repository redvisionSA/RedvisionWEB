import { useLocation } from 'react-router-dom'
import { useTienda } from './TiendaContext.jsx'
import { enlaceWhatsapp, mensajeProducto } from './whatsapp.js'
import { IconoWhatsapp } from './Iconos.jsx'

/**
 * Acceso flotante a un asesor. En la ficha de producto el mensaje ya trae
 * el producto: quien escribe no tiene que explicar que estaba mirando.
 * En telefono, en la ficha, sube para no tapar la barra fija de compra.
 */
export default function BotonWhatsapp() {
  const { pathname } = useLocation()
  const { catalogo } = useTienda()

  const slug = pathname.startsWith('/producto/') ? decodeURIComponent(pathname.slice('/producto/'.length)) : null
  const producto = slug ? catalogo.datos.porSlug.get(slug) : null
  const texto = producto ? mensajeProducto(producto) : 'Hola, quisiera hacer una consulta desde la tienda web.'

  if (pathname === '/carrito') return null

  return (
    <a
      href={enlaceWhatsapp(texto)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultar por WhatsApp"
      title="Consultar por WhatsApp"
      className={`group fixed right-4 z-[70] inline-flex h-14 items-center gap-2 rounded-pill bg-black px-4 text-white shadow-[0_14px_34px_-12px_rgba(0,0,0,0.6)]
                  transition-all duration-300 ease-apple hover:bg-rv-red active:scale-95 dark:bg-white dark:text-black dark:hover:bg-rv-red dark:hover:text-white sm:bottom-5 sm:right-5
                  ${producto ? 'bottom-[88px]' : 'bottom-4'}`}
    >
      <IconoWhatsapp className="h-6 w-6" />
      <span className="hidden font-display text-xs font-semibold uppercase tracking-wide md:inline">Asesor en línea</span>
    </a>
  )
}
