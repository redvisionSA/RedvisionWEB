import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html, useGLTF, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import EMPRESA from '../datos/empresa.js'

/* =========================================================================
 * CONTRATO DEL MODELO — Dahua_Robot_Replica.glb
 *
 * Verificado leyendo el GLB exportado, no asumido:
 *   nodo 10  CTRL_Cabeza   T=[0, 0.18148, 0]   R=identidad  S=0.25706  (raiz)
 *   nodo  3  CTRL_Lente    T=[0, 0.04985, 0]   R=identidad  S=3.89010  (hijo)
 *
 * Como ambos controles salen con rotacion identidad y CTRL_Cabeza es nodo raiz
 * de una escena Y-arriba, sus ejes locales coinciden con los del mundo:
 *   pan  (CTRL_Cabeza) = rotacion sobre Y
 *   tilt (CTRL_Lente)  = rotacion sobre X
 *
 * Estaticos a proposito: RV_Cuerpo_* nunca se reparentan. La rejilla del
 * altavoz (RV_Cuerpo_GrisCamara) es fija; en una camara PT la base no gira.
 * ====================================================================== */
export const MODEL_URL = '/Dahua_Robot_Replica.glb'
export const DRACO_PATH = '/draco/'

const NODO_CABEZA = 'CTRL_Cabeza'
const NODO_LENTE = 'CTRL_Lente'

/* El escudo lleva una textura de 512x818 con el logotipo de Dahua, la marca
   PARTNER y un codigo QR funcional, decodificado del escudo fisico. */
const NODO_ESCUDO = 'RV_Cuerpo_EscudoSponsor'
/* Un arrastre no debe disparar el enlace: por debajo de este umbral en pixeles
   el gesto cuenta como click. */
const UMBRAL_CLICK = 8

const EJE_PAN = new THREE.Vector3(0, 1, 0)
const EJE_TILT = new THREE.Vector3(1, 0, 0)

/* -------------------------------------------------------------------------
 * LIMITES
 *
 * El tilt es ASIMETRICO a proposito. Mirando hacia abajo el barril del
 * objetivo entra en el frontal negro y aguanta 15 grados. Mirando hacia
 * arriba asoma por el borde superior y rompe la silueta mucho antes, asi que
 * ese lado se corta en 8 grados.
 *
 * PAN_LIMITE_DURO es una red de seguridad: pase lo que pase con la entrada,
 * la cabeza nunca supera 90 grados y no puede quedar de espaldas.
 * ---------------------------------------------------------------------- */
const PAN_MAX = THREE.MathUtils.degToRad(60)
const PAN_LIMITE_DURO = THREE.MathUtils.degToRad(90)

/* -------------------------------------------------------------------------
 * RECORRIDO DEL TILT
 *
 * El tilt lo hace la CABEZA, no el objetivo. Motivo, medido sobre el GLB:
 * la cara frontal de `RV_Lente_NegroLogo` tiene un agujero circular de
 * 8,7 mm de radio centrado exactamente en el objetivo, y el cristal que
 * asoma mide 5,65 mm de radio. Quedan 3 mm de juego: cualquier recorrido
 * util del objetivo lo saca de su agujero. El modelo se construyo con el
 * lente fijo.
 *
 * La cabeza, en cambio, es una bola dentro de un socket. Inclinarla es lo
 * que hace una camara PT real y se lee desde lejos. Limite verificado en
 * Blender: a partir de 12 grados asoma el interior del socket por el frente.
 * ---------------------------------------------------------------------- */
const TILT_ABAJO = THREE.MathUtils.degToRad(10) // positivo: la cabeza mira abajo
const TILT_ARRIBA = THREE.MathUtils.degToRad(9) // negativo: la cabeza mira arriba
const TILT_LIMITE_DURO = THREE.MathUtils.degToRad(12)

const K = 6 // constante de amortiguacion; 4-8 funciona bien
const ESPERA_REPOSO = 4.5 // segundos sin interaccion antes del barrido
const BARRIDO_PAN = THREE.MathUtils.degToRad(25)
const BARRIDO_TILT = THREE.MathUtils.degToRad(5)
const EPSILON = 1e-4

/* Sensibilidad del giroscopio: grados de inclinacion del dispositivo que
   equivalen al recorrido completo del robot. */
