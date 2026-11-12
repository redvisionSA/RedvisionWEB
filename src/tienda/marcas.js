import { normalizarTexto } from './formato.js'

/**
 * marcas.js — identidad de las marcas en la tienda.
 * -----------------------------------------------------------------------
 * La tienda conserva la paleta de REDVISION (blanco, negro, rojo de CTA) y
 * deja que cada marca de dispositivos aparezca con SU logo oficial y SU color
 * donde se habla de esa marca: tarjeta, ficha, filtro, portada de marca.
 *
 * Logos: archivos oficiales en public/marcas/. Si un logo no esta cargado
 * (`logo: null`), la tienda muestra el nombre en texto, nunca un dibujo propio
 * de la marca.
 *   - dahua.svg      cargado (archivo oficial de img/dahuaLogo.svg)
 *   - hikvision.svg  PENDIENTE: lo coloca la empresa (manual de marca)
 *   - imou.svg       PENDIENTE: lo coloca la empresa (manual de marca)
 *
 * Colores: solo el que figura en el archivo oficial. Dahua #E50214 sale del
 * SVG oficial. Hikvision e Imou quedan en `null` (grafito) hasta tener su
 * archivo: el color se toma de ahi, no se adivina.
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
    color: null,
    logo: null,
    proporcion: 4,
    oficial: false,
    patron: /hikvision|hik ?connect|hilook/,
    texto: 'Videovigilancia, grabación y control de accesos Hikvision.',
  },
  {
    clave: 'imou',
    nombre: 'Imou',
    color: null,
    logo: null,
    proporcion: 2.6,
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
