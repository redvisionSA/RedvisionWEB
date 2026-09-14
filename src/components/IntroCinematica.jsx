import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useProgress } from '@react-three/drei'
import * as THREE from 'three'
import {
  distanciaCamara,
  Entorno,
  LimiteModelo,
  ModeloRobot,
  RobotProxy,
  SombraContacto,
} from './RobotDahua.jsx'

/**
 * IntroCinematica
 * -----------------------------------------------------------------------
 * Resuelve el render disparejo: la pagina ya no aparece antes que el robot.
 *
 * Secuencia:
 *   1. cargando  El overlay ocupa la pantalla. Se descarga y parsea el GLB.
 *                No hay espera fija: termina cuando el modelo esta listo.
 *   2. zoom      Zoom out de camara de 1200 ms, del primer plano del objetivo
 *                al encuadre completo del robot.
 *   3. saliendo  Se captura el ultimo frame del canvas, se desmonta el canvas
 *                de la intro y la imagen se desvanece sobre la pagina ya
 *                montada. Asi nunca hay dos contextos WebGL vivos a la vez.
 *
 * Techo de seguridad: si a los 6000 ms el modelo no cargo, la intro se corta
 * y la pagina aparece igual. Nadie se queda mirando una pantalla negra.
 */

const DURACION_ZOOM = 1200 // ms
const DURACION_SALIDA = 520 // ms
const ESPERA_MINIMA = 260 // ms; evita un parpadeo si el GLB ya esta en cache
const TECHO_SEGURIDAD = 6000 // ms

const Y_CERCA = 0.198
const Y_LEJOS = 0.155
const FOV_CERCA = 26
const FOV_LEJOS = 32
/* Proporcion del encuadre final a la que arranca el primer plano del objetivo */
const FACTOR_CERCA = 0.4