const GIRO_RANGO_PAN = 34 // grados de `gamma`
const GIRO_RANGO_TILT = 26 // grados de `beta` alrededor del reposo
const GIRO_BETA_REPOSO = 48 // como se sostiene un telefono al mirarlo

/* Arrastre: cuanto recorrido de dedo equivale al pan maximo */
const ARRASTRE_FACTOR = 1.6

/** Amortiguacion independiente del framerate: mismo resultado a 30 o 144 fps. */
function suavizar(actual, objetivo, dt) {
  return actual + (objetivo - actual) * (1 - Math.exp(-K * dt))
}

function tiltDesdeNormal(n) {
  const v = THREE.MathUtils.clamp(n, -1, 1)
  return v >= 0 ? v * TILT_ABAJO : v * TILT_ARRIBA
}

/* =========================================================================
 * CONTROLES
 *
 * Tres fuentes escriben en el mismo objetivo, segun el dispositivo:
 *
 *   cursor       escritorio. El puntero recorre la ventana entera.
 *   giroscopio   movil y tablet. El robot se mantiene apuntando al usuario
 *                mientras el dispositivo se inclina. Es el equivalente exacto
 *                de "te esta vigilando": el que se mueve es el mundo, no el
 *                dedo. En iOS 13+ hace falta permiso explicito, pedido desde
 *                un gesto del usuario.
 *   arrastre     movil y tablet. Tocar el robot y moverlo con el dedo.
 *                Siempre disponible, sin permisos, y es el que descubre
 *                cualquiera sin instrucciones.
 * ====================================================================== */
function soportaGiro() {
  return typeof window !== 'undefined' && typeof window.DeviceOrientationEvent !== 'undefined'
}

function necesitaPermisoGiro() {
  return soportaGiro() && typeof window.DeviceOrientationEvent.requestPermission === 'function'
}

