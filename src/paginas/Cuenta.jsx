import { Link } from 'react-router-dom'
import { Migas } from '../tienda/piezas.jsx'
import { enlaceConsulta } from '../tienda/whatsapp.js'
import { IconoWhatsapp } from '../tienda/Iconos.jsx'
import Pagina, { usePagina } from './Pagina.jsx'

/**
 * Ingreso de clientes. Todavia no hay usuarios en la tienda: el precio
 * publicado es Gremio para todos y las listas mayorista y distribuidor
 * llegan con el inicio de sesion (fase siguiente, resuelto en el ERP). Esta
 * pagina lo dice tal cual y ofrece abrir la cuenta; no muestra un formulario
 * de ingreso que todavia no funciona.
 */
export default function Cuenta() {
  usePagina({ titulo: 'Ingresar', descripcion: 'Acceso de clientes mayoristas y distribuidores de REDVISION.' })
  return (
    <Pagina>
      <Migas items={[{ label: 'Inicio', to: '/' }, { label: 'Ingresar' }]} />
      <div className="rv-solido mx-auto max-w-xl p-6 text-center sm:p-10">
        <h1 className="font-display text-2xl font-bold text-black dark:text-white sm:text-3xl">Acceso de clientes</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-black/70 dark:text-white/70">
          Los precios de la tienda son de lista Gremio, finales con IVA. Las cuentas mayoristas y de distribuidor
          van a ver su propia lista al ingresar: el acceso con usuario se habilita próximamente.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={enlaceConsulta('mayorista')} target="_blank" rel="noopener noreferrer" className="rv-btn-primary">
            <IconoWhatsapp className="h-4 w-4" />
            Solicitar cuenta mayorista
          </a>
          <Link
            to="/productos"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-black/15 px-6 text-sm font-semibold text-black hover:border-rv-red hover:text-rv-red dark:border-white/20 dark:text-white"
          >
            Ver todos los productos
          </Link>
        </div>
      </div>
    </Pagina>
  )
}
