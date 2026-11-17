/**
 * iared.js
 * -----------------------------------------------------------------------
 * Unico lugar con los datos de IARED: la empresa aparte e independiente que
 * se ocupa de los proyectos (relevamiento, ingenieria, integracion, puesta en
 * marcha, capacitacion de obra). REDVISION ya no los ofrece: la tienda solo
 * le da visibilidad y deriva a los interesados.
 *
 * Todavia no hay datos reales de IARED (marca en construccion). Mientras un
 * campo sea `null`:
 *   - sin `url`, `whatsapp` ni `email`, el boton abre el WhatsApp de REDVISION
 *     con el texto armado de `RESPALDO_TEXTO` y la pagina lo informa;
 *   - sin `logo`, se muestra el nombre «IARED» en tipografia.
 * No inventar dominio, logo ni contacto: completarlos aca cuando lleguen.
 * Limite entre empresas: nada de REDVISION ni de Control Red va en este objeto.
 */

import { enlaceWhatsapp } from '../tienda/whatsapp.js'

export const IARED = {
  nombre: 'IARED',
  /** Sitio propio, p. ej. 'https://…' (sin barra final). */
  url: null,
  /** Numero en formato internacional sin signos, p. ej. '54911…'. */
  whatsapp: null,
  email: null,
  /** Ruta en public/ o URL absoluta de un SVG/WebP con fondo transparente. */
  logo: null,
}

export const RESPALDO_TEXTO = 'Hola REDVISION, quiero que IARED me contacte por un proyecto.'

/**
 * A donde manda el boton de IARED. Prioridad: sitio, WhatsApp, correo y, si
 * no hay ninguno, el WhatsApp de REDVISION (respaldo temporal y honesto).
 */
export function contactoIared() {
  if (IARED.url) return { href: IARED.url, externo: true, respaldo: false, via: 'sitio' }
  if (IARED.whatsapp) {
    const texto = 'Hola IARED, llego desde la tienda de REDVISION y quisiera consultar por un proyecto.'
    return { href: `https://wa.me/${IARED.whatsapp}?text=${encodeURIComponent(texto)}`, externo: true, respaldo: false, via: 'whatsapp' }
  }
  if (IARED.email) return { href: `mailto:${IARED.email}?subject=${encodeURIComponent('Consulta por un proyecto')}`, externo: false, respaldo: false, via: 'correo' }
  return { href: enlaceWhatsapp(RESPALDO_TEXTO), externo: true, respaldo: true, via: 'whatsapp' }
}

export default IARED