export function useControlesRobot({ hayCursor, habilitado }) {
  const objetivo = useRef({ pan: 0, tilt: 0 })
  const ultimaInteraccion = useRef(-Infinity)
  const arrastre = useRef(null)
  /* usePanTilt deja aqui su `invalidate`. Cada fuente de control pide un
     frame al escribir, asi el render bajo demanda no necesita un intervalo. */
  const notificar = useRef(null)

  const [giroActivo, setGiroActivo] = useState(false)
  const [giroEstado, setGiroEstado] = useState(() => {
    if (!soportaGiro()) return 'no-soportado'
    return necesitaPermisoGiro() ? 'requiere-permiso' : 'disponible'
  })

  const marcar = useCallback(() => {
    ultimaInteraccion.current = performance.now() / 1000
    notificar.current?.()
  }, [])

  /* ---------------- Cursor (escritorio) ---------------- */
  useEffect(() => {
    if (!habilitado || !hayCursor) return
    const onMove = (event) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = (event.clientY / window.innerHeight) * 2 - 1
      objetivo.current.pan = THREE.MathUtils.clamp(nx, -1, 1) * PAN_MAX
      objetivo.current.tilt = tiltDesdeNormal(ny)
      marcar()
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [habilitado, hayCursor, marcar])

  /* ---------------- Giroscopio (movil y tablet) ---------------- */
  useEffect(() => {
    if (!habilitado || !giroActivo) return

    const onOrient = (event) => {
      if (event.gamma == null || event.beta == null) return
      /* gamma: inclinacion izquierda/derecha. Se invierte para que el robot
         mire hacia donde queda la persona cuando el telefono rota. */
      const nx = THREE.MathUtils.clamp(-event.gamma / GIRO_RANGO_PAN, -1, 1)
      const ny = THREE.MathUtils.clamp((event.beta - GIRO_BETA_REPOSO) / GIRO_RANGO_TILT, -1, 1)
      objetivo.current.pan = nx * PAN_MAX
      objetivo.current.tilt = tiltDesdeNormal(ny)
      marcar()
    }

    window.addEventListener('deviceorientation', onOrient)
    return () => window.removeEventListener('deviceorientation', onOrient)
  }, [habilitado, giroActivo, marcar])

  const activarGiro = useCallback(async () => {
    if (!soportaGiro()) return
    if (necesitaPermisoGiro()) {
      try {
        const respuesta = await window.DeviceOrientationEvent.requestPermission()
        if (respuesta !== 'granted') {
          setGiroEstado('denegado')
          return
        }
      } catch (e) {
        setGiroEstado('denegado')
        return
      }
    }
    setGiroEstado('activo')
    setGiroActivo(true)
  }, [])

  const desactivarGiro = useCallback(() => {
    setGiroActivo(false)
    setGiroEstado(necesitaPermisoGiro() ? 'requiere-permiso' : 'disponible')
  }, [])

  /* ---------------- Arrastre con el dedo ---------------- */
  const onPointerDown = useCallback(
    (event) => {
      if (!habilitado || hayCursor) return
      const rect = event.currentTarget.getBoundingClientRect()
      arrastre.current = {
        x: event.clientX,
        y: event.clientY,
        pan: objetivo.current.pan,
        tilt: objetivo.current.tilt,
        ancho: rect.width || 1,
        alto: rect.height || 1,
      }
      event.currentTarget.setPointerCapture?.(event.pointerId)
      marcar()
    },
    [habilitado, hayCursor, marcar]
  )

  const onPointerMove = useCallback(
    (event) => {
      const a = arrastre.current
      if (!a) return
      const dx = (event.clientX - a.x) / a.ancho
      const dy = (event.clientY - a.y) / a.alto
      objetivo.current.pan = THREE.MathUtils.clamp(
        a.pan + dx * PAN_MAX * 2 * ARRASTRE_FACTOR,
        -PAN_LIMITE_DURO,
        PAN_LIMITE_DURO
      )
      objetivo.current.tilt = THREE.MathUtils.clamp(
        a.tilt + dy * TILT_ABAJO * 2 * ARRASTRE_FACTOR,
        -TILT_ARRIBA,
        TILT_ABAJO
      )
      marcar()
    },
    [marcar]
  )

  const onPointerUp = useCallback((event) => {
    arrastre.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }, [])

  /* Identidad estable: el Hero recibe este objeto por callback y no debe
     re-suscribirse en cada render. */
  return useMemo(
    () => ({
      objetivo,
      ultimaInteraccion,
      notificar,
      giroEstado,
      giroActivo,
      activarGiro,
      desactivarGiro,
      manejadoresArrastre: hayCursor
        ? {}
        : { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp },
    }),
    [giroEstado, giroActivo, activarGiro, desactivarGiro, hayCursor, onPointerDown, onPointerMove, onPointerUp]
  )
}

/* =========================================================================
 * ENTORNO
 * Iluminacion por mapa de entorno, no por muchas luces puntuales.
 * RoomEnvironment es geometria procedural: no descarga ningun archivo.
 * ====================================================================== */
export function Entorno() {
  const { gl, scene, invalidate } = useThree()

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const entorno = pmrem.fromScene(new RoomEnvironment(), 0.04)
    scene.environment = entorno.texture
    invalidate()
    return () => {
      entorno.texture.dispose()
      pmrem.dispose()
      scene.environment = null
    }
  }, [gl, scene, invalidate])

  return null
}

/* =========================================================================
 * ENCUADRE RESPONSIVO
 *
 * El robot mide 0,2857 m. En un telefono vertical el lienzo es mucho mas
 * angosto que alto, asi que una distancia fija de camara lo recorta por los
 * lados. Se calcula la distancia minima que deja entrar el modelo entero por
 * las dos dimensiones y se toma la mayor.
 * ====================================================================== */
const ALTO_MODELO = 0.32 // m, con aire arriba y abajo
const ANCHO_MODELO = 0.26 // m, con la cabeza girada al maximo

export function distanciaCamara(aspect, fovGrados) {
  const vFov = THREE.MathUtils.degToRad(fovGrados)
  const distanciaVertical = ALTO_MODELO / 2 / Math.tan(vFov / 2)
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * Math.max(aspect, 0.01))
  const distanciaHorizontal = ANCHO_MODELO / 2 / Math.tan(hFov / 2)
  return Math.max(distanciaVertical, distanciaHorizontal)
}

/* Margen alrededor del escudo cuando la camara se acerca a leer el QR */
const MARGEN_ESCUDO = 1.18
const VELOCIDAD_CAMARA = 3.2 // constante de amortiguacion del acercamiento

