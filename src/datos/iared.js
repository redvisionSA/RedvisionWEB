/**
 * iared.js
 * -----------------------------------------------------------------------
 * Unico lugar con los datos de IARED: la marca (con manual propio) que
 * se ocupa de los proyectos (relevamiento, ingenieria, integracion, puesta en
 * marcha, capacitacion de obra). REDVISION ya no los ofrece: la tienda solo
 * le da visibilidad y deriva a los interesados.
 *
 * Marca: manual de marca de IARED v1.0 (17/11/2026). Logo oficial con
 * eslogan en public/iared/ (copiado tal cual del manual, revisado: sin
 * scripts ni referencias externas). Colores y tipografia en el CSS de
 * `.iared-zona`. Contacto: el manual no trae ningun dato real (la tarjeta de
 * ejemplo usa «nombre@iared.com» y «+00 000…», que son marcadores). Mientras un
 * campo de contacto sea `null`:
 *   - sin `url`, `whatsapp` ni `email`, el boton abre el WhatsApp de REDVISION
 *     con el texto armado de `RESPALDO_TEXTO` y la pagina lo informa;
 *   - sin `logo`, se muestra el nombre «IARED» en tipografia.
 * No inventar dominio ni contacto: completarlos aca cuando lleguen.
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
  /** Logo con eslogan del manual: a color sobre fondos claros, negativo sobre
      Noche/Tinta. Minimo 160 px de ancho; resguardo de 2X (X = trazo = 28 de
      606 unidades del viewBox) alrededor. No redibujar ni recolorear. */
  logo: {
    claro: '/iared/iared-logo-eslogan-color.svg',
    oscuro: '/iared/iared-logo-eslogan-negativo.svg',
    ancho: 606,
    alto: 248,
  },
  /** Eslogan aprobado (manual, «Tono de voz»): con I, A y Red en mayuscula. */
  eslogan: 'Inteligencia Aplicada a la Red',
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
