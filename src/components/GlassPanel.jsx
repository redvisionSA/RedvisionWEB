import { forwardRef, useEffect, useRef } from 'react'
import useGlassPointer from '../hooks/useGlassPointer.js'
import { useSite } from '../context/SiteContext.jsx'

/**
 * GlassPanel — primitiva de material "Liquid Glass".
 *
 * Props:
 *  variant  'default' | 'thin' | 'strong' | 'chrome'
 *           'chrome' es el material de navbar y footer: mas vidrioso y, en
 *           dark mode, notablemente mas claro, para que el logotipo de
 *           REDVISION se lea sobre el.
 *  tilt     grados de inclinacion 3D hacia el cursor (0 = sin tilt)
 *  active   pinta el canto con el rojo institucional
 *  as       etiqueta o componente a renderizar (div por defecto)
 */
const VARIANTES = {
  default: 'glass',
  thin: 'glass-thin',
  strong: 'glass-strong',
  chrome: 'glass-chrome',
}

const GlassPanel = forwardRef(function GlassPanel(
  { as: Tag = 'div', variant = 'default', tilt = 0, active = false, className = '', children, ...rest },
  externalRef
) {
  const { canHover } = useSite()
  const { ref, onPointerMove, onPointerLeave } = useGlassPointer({
    tilt: canHover ? tilt : 0,
    enabled: canHover,
  })

  /* Vidrio bajo demanda.
     `backdrop-filter` obliga al navegador a desenfocar el fondo detras de cada
     panel, en cada frame. Con quince teselas eso son quince desenfoques vivos
     durante todo el scroll. Aca el filtro se enciende cuando la tesela se
     acerca al viewport y se apaga cuando se aleja: el aspecto no cambia y el
     hilo de composicion deja de trabajar por lo que nadie esta mirando. */
  const observado = useRef(null)
  useEffect(() => {
    const node = observado.current
    if (!node || variant === 'chrome') return undefined
    const observer = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) node.setAttribute('data-vidrio', 'on')
        else node.removeAttribute('data-vidrio')
      },
      { rootMargin: '25%' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [variant])

  return (
    <Tag
      ref={(node) => {
        ref.current = node
        observado.current = node
        if (typeof externalRef === 'function') externalRef(node)
        else if (externalRef) externalRef.current = node
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`${VARIANTES[variant] || VARIANTES.default} ${active ? 'glass-active' : ''} ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
})

export default GlassPanel