/**
 * Encuadre de camara.
 *
 *  - Sin `foco`: el robot entero, con la distancia calculada segun el formato
 *    de pantalla.
 *  - Con `foco` (una Box3 del escudo): la camara se acerca hasta que el
 *    escudo ocupa casi todo el lienzo. Ese es el unico modo en que el codigo
 *    QR llega a los ~250 px que necesita para que lo lea la camara de un
 *    telefono apuntando al monitor.
 *
 * La transicion usa la misma amortiguacion exponencial que la cabeza, asi que
 * es independiente del framerate.
 */
function CamaraRobot({ foco, fov = 32, alturaMira = 0.15 }) {
  const { camera, size, invalidate } = useThree()
  const destino = useMemo(() => ({ pos: new THREE.Vector3(), mira: new THREE.Vector3() }), [])
  const mira = useRef(new THREE.Vector3(0, alturaMira, 0))
  const animando = useRef(false)

  const aspect = size.width / Math.max(size.height, 1)

  /* Recalcula el destino cada vez que cambia el foco o el tamano del lienzo */
  useEffect(() => {
    if (foco) {
      const centro = foco.getCenter(new THREE.Vector3())
      const medidas = foco.getSize(new THREE.Vector3())
      /* Altura visible necesaria para que entren alto y ancho del escudo */
      const alto = Math.max(medidas.y, medidas.x / aspect) * MARGEN_ESCUDO
      const distancia = alto / 2 / Math.tan(THREE.MathUtils.degToRad(fov) / 2)
      destino.mira.copy(centro)
      destino.pos.set(centro.x, centro.y, centro.z + distancia)
    } else {
      destino.mira.set(0, alturaMira, 0)
      destino.pos.set(0, alturaMira + 0.005, distanciaCamara(aspect, fov))
    }
    camera.fov = fov
    camera.updateProjectionMatrix()
    animando.current = true
    invalidate()
  }, [foco, aspect, camera, fov, alturaMira, destino, invalidate])

  useFrame((state, delta) => {
    if (!animando.current) return
    const alpha = 1 - Math.exp(-VELOCIDAD_CAMARA * Math.min(delta, 0.1))

    camera.position.lerp(destino.pos, alpha)
    mira.current.lerp(destino.mira, alpha)
    camera.lookAt(mira.current)

    if (camera.position.distanceTo(destino.pos) < 0.0004) {
      camera.position.copy(destino.pos)
      mira.current.copy(destino.mira)
      camera.lookAt(mira.current)
      animando.current = false
    }
    invalidate()
  })

  return null
}

/* =========================================================================
 * SOMBRA DE CONTACTO
 * Plano con textura radial generada en canvas. Una sola llamada de dibujo.
 * Evita el mapa de sombras en tiempo real, que se recalcula en cada frame.
 * ====================================================================== */
export function SombraContacto({ y = 0.0008, escala = 0.3, opacidad = 0.55 }) {
  const textura = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    g.addColorStop(0, 'rgba(0,0,0,0.7)')
    g.addColorStop(0.42, 'rgba(0,0,0,0.28)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = THREE.SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => textura.dispose(), [textura])

  return (
    <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[escala, escala]} />
      <meshBasicMaterial map={textura} transparent opacity={opacidad} depthWrite={false} />
    </mesh>
  )
}

/* =========================================================================
 * APLICACION DE PANEO Y TILT
 *
 * La rotacion se aplica como incremento sobre la POSE DE REPOSO, capturada
 * UNA SOLA VEZ cuando aparece el nodo. Capturarla mas de una vez es el bug
 * que hacia girar la cabeza sin fin: si se relee el quaternion despues de
 * haberlo rotado, cada re-render de React suma otra vuelta.
 * ====================================================================== */
