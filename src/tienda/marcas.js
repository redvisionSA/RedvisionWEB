import { normalizarTexto } from './formato.js'

/**
 * marcas.js — identidad de las marcas en la tienda.
 * -----------------------------------------------------------------------
 * La tienda conserva la paleta de REDVISION (blanco, negro, rojo de CTA) y
 * deja que cada marca de dispositivos aparezca con SU logo oficial y SU color
 * donde se habla de esa marca: tarjeta, ficha, filtro, portada de marca.
 *
 * Logos: SVG oficiales en public/marcas/ (17/11: sanitizados, sin fondo, con el
 * viewBox ajustado al dibujo y el mismo aire, 3 % del alto, en todos; sin
 * redibujar ni recolorear salvo Imou, cuyo vector vino en negro y lleva el
 * naranja del logo oficial). En el tema oscuro van sobre una placa blanca.
 * Si una marca no tiene logo (`logo: null`), se
 * muestra su nombre en texto, nunca un dibujo propio.
 *
 * Tamaño: nunca se igualan por alto (Hikvision, 7,5:1, se ve enorme al lado de
 * TP-Link, 2,5:1). `medidaLogo` iguala el peso visual con `proporcion` (ancho /
 * alto del viewBox). `tinta` (fraccion del alto que ocupa el dibujo) solo hace
 * falta si un archivo trae aire propio distinto del 3 % parejo.
 *
 * Colores (franjas y detalles): tomados de los archivos oficiales.
 *   Dahua      #326795  azul de su identidad secundaria (decision 13/11: el rojo
 *                       queda para Hikvision y para los botones de REDVISION)
 *   Hikvision  #D71820  rojo del logo oficial (11.png, 1024x137)
 *   Imou       #F08C00
 *   TP-Link    #4ACBD6
 *   EZVIZ      #989A9C  gris del logotipo
 *   Tenda      #E8511B
 */

export const MARCAS_DISPOSITIVOS = [
  {
    clave: 'dahua',
    nombre: 'Dahua Technology',
    color: '#326795',
    logo: '/marcas/dahua.svg',
    proporcion: 130.28 / 40.44,
    oficial: true,
    patron: /dahua/,
    texto: 'Plataforma de referencia: cámaras, grabadores, control de accesos, alarmas y software integrados.',
  },
  {
    clave: 'hikvision',
    nombre: 'Hikvision',
    color: '#D71820',
    logo: '/marcas/hikvision.svg',
    proporcion: 158.7 / 21.17,
    oficial: false,
    patron: /hikvision|hik ?connect|hilook/,
    texto: 'Videovigilancia, grabación y control de accesos Hikvision.',
  },
  {
    clave: 'imou',
    nombre: 'Imou',
    color: '#F08C00',
    logo: '/marcas/imou.svg',
    proporcion: 24.34 / 6.05,
    oficial: false,
    patron: /\bimou\b/,
    texto: 'Cámaras Wi-Fi y seguridad para hogar y pequeño comercio, con aplicación propia.',
  },
  {
    clave: 'ezviz',
    nombre: 'EZVIZ',
    color: '#989A9C',
    logo: null, // el logo vigente (abanico monocromo + EZVIZ en mayusculas) no esta en los archivos: va el nombre
    oficial: false,
    patron: /ezviz/,
    texto: 'Cámaras Wi-Fi, timbres y seguridad inteligente para hogar y comercio.',
  },
  {
    clave: 'tp-link',
    nombre: 'TP-Link',
    color: '#4ACBD6',
    logo: '/marcas/tp-link.svg',
    proporcion: 429.6 / 169.6,
    oficial: false,
    patron: /tp[\s-]?link|omada|vigi/,
    texto: 'Switches PoE, routers, Wi-Fi y enlaces para la red de cada instalación.',
  },
  {
    clave: 'tenda',
    nombre: 'Tenda',
    color: '#E8511B',
    logo: '/marcas/tenda.svg',
    proporcion: 2532.04 / 566.1,
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

/**
 * Medida optica de un logo para un renglon de `alto` px: iguala el area
 * aparente (alto * raiz(3,4 / proporcion), con 3,4 = un logo «tipico» como
 * Dahua o EZVIZ), compensa el aire transparente del archivo (`tinta`) y
 * respeta `anchoMax`. Devuelve alto y ancho del <img> (tambien sirven de
 * width/height: el lugar queda reservado y no hay saltos al cargar).
 */
export function medidaLogo(id, alto, anchoMax = Infinity) {
  const factor = Math.min(1.15, Math.max(0.6, Math.sqrt(3.4 / id.proporcion)))
  let h = Math.min(alto * 1.2, (alto * factor) / (id.tinta || 1))
  if (h * id.proporcion > anchoMax) h = anchoMax / id.proporcion
  return { alto: Math.round(h * 2) / 2, ancho: Math.round(h * id.proporcion) }
}
