import { normalizarTexto } from './formato.js'

/**
 * marcas.js — identidad de las marcas en la tienda.
 * -----------------------------------------------------------------------
 * La tienda conserva la paleta de REDVISION (blanco, negro, rojo de CTA) y
 * deja que cada marca de dispositivos aparezca con SU logo oficial y SU color
 * donde se habla de esa marca: tarjeta, ficha, filtro, portada de marca.
 *
 * Logos: archivos oficiales en public/marcas/ (provistos por la empresa). Si
 * un logo no esta cargado (`logo: null`), la tienda muestra el nombre en
 * texto, nunca un dibujo propio de la marca.
 *   - dahua.svg              color, vectorial (img/dahuaLogo.svg)
 *   - hikvision.webp         color, 240x30: para tamaños chicos sobre blanco
 *   - hikvision-blanco.png   negativo 1520x192: sobre el rojo de la marca,
 *                            para tamaños grandes (no se pixela)
 *   - imou.png               color, 300x81 (recortado del original, sin
 *                            alterar el color)
 *
 * Colores: tomados de los archivos oficiales. Dahua #E50214 (del SVG), Imou
 * #F08C00 (del PNG). Hikvision #D8171F se midio sobre el WebP (con perdida):
 * confirmarlo con el manual de marca si se consigue el vectorial.
 */

export const MARCAS_DISPOSITIVOS = [
  {
    clave: 'dahua',
    nombre: 'Dahua Technology',
    color: '#E50214',
    logo: '/marcas/dahua.svg',
    proporcion: 2560 / 762,
    oficial: true,
    patron: /dahua/,
    texto: 'Plataforma de referencia: cámaras, grabadores, control de accesos, alarmas y software integrados.',
  },
  {
    clave: 'hikvision',
    nombre: 'Hikvision',
    color: '#D8171F',
    logo: '/marcas/hikvision.webp',
    logoNegativo: '/marcas/hikvision-blanco.png',
    altoMaximoLogo: 24,
    proporcion: 8,
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