/* =========================================================================
 * PANEO Y TILT, los dos sobre CTRL_Cabeza
 *
 * Historia del bug, para que no se repita:
 *
 *   1. El tilt se aplicaba a `CTRL_Lente`, cuyo pivote esta 31,8 mm por
 *      encima y por detras del objetivo. Cada grado desplazaba el conjunto
 *      por un arco en lugar de hacerlo girar.
 *   2. Con eso, `RV_Lente_NegroLogo` (placa de 30 x 49 mm, esquina superior a
 *      44,6 mm del pivote) subia 4,4 mm y retrocedia otros 4,4 mm a 8 grados:
 *      atravesaba el casco y dejaba ver el interior de la cabeza.
 *   3. Al girar el objetivo sobre su propio centro el rompimiento desaparecia,
 *      pero tambien el movimiento: un barril corto girando sobre su eje no se
 *      percibe.
 *   4. Medida definitiva: el agujero del frontal tiene 8,7 mm de radio y el
 *      cristal 5,65 mm. Tres milimetros de juego. El objetivo NO puede
 *      recorrer nada util.
 *
 * Conclusion: el tilt pasa a la cabeza. `CTRL_Lente` queda en reposo y la
 * jerarquia del GLB no se toca. La cabeza es una bola dentro de un socket, y
 * eso es exactamente lo que inclina una camara PT.
 *
 * El orden de composicion importa: primero el paneo sobre Y del mundo,
 * despues el tilt sobre la X ya paneada. Asi el eje de inclinacion acompana
 * a la cabeza, como en un cabezal real.
 *
 *     q = qReposo · qPan · qTilt
 * ====================================================================== */
function usePanTilt({ cabezaRef, controles, reposoActivo, invalidate }) {
  const actual = useRef({ pan: 0, tilt: 0 })
  const poses = useRef({ cabeza: null, listo: false })
  const saltoFrame = useRef(0)

  const tmp = useMemo(
    () => ({
      qPan: new THREE.Quaternion(),
      qTilt: new THREE.Quaternion(),
    }),
    []
  )

  const capturarPose = () => {
    if (poses.current.listo) return
    const cabeza = cabezaRef.current
    if (!cabeza) return
    poses.current.cabeza = cabeza.quaternion.clone()
    poses.current.listo = true
  }

  useEffect(capturarPose)

  /* Las fuentes de control (cursor, giroscopio, arrastre) piden frame por aqui */
  useEffect(() => {
    if (!controles.notificar) return undefined
    controles.notificar.current = invalidate
    return () => {
      controles.notificar.current = null
    }
  }, [controles, invalidate])

  useEffect(() => {
    if (!import.meta.env.DEV) return
    window.__rvRobotTest = (gradosPan = 90, gradosTilt = 0) => {
      controles.objetivo.current.pan = THREE.MathUtils.degToRad(gradosPan)
      controles.objetivo.current.tilt = THREE.MathUtils.degToRad(gradosTilt)
      controles.ultimaInteraccion.current = performance.now() / 1000
      invalidate()
    }
    return () => {
      delete window.__rvRobotTest
    }
  }, [controles, invalidate])

  useFrame((state, delta) => {
    const cabeza = cabezaRef.current
    if (!cabeza) return
    capturarPose()

    const dt = Math.min(delta, 0.1)
    const ahora = performance.now() / 1000
    const objetivo = controles.objetivo.current

    /* Barrido de vigilancia cuando nadie interactua. Se dibuja a la mitad de
       frames: basta para un movimiento lento y ahorra bateria. */
    const enReposo = reposoActivo && ahora - controles.ultimaInteraccion.current > ESPERA_REPOSO
    if (enReposo) {
      const t = state.clock.elapsedTime
      objetivo.pan = Math.sin(t * 0.35) * BARRIDO_PAN
      objetivo.tilt = Math.sin(t * 0.22) * BARRIDO_TILT
    }

    const panAnterior = actual.current.pan
    const tiltAnterior = actual.current.tilt
    actual.current.pan = suavizar(actual.current.pan, objetivo.pan, dt)
    actual.current.tilt = suavizar(actual.current.tilt, objetivo.tilt, dt)

    const seMovio =
      Math.abs(actual.current.pan - panAnterior) > EPSILON ||
      Math.abs(actual.current.tilt - tiltAnterior) > EPSILON

    if (!seMovio) return

    const pan = THREE.MathUtils.clamp(actual.current.pan, -PAN_LIMITE_DURO, PAN_LIMITE_DURO)
    const tilt = THREE.MathUtils.clamp(actual.current.tilt, -TILT_LIMITE_DURO, TILT_LIMITE_DURO)

    if (poses.current.cabeza) {
      tmp.qPan.setFromAxisAngle(EJE_PAN, pan)
      tmp.qTilt.setFromAxisAngle(EJE_TILT, tilt)
      cabeza.quaternion
        .copy(poses.current.cabeza)
        .multiply(tmp.qPan)
        .multiply(tmp.qTilt)
        .normalize()
    }

    if (enReposo) {
      saltoFrame.current = (saltoFrame.current + 1) % 2
      if (saltoFrame.current === 0) invalidate()
    } else {
      invalidate()
    }
  })
}

