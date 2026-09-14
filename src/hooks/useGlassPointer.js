import { useCallback, useRef } from 'react'

/**
 * Escribe la posicion del cursor dentro del elemento en las variables CSS
 * --mx y --my. El pseudo-elemento .glass::before las usa para dibujar el
 * reflejo especular que sigue al puntero.
 *
 * Opcionalmente aplica una inclinacion 3D sutil (tilt) hacia el cursor.
 *
 * Se escribe directo en el DOM con requestAnimationFrame: no dispara
 * re-render de React en cada movimiento.
 */
export default function useGlassPointer({ tilt = 0, enabled = true } = {}) {
  const ref = useRef(null)
  const frame = useRef(0)

  const onPointerMove = useCallback(
    (event) => {
      if (!enabled || !ref.current) return
      const node = ref.current
      const rect = node.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => {
        node.style.setProperty('--mx', `${x}px`)
        node.style.setProperty('--my', `${y}px`)

        if (tilt > 0) {
          const px = (x / rect.width - 0.5) * 2 // [-1, 1]
          const py = (y / rect.height - 0.5) * 2
          /* La inclinacion va acompanada de una elevacion de 3 px. Sin ese
             desplazamiento el giro se lee como una deformacion; con el, se
             lee como un objeto que se levanta hacia el cursor. */
          node.style.transform =
            `perspective(1100px)` +
            ` rotateX(${(-py * tilt).toFixed(2)}deg)` +
            ` rotateY(${(px * tilt).toFixed(2)}deg)` +
            ` translate3d(0, -3px, 0)`
        }
      })
    },
    [enabled, tilt]
  )

  const onPointerLeave = useCallback(() => {
    if (!ref.current) return
    cancelAnimationFrame(frame.current)
    ref.current.style.setProperty('--mx', '50%')
    ref.current.style.setProperty('--my', '0%')
    if (tilt > 0) ref.current.style.transform = ''
  }, [tilt])

  return { ref, onPointerMove, onPointerLeave }
}
