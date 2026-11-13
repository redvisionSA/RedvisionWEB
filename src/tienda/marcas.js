import { normalizarTexto } from './formato.js'

/**
 * marcas.js — identidad de las marcas en la tienda.
 * -----------------------------------------------------------------------
 * La tienda conserva la paleta de REDVISION (blanco, negro, rojo de CTA) y
 * deja que cada marca de dispositivos aparezca con SU logo oficial y SU color
 * donde se habla de esa marca: tarjeta, ficha, filtro, portada de marca.
 *
 * Logos: archivos oficiales en public/marcas/ (provistos por la empresa, sin
 * redibujar ni recolorear; siempre sobre blanco). Si una marca no tiene logo
 * (`logo: null`), se muestra su nombre en texto, nunca un dibujo propio.
 *
 * Colores (franjas y detalles): tomados de los archivos oficiales.
 *   Dahua      #326795  azul de su identidad secundaria (decision 13/11: el rojo
 *                       queda para Hikvision y para los botones de REDVISION)
 *   Hikvision  #D71820  rojo del logo oficial (11.png, 1024x137)
 *   Imou       #F08C00
 *   TP-Link    #4ACBD6
 *   EZVIZ      #989A9C  gris del logotipo (el isotipo es multicolor)
 *   Tenda      #E8511B
 */

export const MARCAS_DISPOSITIVOS = [
  {
    clave: 'dahua',
    nombre: 'Dahua Technology',
    color: '#326795',
    logo: '/marcas/dahua.svg',
    proporcion: 2560 / 762,
    oficial: true,
    patron: /dahua/,
    texto: 'Plataforma de referencia: cámaras, grabadores, control de accesos, alarmas y software integrados.',
  },
  {
    clave: 'hikvision',
    nombre: 'Hikvision',
    color: '#D71820',
    logo: '/marcas/hikvision.png',
    proporcion: 1024 / 137,
    oficial: false,
    patron: /hikvision|hik ?connect|hilook/,
    texto: 'Videovigilancia, grabación y control de accesos Hikvision.',
  },
  {
    clave: 'imou',
    nombre: 'Imou',
    color: '#F08C00',
    logo: '/marcas/imou.png',
    proporcion: 300 / 81,
    oficial: false,
    patron: /\bimou\b/,
    texto: 'Cámaras Wi-Fi y seguridad para hogar y pequeño comercio, con aplicación propia.',
  },
  {
    clave: 'ezviz',
    nombre: 'EZVIZ',
    color: '#989A9C',
    logo: '/marcas/ezviz.webp',
    proporcion: 2000 / 619,
    oficial: false,
    patron: /ezviz/,
    texto: 'Cámaras Wi-Fi, timbres y seguridad inteligente para hogar y comercio.',
  },
  {
    clave: 'tp-link',
    nombre: 'TP-Link',
    color: '#4ACBD6',
    logo: '/marcas/tp-link.png',
    proporcion: 1280 / 488,
    oficial: false,
    patron: /tp[\s-]?link|omada|vigi/,
    texto: 'Switches PoE, routers, Wi-Fi y enlaces para la red de cada instalación.',
  },
  {
    clave: 'tenda',
    nombre: 'Tenda',
    color: '#E8511B',
    logo: '/marcas/tenda.webp',
    proporcion: 2000 / 428,
    oficial: false,
    patron: /\btenda\b/,
    texto: 'Routers, switches y enlaces inalámbricos para hogar y pyme.',
  },
]

/* Marcas que no se muestran: el producto se ofrece por lo que es, sin
   etiquetas que resten confianza. Van siempre a "Accesorios". */
const GENERICA = /gen[eé]ric|sin marca|alternativ|\boem\b|\bvarios\b|otras? marcas?|no especificad|\bs\/m\b|\bnn\b|importad/

export function esGenerica(marca) {
  if (!marca) return true
  const t = normalizarTexto(`${marca.slug || ''} ${marca.name || marca.nombre || ''}`)
  return GENERICA.test(t)
}

export function identidadDe(marca) {
  if (!marca) return null
  const t = normalizarTexto(`${marca.slug || ''} ${marca.nombre || marca.name || ''}`)
  return MARCAS_DISPOSITIVOS.find((m) => m.patron.test(t)) || null
}