/* =========================================================================
 * MODELO
 * ====================================================================== */
export function ModeloRobot({ controles, reposoActivo, materialesLigeros, onListo, onEscudo }) {
  const { scene } = useGLTF(MODEL_URL, DRACO_PATH)
  const { invalidate } = useThree()

  const cabezaRef = useRef(null)
  const lenteRef = useRef(null)
  const escudoRef = useRef(null)
  const inicioClick = useRef(null)
  const [sobreEscudo, setSobreEscudo] = useState(false)

  useMemo(() => {
    cabezaRef.current = scene.getObjectByName(NODO_CABEZA) || null
    lenteRef.current = scene.getObjectByName(NODO_LENTE) || null
    escudoRef.current = scene.getObjectByName(NODO_ESCUDO) || null

    scene.traverse((node) => {
      if (!node.isMesh) return
      node.castShadow = false
      node.receiveShadow = false

      /* Solo el escudo participa del raycast. Sin esto, cada movimiento del
         puntero probaria los 39.342 triangulos del modelo entero. */
      node.raycast = node.name === NODO_ESCUDO ? THREE.Mesh.prototype.raycast : () => null

      /* Gama baja: KHR_materials_clearcoat obliga a MeshPhysicalMaterial,
         mas caro que MeshStandardMaterial. */
      if (materialesLigeros && node.material && node.material.isMeshPhysicalMaterial) {
        const viejo = node.material
        node.material = new THREE.MeshStandardMaterial({
          map: viejo.map,
          color: viejo.color,
          metalness: viejo.metalness,
          roughness: Math.max(0, viejo.roughness - 0.12),
          normalMap: viejo.normalMap,
          transparent: viejo.transparent,
          opacity: viejo.opacity,
          side: viejo.side,
        })
        viejo.dispose()
      }
    })

    if (import.meta.env.DEV) {
      if (!cabezaRef.current) console.warn(`[RobotDahua] Falta el nodo "${NODO_CABEZA}".`)
      if (!lenteRef.current) console.warn(`[RobotDahua] Falta el nodo "${NODO_LENTE}" (no se anima, pero deberia existir).`)
    }
    return scene
  }, [scene, materialesLigeros])

  useEffect(() => {
    invalidate()
    if (onListo) onListo()
  }, [scene, invalidate, onListo])

  /* Resaltado del escudo: el rojo institucional sobre el emisivo del material.
     Se guarda el valor original para devolverlo al salir. */
  useEffect(() => {
    const escudo = escudoRef.current
    if (!escudo || !escudo.material) return undefined
    const material = escudo.material
    if (!material.emissive) return undefined

    const original = material.emissive.clone()
    const intensidadOriginal = material.emissiveIntensity ?? 1

    if (sobreEscudo) {
      material.emissive.set('#D61922')
      material.emissiveIntensity = 0.35
    }
    invalidate()

    return () => {
      material.emissive.copy(original)
      material.emissiveIntensity = intensidadOriginal
      invalidate()
    }
  }, [sobreEscudo, invalidate])

  /* Cursor de enlace mientras el puntero esta sobre el escudo */
  useEffect(() => {
    if (!sobreEscudo) return undefined
    const previo = document.body.style.cursor
    document.body.style.cursor = 'pointer'
    return () => {
      document.body.style.cursor = previo
    }
  }, [sobreEscudo])

  /* Click sobre el escudo: se calcula su caja envolvente y se entrega hacia
     arriba. La camara se acerca hasta que el QR es legible por la camara de
     un telefono apuntando al monitor. */
  const enfocarEscudo = useCallback(
    (event) => {
      const inicio = inicioClick.current
      inicioClick.current = null
      /* Si el puntero se desplazo, el gesto era un arrastre del robot */
      if (inicio) {
        const dx = event.clientX - inicio.x
        const dy = event.clientY - inicio.y
        if (Math.hypot(dx, dy) > UMBRAL_CLICK) return
      }
      const escudo = escudoRef.current
      if (!escudo || !onEscudo) return
      event.stopPropagation()
      escudo.updateWorldMatrix(true, true)
      onEscudo(new THREE.Box3().setFromObject(escudo))
    },
    [onEscudo]
  )

  usePanTilt({ cabezaRef, controles, reposoActivo, invalidate })

  return (
    <primitive
      object={scene}
      onPointerOver={(e) => {
        e.stopPropagation()
        setSobreEscudo(true)
      }}
      onPointerOut={() => setSobreEscudo(false)}
      onPointerDown={(e) => {
        inicioClick.current = { x: e.clientX, y: e.clientY }
      }}
      onClick={enfocarEscudo}
    >
      {sobreEscudo && escudoRef.current && (
        <Html
          position={escudoRef.current.position}
          center
          /* Sin distanceFactor: la pastilla mantiene su tamano en pantalla,
             no escala con la distancia de camara. */
          style={{ pointerEvents: 'none' }}
          zIndexRange={[20, 0]}
        >
          <span className="rv-chip whitespace-nowrap text-rv-red">Acercar el QR</span>
        </Html>
      )}
    </primitive>
  )
}

