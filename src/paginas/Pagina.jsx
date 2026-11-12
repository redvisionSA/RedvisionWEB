import { useEffect, useState } from 'react'

const SITIO = 'REDVISION'
const DESCRIPCION_BASE =
  'Tienda de equipamiento de seguridad electrónica: videovigilancia, control de accesos, detección de intrusión, redes y energía. Precios con IVA, envíos a todo el país y asesoramiento técnico.'

function fijarMeta(nombre, valor, atributo = 'name') {
  let nodo = document.head.querySelector(`meta[${atributo}="${nombre}"]`)
  if (!nodo) {
    nodo = document.createElement('meta')
    nodo.setAttribute(atributo, nombre)
    document.head.appendChild(nodo)
  }
  nodo.setAttribute('content', valor)
}

/** Titulo, descripcion y canonica por ruta (SPA: lo leen navegadores y Google al renderizar). */
export function usePagina({ titulo, descripcion } = {}) {
  useEffect(() => {
    const tituloCompleto = titulo ? `${titulo} | ${SITIO}` : `${SITIO} | Tienda de seguridad electrónica`
    document.title = tituloCompleto
    fijarMeta('description', descripcion || DESCRIPCION_BASE)
    fijarMeta('og:title', tituloCompleto, 'property')
    fijarMeta('og:description', descripcion || DESCRIPCION_BASE, 'property')
    const canonica = document.head.querySelector('link[rel="canonical"]')
    if (canonica) canonica.setAttribute('href', `https://redvision.com.ar${window.location.pathname}`)
  }, [titulo, descripcion])
}

/** Contenedor de pagina interior: deja lugar a la barra de dos filas. */
export default function Pagina({ children, className = '' }) {
  return (
    <div className={`mx-auto max-w-[1400px] px-4 pb-10 pt-[148px] sm:px-5 md:pt-[112px] lg:pt-[168px] ${className}`}>
      {children}
    </div>
  )
}

/* Resumen de reseñas de Google (public/resenas.json), compartido. */
let cacheResenas = null
export function useResenas() {
  const [datos, setDatos] = useState(cacheResenas)
  useEffect(() => {
    if (cacheResenas) return undefined
    let vivo = true
    fetch('/resenas.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        cacheResenas = json
        if (vivo) setDatos(json)
      })
      .catch(() => {})
    return () => {
      vivo = false
    }
  }, [])
  return datos
}
