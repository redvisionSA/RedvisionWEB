import { LINEAS_CATALOGO } from '../components/Servicios.jsx'

/**
 * lineas.js
 * -----------------------------------------------------------------------
 * Las seis lineas de producto del sitio institucional son la puerta de
 * entrada de la tienda: cada una funciona como departamento.
 *
 * El ERP tiene su propio arbol de categorias (mas fino y cambiante). La web
 * no lo replica: ubica cada categoria del ERP dentro de una de las seis lineas
 * por palabras clave. Lo que no encaja cae en "accesorios", nunca se pierde.
 */

export const LINEAS = LINEAS_CATALOGO

const REGLAS = [
  ['accesorios', /^accesorios\b|soporte|caja de (conexi|paso)|conector|ficha|balun|herramienta|crimp|canaliz|instrumental|tester|rotul/i],
  ['cctv', /c[aá]mara|domo|bullet|ptz|nvr|xvr|dvr|grabador|disco|video|cctv|lente|monitor|hdcvi|ip\b/i],
  /* acceso(?!ri): "accesorios" no es control de accesos */
  ['accesos', /acceso(?!ri)|lector|biom|facial|cerradura|molinete|barrera vehicular|portero|intercom|presentismo|tarjeta|llavero/i],
  ['alarmas', /alarma|intrusi|panel|sensor|detector|sirena|infrarroj|pir\b|magn[eé]tico/i],
  ['redes', /red(es)?\b|switch|router|enrutador|wifi|inal[aá]mbric|antena|enlace|utp|cable|fibra|patch|rack/i],
  ['energia', /fuente|ups|bater[ií]a|energ[ií]a|transformador|protector|estabilizador/i],
]

function clasificar(texto) {
  for (const [linea, regla] of REGLAS) {
    if (regla.test(texto)) return linea
  }
  return null
}

/* Manda la categoria del ERP; el nombre del producto solo desempata cuando la
   categoria no dice nada ("Soporte para domo" es accesorio, no camara). */
export function lineaDe(textoCategoria = '', nombre = '') {
  return clasificar(textoCategoria) || clasificar(nombre) || 'accesorios'
}

export function lineaPorId(id) {
  return LINEAS.find((l) => l.id === id) || null
}

/* Venta cruzada honesta: lo que una instalacion real necesita al lado del
   producto principal. No es "otros compraron", es criterio tecnico. */
export const COMPLEMENTOS = {
  cctv: ['redes', 'energia', 'accesorios'],
  accesos: ['energia', 'accesorios', 'redes'],
  alarmas: ['energia', 'accesorios'],
  redes: ['accesorios', 'energia'],
  energia: ['accesorios'],
  accesorios: ['cctv', 'redes'],
}