useGLTF.preload(MODEL_URL, DRACO_PATH)

/* =========================================================================
 * PROXY
 * Se muestra si el .glb todavia no esta en public/. Respeta la escala real
 * (0,2857 m) y los mismos pivotes, para que el encuadre no cambie al llegar
 * el modelo definitivo.
 * ====================================================================== */
export function RobotProxy({ controles, reposoActivo, onListo }) {
  const cabezaRef = useRef(null)
  const lenteRef = useRef(null)
  const { invalidate } = useThree()

  useEffect(() => {
    invalidate()
    if (onListo) onListo()
  }, [invalidate, onListo])

  usePanTilt({ cabezaRef, controles, reposoActivo, invalidate })

  return (
    <group>
      <mesh position={[0, 0.085, 0]}>
        <capsuleGeometry args={[0.045, 0.075, 6, 20]} />
        <meshStandardMaterial color="#F4F4F4" metalness={0.12} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.126, 0.03]}>
        <boxGeometry args={[0.05, 0.022, 0.012]} />
        <meshStandardMaterial color="#3457B4" metalness={0.2} roughness={0.35} />
      </mesh>

      <group ref={cabezaRef} position={[0, 0.18148, 0]}>
        <mesh position={[0, 0.022, 0]}>
          <sphereGeometry args={[0.042, 28, 20]} />
          <meshStandardMaterial color="#F4F4F4" metalness={0.18} roughness={0.26} />
        </mesh>
        <mesh position={[0, 0.055, 0]}>
          <torusGeometry args={[0.03, 0.005, 12, 32]} />
          <meshStandardMaterial color="#C6A878" metalness={0.95} roughness={0.28} />
        </mesh>

        <group ref={lenteRef} position={[0, 0.01282, 0]}>
          <mesh position={[0, 0, 0.034]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 28]} />
            <meshStandardMaterial color="#0A0A0A" metalness={0.35} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.041]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.013, 0.013, 0.004, 28]} />
            <meshStandardMaterial color="#D61922" emissive="#D61922" emissiveIntensity={1.2} roughness={0.2} />
          </mesh>
        </group>
      </group>
    </group>
  )
}

/* =========================================================================
 * LIMITE DE ERROR
 * ====================================================================== */
export class LimiteModelo extends Component {
  constructor(props) {
    super(props)
    this.state = { fallo: false }
  }
  static getDerivedStateFromError() {
    return { fallo: true }
  }
  componentDidCatch(error) {
    if (import.meta.env.DEV) console.warn('[RobotDahua] No se pudo cargar', MODEL_URL, error)
  }
  render() {
    return this.state.fallo ? this.props.fallback : this.props.children
  }
}

function Cargando() {
  const { progress } = useProgress()
  return (
    <Html center>
      <p className="whitespace-nowrap font-display text-[11px] uppercase tracking-[0.24em] text-rv-red">
        Inicializando {Math.round(progress)}%
      </p>
    </Html>
  )
}

/* =========================================================================
 * CANVAS DEL HERO
 * ====================================================================== */