/* easeInOutCubic: arranca y termina suave, como una optica motorizada */
function suavizado(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/* ------------------------------------------------------------------ camara */
function CamaraZoom({ activa, onCompleto }) {
  const { camera, size, invalidate } = useThree()
  const inicio = useRef(null)
  const terminado = useRef(false)

  /* El encuadre final depende del formato de pantalla: en un telefono
     vertical el robot necesita mas distancia para no salirse por los lados. */
  const zLejos = useMemo(
    () => distanciaCamara(size.width / Math.max(size.height, 1), FOV_LEJOS),
    [size.width, size.height]
  )
  const zCerca = zLejos * FACTOR_CERCA

  /* Pose inicial: primer plano del objetivo */
  useEffect(() => {
    if (terminado.current) return
    camera.position.set(0, Y_CERCA, zCerca)
    camera.fov = FOV_CERCA
    camera.updateProjectionMatrix()
    camera.lookAt(0, Y_CERCA, 0)
    invalidate()
  }, [camera, zCerca, invalidate])

  useFrame(() => {
    if (!activa || terminado.current) return
    if (inicio.current === null) inicio.current = performance.now()

    const t = Math.min(1, (performance.now() - inicio.current) / DURACION_ZOOM)
    const e = suavizado(t)

    camera.position.y = THREE.MathUtils.lerp(Y_CERCA, Y_LEJOS, e)
    camera.position.z = THREE.MathUtils.lerp(zCerca, zLejos, e)
    camera.fov = THREE.MathUtils.lerp(FOV_CERCA, FOV_LEJOS, e)
    camera.updateProjectionMatrix()
    camera.lookAt(0, THREE.MathUtils.lerp(Y_CERCA, 0.15, e), 0)

    if (t >= 1) {
      terminado.current = true
      onCompleto()
    }
  })

  return null
}

/* -------------------------------------------------------------- capturador */
/** Expone una funcion que devuelve el ultimo frame como data URL. */
function Capturador({ registrar }) {
  const { gl } = useThree()
  useEffect(() => {
    registrar(() => {
      try {
        return gl.domElement.toDataURL('image/webp', 0.9)
      } catch (e) {
        return null
      }
    })
    return () => registrar(null)
  }, [gl, registrar])
  return null
}

/* ===================================================================== */
export default function IntroCinematica({ onModeloListo, onFin }) {
  const [fase, setFase] = useState('cargando') // cargando | zoom | saliendo
  const [snapshot, setSnapshot] = useState(null)
  const capturar = useRef(null)
  const montado = useRef(performance.now())
  const { progress } = useProgress()

  const registrarCapturador = useCallback((fn) => {
    capturar.current = fn
  }, [])

  /* Durante la intro el robot no reacciona a nada: la camara es la que se
     mueve. Estos controles inertes mantienen la cabeza en su pose de reposo. */
  const controlesInertes = useMemo(
    () => ({
      objetivo: { current: { pan: 0, tilt: 0 } },
      ultimaInteraccion: { current: Infinity },
      notificar: { current: null },
    }),
    []
  )

  /* El modelo termino de montarse: arranca el zoom, respetando la espera minima */
  const alListo = useCallback(() => {
    if (onModeloListo) onModeloListo()
    const transcurrido = performance.now() - montado.current
    const resto = Math.max(0, ESPERA_MINIMA - transcurrido)
    window.setTimeout(() => setFase((f) => (f === 'cargando' ? 'zoom' : f)), resto)
  }, [onModeloListo])

  /* Techo de seguridad */
  useEffect(() => {
    const id = window.setTimeout(() => {
      setFase((f) => (f === 'saliendo' ? f : 'saliendo'))
    }, TECHO_SEGURIDAD)
    return () => window.clearTimeout(id)
  }, [])

  /* Fin del zoom: snapshot, desmontaje del canvas y desvanecido */
  const alTerminarZoom = useCallback(() => {
    const imagen = capturar.current ? capturar.current() : null
    setSnapshot(imagen)
    setFase('saliendo')
  }, [])

  /* Durante 'saliendo' la pagina ya esta montada debajo */
  useEffect(() => {
    if (fase !== 'saliendo') return
    if (onFin) onFin()
    const id = window.setTimeout(() => setFase('fuera'), DURACION_SALIDA)
    return () => window.clearTimeout(id)
  }, [fase, onFin])

  if (fase === 'fuera') return null

  const saliendo = fase === 'saliendo'

  return (
    <div
      className="fixed inset-0 z-[90] overflow-hidden bg-white transition-opacity duration-500 ease-apple dark:bg-black"
      style={{ opacity: saliendo ? 0 : 1, pointerEvents: saliendo ? 'none' : 'auto' }}
      role="status"
      aria-live="polite"
      aria-label="Cargando el robot institucional de REDVISION"
    >
      {/* Vineta roja de marca */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 70% at 50% 45%, rgba(214,25,34,0.16), transparent 62%)',
        }}
      />

      {/* Canvas de la intro, o el ultimo frame congelado durante la salida */}
      {saliendo ? (
        snapshot && <img src={snapshot} alt="" aria-hidden="true" className="h-full w-full object-cover" />
      ) : (
        <Canvas
          frameloop="always"
          dpr={[1, 1.8]}
          camera={{ position: [0, Y_CERCA, 0.25], fov: FOV_CERCA, near: 0.01, far: 10 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true, // necesario para capturar el ultimo frame
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.NeutralToneMapping
            gl.toneMappingExposure = 1
            gl.outputColorSpace = THREE.SRGBColorSpace
          }}
        >
          <Entorno />
          <directionalLight position={[0.35, 0.65, 0.5]} intensity={2} />
          <SombraContacto />

          <LimiteModelo
            fallback={<RobotProxy controles={controlesInertes} reposoActivo={false} onListo={alListo} />}
          >
            <Suspense fallback={null}>
              <ModeloRobot controles={controlesInertes} reposoActivo={false} onListo={alListo} />
            </Suspense>
          </LimiteModelo>

          <CamaraZoom activa={fase === 'zoom'} onCompleto={alTerminarZoom} />
          <Capturador registrar={registrarCapturador} />
        </Canvas>
      )}

      {/* Marca y progreso */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col items-center gap-5 px-6 pb-14">
        <img
          src="/redvision-logo.png"
          alt="REDVISION"
          width="300"
          height="62"
          className="h-10 w-auto object-contain transition-opacity duration-500 sm:h-12"
          style={{ opacity: fase === 'cargando' ? 1 : 0 }}
          decoding="async"
        />

        <div
          className="h-px w-56 overflow-hidden bg-black/15 transition-opacity duration-500 dark:bg-white/20"
          style={{ opacity: fase === 'cargando' ? 1 : 0 }}
        >
          <div
            className="h-full origin-left bg-rv-red transition-transform duration-200 ease-linear"
            style={{ transform: `scaleX(${Math.max(0.04, progress / 100)})` }}
          />
        </div>

        <p
          className="font-display text-[10px] uppercase tracking-[0.28em] text-black/60 transition-opacity duration-500 dark:text-white/60"
          style={{ opacity: fase === 'cargando' ? 1 : 0 }}
        >
          Calibrando óptica
        </p>
      </div>
    </div>
  )
}