export default function RobotDahua({
  className = '',
  materialesLigeros = false,
  onControles,
  onFoco,
}) {
  const contenedorRef = useRef(null)
  const [foco, setFoco] = useState(null)
  const [enPantalla, setEnPantalla] = useState(false)
  const [sinMovimiento, setSinMovimiento] = useState(false)
  const [hayCursor, setHayCursor] = useState(true)

  useEffect(() => {
    const mm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mh = window.matchMedia('(hover: hover) and (pointer: fine)')
    setSinMovimiento(mm.matches)
    setHayCursor(mh.matches)
    const onMM = (e) => setSinMovimiento(e.matches)
    const onMH = (e) => setHayCursor(e.matches)
    mm.addEventListener('change', onMM)
    mh.addEventListener('change', onMH)
    return () => {
      mm.removeEventListener('change', onMM)
      mh.removeEventListener('change', onMH)
    }
  }, [])

  useEffect(() => {
    const node = contenedorRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setEnPantalla(entry.isIntersecting), {
      rootMargin: '150px',
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const activo = !sinMovimiento && enPantalla
  const controles = useControlesRobot({ hayCursor, habilitado: activo })

  /* El Hero necesita los controles para dibujar el boton del giroscopio */
  useEffect(() => {
    if (onControles) onControles(controles)
  }, [onControles, controles])

  /* El Hero apaga sus adornos mientras el QR esta en primer plano: el aro rojo
     y la linea de escaneo cruzan el codigo y estorban al lector. */
  useEffect(() => {
    if (onFoco) onFoco(Boolean(foco))
  }, [onFoco, foco])

  /* Escape cierra el acercamiento */
  useEffect(() => {
    if (!foco) return undefined
    const onKey = (e) => e.key === 'Escape' && setFoco(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [foco])

  return (
    <div
      ref={contenedorRef}
      className={`${className} ${hayCursor ? '' : 'cursor-grab touch-none active:cursor-grabbing'}`}
      {...controles.manejadoresArrastre}
    >
      <Canvas
        frameloop={enPantalla ? 'demand' : 'never'}
        /* En tactil el techo baja a 1,6: la ganancia visual no compensa el
           coste de sombreado en una GPU movil. */
        dpr={[1, hayCursor ? 2 : 1.6]}
        camera={{ position: [0, 0.155, 0.62], fov: 32, near: 0.01, far: 10 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          /* Khronos PBR Neutral: es la transformacion con la que se calibro el
             color del robot. ACESFilmic desatura y el azul Dahua se va de marca. */
          gl.toneMapping = THREE.NeutralToneMapping
          gl.toneMappingExposure = 1
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
        aria-label="Robot Dahua de REDVISION: la cabeza sigue al visitante. El escudo abre un enlace."
      >
        <CamaraRobot foco={foco} />
        <Entorno />
        <directionalLight position={[0.35, 0.65, 0.5]} intensity={2} />
        <SombraContacto />

        <LimiteModelo fallback={<RobotProxy controles={controles} reposoActivo={activo} />}>
          <Suspense fallback={<Cargando />}>
            <ModeloRobot
              controles={controles}
              reposoActivo={activo}
              materialesLigeros={materialesLigeros}
              onEscudo={setFoco}
            />
          </Suspense>
        </LimiteModelo>
      </Canvas>

      {/* Acercamiento al QR: instrucciones y salida */}
      {foco && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2.5 p-3">
          <p className="rv-chip text-rv-red">Apunta la cámara del teléfono al código</p>
          <div className="pointer-events-auto flex flex-wrap justify-center gap-2">
            <a
              href={EMPRESA.qrEscudo}
              target="_blank"
              rel="noopener noreferrer"
              className="rv-btn-primary px-5 py-2.5 text-[11px]"
            >
              Abrir el enlace
            </a>
            <button type="button" onClick={() => setFoco(null)} className="rv-btn-glass px-5 py-2.5 text-[11px]">
              Volver al robot
            </button>
          </div>
        </div>
      )}

      {/* El contenido de un canvas no existe para el teclado ni para un lector
          de pantalla. El mismo destino que abre el QR del escudo, como enlace
          real fuera del lienzo. */}
      <a
        href={EMPRESA.qrEscudo}
        target="_blank"
        rel="noopener noreferrer"
        className="sr-only focus:not-sr-only focus:fixed focus:bottom-6 focus:left-1/2 focus:z-[60]
                   focus:-translate-x-1/2 focus:rounded-pill focus:bg-rv-red focus:px-5 focus:py-2.5
                   focus:text-xs focus:font-semibold focus:text-white"
      >
        Abrir el enlace del escudo del robot
      </a>
    </div>
  )
}
