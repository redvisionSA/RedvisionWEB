# REDVISION — Web institucional

Sitio institucional de REDVISION: **Vite + React 18 + Tailwind CSS 3 + React Three Fiber**,
sobre un lenguaje visual de **Liquid Glass (Apple) + Bento Grid** con el video institucional
como fondo vivo de toda la pagina.

## Posicionamiento (leer antes de tocar textos)

### El orden del negocio

| Orden | Actividad | Seccion |
|---|---|---|
| **1** | **Comercializacion** de equipamiento, mayorista y minorista | Hero + `#catalogo` |
| **2** | **Departamento de proyectos**, ciclo completo llave en mano | `#proyectos` |
| 3 | Formacion tecnica y estructura | `#capacitaciones` |

El departamento de proyectos cubre seis etapas y esa secuencia es la propuesta de valor:
**escuchamos, planificamos, cotizamos, instalamos, capacitamos y acompanamos**. Un unico
responsable de punta a punta.

### Multimarca

**Dahua Technology es la plataforma de referencia, no el unico catalogo.** Se la posiciona como la
mejor opcion por integracion, prestaciones y soporte, pero el sitio debe dejar claro en todo momento
que REDVISION comercializa las principales marcas del mercado y cotiza cualquier equipamiento que el
proyecto requiera, incluida la convivencia con plataformas ya instaladas.

Piezas que sostienen ese equilibrio:

- La tesela `TileMarcas` en `#catalogo`, dedicada exclusivamente al tema.
- El titular del Hero no nombra ninguna marca.
- `TileTecnologia` se titula "Dahua Technology, dentro de un catalogo multimarca".
- La pastilla de la barra dice "Distribuidor autorizado · Catalogo multimarca".
- El pie aclara que ademas se comercializan las principales marcas del mercado.

Si se agrega copy nuevo, verificar que no deje la impresion de una marca unica: eso cierra
operaciones que la empresa si puede atender.

### Registro

**Profesional.** El interlocutor es un instalador, una empresa o un integrador, y la pagina compite
con proveedores del mismo rubro. Nada de lenguaje coloquial: resta seriedad frente a la competencia.

| No | Si |
|---|---|
| "Vení al local y llevátelo" | "Atencion presencial, con disponibilidad confirmada" |
| "Te decimos cual comprar" | "El equipamiento se define a partir del requerimiento tecnico relevado" |
| "El mostrador no es una gondola" | "Cada operacion se define a partir del requerimiento tecnico, no del catalogo" |
| "Contanos que hay que cubrir" | "Indique el escenario a cubrir" |

Tratamiento impersonal o de usted. Sin apelaciones directas en voseo, sin ironia, sin frases hechas.

**Excepcion: las resenas de Google se transcriben textualmente**, con su ortografia y su registro
original. Editarlas seria falsearlas.

### No inventar cifras

Los contadores usan numeros verificables contra la propia pagina: 3 areas de actividad, 6 lineas de
producto, 5 plataformas Dahua. Antes de agregar una metrica, confirmar que sea comprobable.

## Puesta en marcha

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/
```

---

## Estructura

```
RedvisionWeb/
├─ index.html                 meta SEO, JSON-LD, anti-flash de tema, preload del poster
├─ tailwind.config.js         paleta estricta (blanco / negro / #D61922) + tokens de material
├─ exportar_robot.py          reexport Blender -> public/Dahua_Robot_Replica.glb (Draco)
├─ scripts/copy-draco.mjs     copia el decodificador Draco a public/draco/ (postinstall)
├─ docs/
│  └─ INTEGRACION_WEB_robot_dahua.md   contrato de nodos, pivotes y limites del modelo
├─ public/
│  ├─ redvision-logo.png      logotipo institucional (3000×624, transparente)
│  ├─ redvision-logo-dark.png misma marca con los negros invertidos, para dark mode
│  ├─ dahua-logo.png          logo Dahua oficial, recortado y con fondo transparente
│  ├─ resenas.json            resenas de Google (ver seccion 10)
│  ├─ hero-bg.mp4             video de fondo (1280×720, 30 fps, sin audio, 3.9 MB)
│  ├─ hero-poster.jpg         primer fotograma; poster del video y base del comparador
│  ├─ Dahua_Robot_Replica.glb modelo comprimido con Draco (340 KB)
│  └─ draco/                  decodificador; lo genera copy-draco.mjs, no se versiona
└─ src/
   ├─ App.jsx                 estado global: tema, modo vigilancia, puntero
   ├─ index.css               tokens de vidrio + capas base/components/utilities
   ├─ context/SiteContext.jsx
   ├─ datos/empresa.js         telefono, correo, direccion, horarios y redes
   ├─ hooks/useGlassPointer.js
   └─ components/
      ├─ VideoBackground.jsx  video en bucle + velo + vineta + lente de vigilancia
      ├─ GlassPanel.jsx       primitiva de material Liquid Glass
      ├─ Navbar.jsx           capsula flotante + dock magnificado + pastilla Dahua
      ├─ IntroCinematica.jsx  overlay de entrada: carga del GLB + zoom out de camara
      ├─ Hero3D.jsx           maquetado del Hero: titular, HUD de vidrio, ticker
      ├─ RobotDahua.jsx       Canvas R3F: modelo, paneo/tilt, render bajo demanda
      ├─ BentoCanvas.jsx      lienzo bento: composicion de todas las teselas
      ├─ Servicios.jsx        tesela de capacidades (selector interactivo)
      ├─ Tecnologia.jsx       comparador Full-color + conmutador de lineas Dahua
      ├─ Nosotros.jsx         pilares, metricas animadas, estado en vivo, formacion
      ├─ Contacto.jsx         CTA + formulario en vidrio
      ├─ Ubicacion.jsx        mapa de Google tratado + resenas
      └─ Footer.jsx           losa de vidrio final
```

---

## 1. Paleta de marca (estricta)

`tailwind.config.js` reemplaza por completo `theme.colors`. Solo existen:

| Token | Valor | Uso |
|---|---|---|
| `white` | `#FFFFFF` | superficie en clear mode |
| `black` | `#000000` | superficie en dark mode |
| `rv-red` | `#D61922` | acento institucional |
| `rv-red-press` | `#B31219` | estado activo del mismo rojo |

No hay grises en la paleta. **El vidrio entero se construye con opacidad sobre blanco o negro**
(`rgba(255,255,255,0.62)`, `rgba(0,0,0,0.52)`), nunca con un color nuevo. El rojo aparece solo
como tinte de canto, foco, estado activo y dato destacado.

## 2. Material Liquid Glass

Los tokens viven en `:root` y `html.dark` dentro de `src/index.css`. `GlassPanel` es la primitiva,
con cuatro variantes: `thin`, `default`, `strong` y `chrome` (esta ultima, solo navbar y footer).

### Las cinco capas de una tesela

Un panel translucido no es vidrio. El vidrio tiene espesor, canto y peso. `.glass` apila cinco
capas para conseguir las tres cosas:

| # | Capa | Que aporta |
|---|---|---|
| 1 | `backdrop-filter` | Espesor optico: `blur` + `saturate` + `brightness` + `contrast` |
| 2 | `background-image` | Velo base, brillo de esquina y bloom rojo institucional |
| 3 | `::before` | Reflejo especular que sigue al cursor, con nucleo rojo |
| 4 | `box-shadow` | Canto, contacto, sombra media y sombra ambiente: la profundidad |
| 5 | `::after` | Canto lenticular con dispersion blanco/rojo |

### De donde sale el color

La paleta sigue siendo blanco, negro y `#D61922`. El color adicional **no** se pinta: se revela.

- `saturate(215%)` en clear mode y `saturate(230%)` en dark mode amplifican los colores del **video
  de fondo** al atravesar el vidrio. El pigmento es del video, no del material.
- `brightness(1.07)` / `brightness(1.34)` levantan ese fondo, que es lo que separa una tesela del
  plano y le da la sensacion de estar flotando por encima.
- El unico tinte propio es el rojo de marca: un bloom en la esquina superior derecha, el nucleo del
  reflejo especular y dos paradas en la dispersion del canto.

### La dispersion del canto

El borde de un vidrio grueso no es de un solo color: descompone la luz. `.glass::after` dibuja un
`conic-gradient` de 1,5 px con `mask-composite: exclude`, alternando blanco y rojo institucional.
Es el detalle que mas acerca el resultado al material de Apple, y la descomposicion usa solo colores
de marca.

### La profundidad

Cuatro sombras apiladas, no una:

```css
0 1px 2px    rgba(0,0,0,.05)    /* contacto */
0 12px 26px  -14px …/.30        /* sombra media */
0 34px 68px  -30px …/.42        /* ambiente */
inset 0 1px 0 rgba(255,255,255,.95)  /* canto superior iluminado */
```

Al pasar el cursor, la sombra se abre (`--glass-depth-hover`) y el reflejo especular pasa de 0,4 a 1
de opacidad: la tesela gana altura.

### La inclinacion

`<GlassPanel tilt={3}>` inclina el panel hacia el cursor con `perspective(1100px)` mas una elevacion
de 3 px. Sin ese desplazamiento el giro se lee como una deformacion; con el, se lee como un objeto
que se levanta. `useGlassPointer` escribe `--mx` / `--my` y el `transform` con
`requestAnimationFrame`, sin re-render de React.

El tilt esta activo solo en las teselas de lectura (metricas, mesa tecnica, como comprar,
garantias). Las teselas con pestanas, mapa o canvas no se inclinan: mover el objetivo mientras se
hace click empeora la interaccion, y el texto sobre una capa 3D pierde nitidez.

Todo esto se desactiva en dispositivos tactiles (`(hover: hover) and (pointer: fine)`).

### El vidrio oscuro es mas transparente, no mas opaco

Es el error tipico del glassmorphism en dark mode: subir la opacidad del negro hasta que el panel
tapa todo y queda un rectangulo gris muerto. Aca pasa al reves: `--glass-bg` baja de 0,52 a **0,40**
en dark mode y el espesor lo pone el `blur(40px)` con `brightness(1.34)`. Se ve mas vidrio porque se
ve mas fondo.

## 3. Video de fondo

`VideoBackground` monta cuatro capas fijas que cubren **toda** la pagina, no solo el Hero:

| z-index | Capa |
|---|---|
| `-30` | `<video>` en bucle, sin audio, `playsInline`, `object-cover` |
| `-20` | velo: `background: var(--scrim)` + un desenfoque residual de 3 px |
| `-10` | vineta roja institucional + grano fino en `mix-blend-overlay` |
| `5` | **modo vigilancia** (opcional) |

**El desenfoque viene horneado en el archivo, no lo hace el navegador.** Antes el velo aplicaba
`backdrop-filter: blur(26px)` sobre toda la pantalla, en cada frame y en cada scroll. Ahora el video
sale ya desenfocado de ffmpeg (`gblur=sigma=9`) y a 854 px de ancho. Dos ganancias a la vez: se saca
un desenfoque de pantalla completa del hilo de composicion, y el archivo baja de **3,9 MB a 717 KB**,
porque un video desenfocado comprime muchisimo mejor.

El modo vigilancia necesita la imagen nitida, asi que existe una segunda copia, `hero-sharp.mp4`,
que **solo se descarga si alguien enciende la lente**, y eso es de escritorio.

El velo es lo que convierte el video en fondo y no en contenido: lo atenua al 78 % en claro y al
72 % en oscuro, lo desenfoca y lo desatura. El contenido vive por encima, en vidrio.

El video se pausa al perder foco la pestana y no se reproduce con `prefers-reduced-motion`
(queda el poster).

### Modo vigilancia

El boton de la lente en la barra activa una segunda copia del video recortada con
`clip-path: circle()` que sigue al cursor. Dentro del circulo el video se ve **nitido, sin velo**,
con una reticula de camara. Es la metafora de la marca hecha interaccion. Se desactiva solo en
tactiles.

### Reemplazar el video

```bash
# Fondo: desenfocado y chico. Es lo unico que se descarga en la primera visita.
ffmpeg -i tu-video.mp4 -an -vf "fps=25,scale=854:-2,gblur=sigma=9" \
  -c:v libx264 -preset slow -crf 34 -pix_fmt yuv420p -movflags +faststart \
  public/hero-bg.mp4

# Copia nitida para el modo vigilancia, bajo demanda
ffmpeg -i tu-video.mp4 -an -vf "fps=30,scale=1280:-2" \
  -c:v libx264 -preset slow -crf 32 -pix_fmt yuv420p -movflags +faststart \
  public/hero-sharp.mp4

ffmpeg -ss 2 -i public/hero-bg.mp4 -frames:v 1 -vf "scale=854:-2" -q:v 7 public/hero-poster.jpg
```

Manteneló por debajo de 1 MB: es el primer recurso pesado de la pagina.

## 4. Maquetado bento

`BentoCanvas` compone una rejilla de 12 columnas en escritorio, 6 en tablet y 1 en movil.
Cada tesela declara su `col-span`; la altura la fija el contenido. No hay secciones apiladas de
ancho completo: hay teselas de distinto peso flotando sobre el video.

Teselas interactivas:

- **Catalogo** — selector de las seis lineas de producto; sustituye el panel derecho al pasar el cursor.
- **Full-color contra infrarrojo** — comparador arrastrable con teclado (`role="slider"`, flechas,
  Home/End). Ver abajo por que la escena es un SVG y no una foto.
- **Tecnologia** — conmutador de plataformas Dahua con dato destacado.
- **Divisiones** — contadores que animan al entrar en viewport (`IntersectionObserver` + `easeOutCubic`).
  Las cifras son verificables contra la propia pagina: no hay numeros inventados.
- **Mesa tecnica** — reloj en vivo.
- **Nosotros** — pilares expandibles con transicion de `grid-template-rows`.

### La escena del comparador Full-color

`Tecnologia.jsx` dibuja una **ilustracion vectorial propia** (`EscenaNocturna`), no una foto de stock:

- Pesa cero: va inline en el bundle, no hay descarga ni peticion de red.
- Es nitida en cualquier tamano y en cualquier densidad de pantalla.
- Concentra a proposito los elementos que Full-color permite identificar y el infrarrojo borra:
  color de vehiculo, color de ropa, patente legible, senaletica. Una foto cualquiera rara vez los
  tiene todos juntos, y el frame del video institucional no tiene ninguno.

Para cambiarla por una fotografia real, pone la ruta en la constante `IMAGEN_REAL` al principio del
archivo. Recomendado: escena nocturna con luz artificial escasa, un vehiculo de color saturado, una
persona con ropa de color y algo de senaletica. Formato 16/10, 1600 px de ancho, JPG.

## 5. Barra de navegacion

Capsula de vidrio flotante, no una barra pegada al borde:

- El logotipo es el elemento dominante: 56 px de alto, baja a 40 px al hacer scroll.
- Los enlaces se magnifican tipo dock de macOS segun la distancia al cursor (`RADIO_IMAN = 110px`),
  escribiendo `transform` directo en el DOM.
- La seccion activa se detecta con `IntersectionObserver` y se marca con la pastilla roja.
- Barra de progreso de lectura de 3 px en el borde superior.
- Pastilla "Powered by Dahua" separada, a la derecha, con el logo que cambia segun el tema.

## 6. Dark mode / Clear mode

- **El sitio siempre arranca en clear mode.** Decision de marca: la identidad es negro sobre blanco
  con el rojo institucional, y esa tiene que ser la primera impresion. No se lee
  `prefers-color-scheme` ni se restaura un tema guardado.
- El dark mode sigue disponible desde el switch de la barra y dura lo que dure la visita.
- Estrategia `darkMode: 'class'` sobre `<html>`; estado en `App.jsx`, distribuido por `SiteContext`.
- `index.html` fuerza la clase clara antes del primer pintado: nunca hay un flash oscuro.

**Regla critica cumplida:** al activar dark mode, el vidrio blanco pasa a negro y el texto negro a
blanco, pero `#D61922` no depende nunca de la variante `dark:`. Botones, cantos activos, links,
datos destacados y foco mantienen el rojo exacto en ambos modos.

## 7. Robot 3D del Hero

El modelo es `Dahua_Robot_Replica.glb`: la replica del robot fisico de REDVISION con una camara
CCTV Dahua como cabeza. 39.342 triangulos, 17 mallas (una por material), 0,2857 m de alto, en
metros reales. Toda la logica vive en `src/components/RobotDahua.jsx`; `Hero3D.jsx` solo lo
posiciona.

El contrato completo (pivotes, limites, calibracion de color, limitaciones conocidas) esta en
`docs/INTEGRACION_WEB_robot_dahua.md`.

### Reexportar desde Blender

```bash
blender Dahua_Robot_Replica.blend --background --python exportar_robot.py
```

o, dentro de Blender: **Scripting** → **Open** → `exportar_robot.py` → **Run Script**.

El script selecciona solo las mallas `RV_*` y los controles `CTRL_*` (deja fuera camara, luces,
el plano `Piso` y los cortadores booleanos `CUT_*`), exporta con Draco y verifica el contrato.
Resultado: **340 KB** contra 1.814 KB sin comprimir.

`Dahua_Robot_Replica.glb` declara `KHR_draco_mesh_compression` como extension **requerida**, asi
que el navegador necesita el decodificador. `scripts/copy-draco.mjs` lo copia desde el paquete
`three` a `public/draco/` en cada `npm install`, de modo que se sirve desde el propio dominio y no
desde un CDN externo. Si borras `public/draco/`, corré `npm run copy-draco`.

### Los dos unicos nodos animables

```
CTRL_Cabeza          pan   pivote y = 0,18148 m   (nodo raiz)
└── CTRL_Lente       tilt  pivote y = 0,19430 m   (hijo, hereda el pan)
```

Todo lo demas es estatico a proposito. En particular `RV_Cuerpo_GrisCamara` (rejilla del altavoz y
ranura SD) **no** se reparenta a la cabeza: en una camara PT real la base no gira, solo panea la
bola superior.

### Ejes: verificados, no asumidos

El documento de integracion advertia que los ejes habia que comprobarlos. Se resolvió leyendo el
GLB exportado en vez de probar en el navegador:

```
nodo 10  CTRL_Cabeza   T=[0, 0.18148, 0]   R=identidad   S=0.25706   (raiz)
nodo  3  CTRL_Lente    T=[0, 0.04985, 0]   R=identidad   S=3.89010   (hijo)
```

Ambos controles salen con **rotacion identidad** en una escena Y-arriba, y `CTRL_Cabeza` es nodo
raiz. Por lo tanto sus ejes locales coinciden con los del mundo:

| Control | Eje | Rango aplicado | Tope duro |
|---|---|---|---|
| `CTRL_Cabeza` (pan) | `Y` | ±60° siguiendo al visitante | **±90°** |
| `CTRL_Cabeza` (tilt) | `X` | −9° arriba, +10° abajo | ±12° |
| `CTRL_Lente` | — | queda en reposo | — |

**El tilt lo hace la cabeza, no el objetivo.** Se probaron las dos cosas y la razon es geometrica:
la cara frontal de `RV_Lente_NegroLogo` tiene un agujero circular de **8,7 mm de radio** centrado
exactamente en el objetivo, y el cristal que asoma mide **5,65 mm de radio**. Quedan 3 mm de juego
en total: el objetivo no tiene recorrido util, el modelo se construyo con el lente fijo.

La cabeza si: es una bola dentro de un socket, y es lo que inclina una camara PT real. El limite de
12° se verifico inclinando el modelo en Blender y mirando el resultado; a partir de ahi asoma el
interior del socket por el frente.

El orden de composicion importa:

```js
q = qReposo · qPan · qTilt      // primero paneo sobre Y, despues tilt sobre la X ya paneada
```

Asi el eje de inclinacion acompana a la cabeza, como en un cabezal real.

Signos: con la camara en `+Z` mirando al origen, un pan positivo lleva la cara hacia la derecha del
espectador y un tilt positivo baja el objetivo. Coincide con `pan = nx * PAN_MAX`,
`tilt = ny * TILT_MAX`.

Para comprobarlo en vivo, en desarrollo hay un ayudante en consola:

```js
__rvRobotTest(90)   // la cara mira a la derecha, el cuerpo no se mueve
__rvRobotTest(0, 15) // el objetivo baja 15 grados sin salirse del frontal
```

### Bug resuelto: la cabeza giraba sin fin

La pose de reposo se capturaba en un `useEffect` **sin array de dependencias**, es decir en cada
render. Al volver a leer `quaternion` despues de haberlo rotado, la nueva "pose de reposo" ya traia
el giro anterior, y cada re-render de React sumaba otra vuelta. Se disparaba al hacer scroll, porque
el `IntersectionObserver` cambia el estado `enPantalla` y provoca re-render.

La captura ahora tiene un cerrojo (`poses.current.listo`) y ocurre una sola vez, cuando aparece el
nodo. El tope duro de 90° cubre el resto.

### Como sigue el cursor

- `pointermove` escuchado en `window`, no solo sobre el canvas: el robot vigila aunque el puntero
  este fuera del lienzo.
- Amortiguacion independiente del framerate, la que pide el documento:
  `actual + (objetivo - actual) * (1 - Math.exp(-K * dt))` con `K = 6`. Un `lerp(a, b, 0.1)` a secas
  aceleraria cuanto mayor fuera el framerate.
- La rotacion se aplica **sobre el quaternion de reposo** de cada control, con
  `copy(q0).multiply(setFromAxisAngle(...))`: no acumula offset aunque un reexport cambie la pose.
- Los `THREE.Quaternion` se asignan una sola vez y se reutilizan: cero asignaciones por frame.

### Reposo, movil y accesibilidad

- Sin `pointermove` durante 4,5 s arranca un barrido de vigilancia (seno lento, ±25° de pan y ±5°
  de tilt) que se dibuja a la mitad de frames.
- En movil no hay cursor, asi que el barrido es el comportamiento permanente. No se usa `touchmove`
  para seguir el dedo: el dedo tapa el modelo.
- Con `prefers-reduced-motion: reduce` el robot queda en pose neutra y no se anima.

### Fallback

Si `public/Dahua_Robot_Replica.glb` falta, un `ErrorBoundary` monta `RobotProxy`: un robot
primitivo a **la misma escala y con los mismos pivotes**, con la misma logica de pan y tilt. El
encuadre de camara no cambia cuando llega el modelo definitivo.

### Rendimiento

Como dice el documento, 39k triangulos no son el cuello de botella. Lo que se hizo, por orden de
impacto:

1. **Render bajo demanda.** `frameloop="demand"`. El controlador llama a `invalidate()` solo
   mientras hay movimiento; al detenerse el robot, el bucle se apaga y
   `renderer.info.render.calls` queda en 0. Un `IntersectionObserver` pasa el canvas a
   `frameloop="never"` cuando sale de pantalla.
2. **Iluminacion por entorno.** `PMREMGenerator` + `RoomEnvironment` (geometria procedural, no
   descarga nada) mas **una sola** `DirectionalLight`.
3. **Sin sombras en tiempo real.** Un plano con textura radial generada en canvas hace de sombra de
   contacto: una llamada de dibujo, cero recalculo por frame.
4. **Draco.** 1.814 KB a 340 KB.
5. **Tone mapping.** `THREE.NeutralToneMapping` (Khronos PBR Neutral), que es la transformacion con
   la que se calibro el color del robot. `ACESFilmic` desatura y el azul Dahua se va de marca.
   `outputColorSpace = SRGBColorSpace`.
6. **`dpr={[1, 2]}`.** Techo en 2: en pantallas 3x el coste se triplica sin ganancia visible.
7. **Camara `near = 0.01`, `far = 10`.** Un `near` de 0,1 recortaria un modelo de 0,2857 m.
8. **Sin post-procesado.** Un bloom o un SSAO cuestan mas que todo el modelo junto.

Si hace falta rascar rendimiento en gama baja, `<RobotDahua materialesLigeros />` convierte los
materiales con `KHR_materials_clearcoat` de `MeshPhysicalMaterial` a `MeshStandardMaterial`,
bajando la rugosidad para compensar el brillo perdido. Medí antes: con 39k triangulos
probablemente no haga falta.

### Por que no GSAP

GSAP resuelve timelines y scroll: cosas con principio y fin. Este seguimiento es un sistema
amortiguado continuo que persigue un objetivo que cambia en cada `pointermove`, y ya se resuelve
con `useFrame` mas la exponencial de arriba. Sumar GSAP agregaria peso de bundle sin quitar una
sola linea. Si mas adelante querés un barrido de 360° disparado por scroll o una coreografia de
entrada por secciones, ahi si tiene sentido incorporarlo.

## 8. Entrada cinematica y arranque

**El problema:** la pagina pintaba antes que el modelo. Quien scrolleaba rapido se perdia la
interaccion, y el Hero mostraba un hueco durante la descarga del GLB.

**La solucion no es una espera fija de 1500 ms.** Castigar con un delay fijo a quien tiene el modelo
en cache es perder velocidad, que es justo lo contrario de lo que se busca. `IntroCinematica.jsx`
encadena tres fases y solo la del medio dura un tiempo fijo:

| Fase | Duracion | Que pasa |
|---|---|---|
| `cargando` | lo que tarde el GLB | Overlay a pantalla completa, logotipo y barra de progreso real. Espera minima de 260 ms para que no parpadee si el modelo ya estaba en cache. |
| `zoom` | 1200 ms | Zoom out de camara del primer plano del objetivo (`z = 0.245`, `fov 26`) al encuadre completo (`z = 0.62`, `fov 32`), con `easeInOutCubic`. |
| `saliendo` | 520 ms | Se captura el ultimo frame, se desmonta el canvas de la intro y la imagen se desvanece sobre la pagina ya montada. |

Techo de seguridad de 6000 ms: si el modelo no cargo, la intro se corta igual y la pagina aparece.
Nadie se queda mirando una pantalla en blanco.

### Por que un snapshot en la salida

El canvas del Hero se monta recien cuando la intro termina (`<Hero3D montarRobot={paginaLista} />`),
asi que **nunca hay dos contextos WebGL vivos a la vez**. Para que el desvanecido no muestre un hueco
durante esos 520 ms, se congela el ultimo frame con `gl.domElement.toDataURL()` — de ahi el
`preserveDrawingBuffer: true`, activo solo en el canvas de la intro.

### Lo que de verdad acelera el arranque

La cinematica tapa el problema; estas tres cosas lo reducen:

1. **`<link rel="preload" as="fetch">` del GLB y del decodificador Draco** en `index.html`. El modelo
   empieza a bajar junto con el HTML, sin esperar a que arranque el JS. Es lo que hace que la intro
   dure lo que tarda el zoom y no lo que tarda la descarga.
2. **El video de fondo se difiere.** Su `src` se asigna recien cuando la intro termina
   (`<VideoBackground activo={paginaLista} />`); antes queda en `preload="none"` con el poster
   cubriendo la pantalla. Durante la intro, los 3,9 MB de video no compiten con los 340 KB del modelo.
3. **La intro se salta cuando corresponde:** con `prefers-reduced-motion` y en la segunda carga de la
   misma pestana (`sessionStorage`, clave `rv-intro-vista`). Verla en cada recarga cansa y cuesta
   tiempo.

## 9. Chrome, logotipos y datos de la empresa

### El material `chrome`

`Navbar` y `Footer` no usan el mismo vidrio que las teselas: usan la variante `chrome` de
`GlassPanel`. Son las dos superficies que sostienen el logotipo, y el logotipo tiene una mitad negra.

En dark mode el chrome **no** se pinta de gris opaco. Se sube el brillo del *backdrop*:

```css
backdrop-filter: blur(56px) saturate(205%) brightness(1.85);
background: linear-gradient(180deg, rgba(255,255,255,0.09), rgba(208,213,224,0.07));
```

Lo que se ve a traves sigue siendo el video de fondo, solo que levantado. El resultado es cristal
gris de verdad —no un rectangulo plano— y da la superficie clara que el logotipo necesita sin apagar
el dark mode. Todos los tokens estan en `:root` / `html.dark` como `--chrome-*`.

### Los dos logotipos de REDVISION

El chrome mas claro ayuda, pero la palabra "VISION" es negro puro: sobre cualquier superficie oscura
el contraste no llega a 4.5:1. Por eso hay un segundo archivo,
`public/redvision-logo-dark.png`, generado desde el original invirtiendo **solo** los pixeles de baja
saturacion (negros y grises pasan a blancos y grises claros) y dejando el rojo institucional
intacto. `Navbar` y `Footer` eligen uno u otro segun el tema.

Si volves a exportar el logotipo, regenerá tambien la variante oscura con el mismo criterio: invertir
luminancia donde la saturacion sea menor a 0,22, nunca tocar los pixeles rojos.

### El logotipo de Dahua

Se usa **una sola** version: la oficial, con el wordmark negro. El archivo
`public/dahua-logo.png` es esa imagen recortada al contenido y con el fondo blanco convertido en
transparencia, asi que ya no aparece el cuadrado blanco.

Como ese negro desaparece sobre fondo oscuro, el logotipo viaja dentro de un chip blanco
(`.rv-chip-marca`) en la barra y en el pie. Se ve identico en clear mode y en dark mode, y la marca
de Dahua no se retoca. En la barra ocupa 26 px de alto y en el pie 44 px.

### Datos de la empresa

`src/datos/empresa.js` es la fuente unica de verdad: telefono, WhatsApp, correo, direccion, horarios
y redes. Cambiar un dato ahi lo propaga a la barra, al pie, al formulario y al mapa. El JSON-LD de
`index.html` se mantiene a mano; si cambias un dato, actualizalo tambien ahi.

## 10. Mapa y resenas de Google

### Mapa

`TileMapa` usa el embed de Google por consulta de direccion, que **no necesita clave de API**. Tres
decisiones:

- **El iframe no se carga hasta que la tesela se acerca al viewport** (`IntersectionObserver` con
  300 px de margen). Un mapa al pie de la pagina no tiene por que costar peticiones en el primer
  pintado.
- **Arranca cubierto por una capa de marca** con la reticula de camara y la linea de escaneo del
  Hero. Hasta que el visitante no lo activa, la rueda del mouse sigue siendo de la pagina y no del
  mapa. Una vez activo, aparece un boton para volver a bloquearlo.
- **Se trata con filtros CSS** para que entre en la paleta: desaturado en clear mode e invertido en
  dark mode, en lugar de abrir un rectangulo blanco en medio del diseno. Al activarlo recupera su
  color real.

### Resenas

`TileResenas` lee `public/resenas.json`, que se sirve estatico: se puede actualizar sin recompilar.

La tesela tiene dos partes:

1. **Puntuacion agregada.** El 4,9 y el total de opiniones suben con un contador al entrar en
   pantalla (`IntersectionObserver` + `easeOutCubic`), igual que los contadores de la seccion de
   divisiones. Es el dato que mas pesa en la decision de compra, asi que va primero y grande.
2. **Cinta vertical continua.** Las resenas se desplazan hacia arriba en bucle
   (`animate-rv-marquee-y`). La lista se renderiza **dos veces** y la animacion recorre media altura,
   de modo que el bucle no tiene costura. Se pausa al pasar el cursor o al enfocar con teclado
   (`animationPlayState`), y los bordes llevan una mascara que desvanece la entrada y la salida.

Con `prefers-reduced-motion: reduce` la cinta se reemplaza por una lista normal con scroll propio: la
regla global de accesibilidad anula las animaciones, y una cinta sin animacion quedaria congelada a
mitad de recorrido.

Las resenas se transcriben **textualmente**, sin corregir ortografia ni recortar. Los que figuran
como Local Guide llevan su distintivo.

**Nunca se muestran resenas de ejemplo.** Si el archivo esta vacio, la tesela cae en un estado que
invita a leerlas en Google. Inventar opiniones de clientes no es una opcion.

Formato del archivo:

```json
{
  "perfil": "https://www.google.com/maps/place/?q=place_id:TU_PLACE_ID",
  "puntaje": 4.8,
  "total": 127,
  "actualizado": "14/09/2026",
  "resenas": [
    {
      "autor": "Nombre Apellido",
      "autorMeta": "17 opiniones · 4 fotos",
      "localGuide": false,
      "puntaje": 5,
      "fecha": "Hace 2 meses",
      "texto": "Texto de la resena tal como la publico el cliente."
    }
  ]
}
```

Dos formas de completarlo:

1. **Manual.** Copiar y pegar las resenas reales desde la ficha de Google. Es lo mas rapido y no
   necesita infraestructura.
2. **Automatica.** Un job (cron, Netlify Function, GitHub Action) que consulte la Places API y
   reescriba el archivo:

   ```
   GET https://places.googleapis.com/v1/places/{PLACE_ID}
       ?fields=rating,userRatingCount,reviews
       &key=TU_CLAVE
   ```

   La clave **no** puede vivir en el front: la Places API no permite consultas desde el navegador por
   CORS, y exponerla seria un problema de seguridad. Por eso el job corre del lado del servidor y
   deja el JSON ya resuelto en `public/`.

## 11. Movil y tablet

### Puntos de corte

| Ancho | Que cambia |
|---|---|
| base | Una columna. HUD del Hero debajo del lienzo. Botones a ancho completo. |
| `xs` 400px | Se recupera el texto largo del chip del Hero y crece el logotipo de la barra. |
| `sm` 640px | HUD flotando sobre el robot. Botones en linea. Footer a dos columnas. |
| `md` 768px | Rejilla bento de 6 columnas. Pastilla "Powered by Dahua" visible en la barra. |
| `lg` 1024px | Rejilla de 12 columnas, dock de navegacion, maquetado asimetrico del Hero. |

Todo se escribe mobile-first: el estilo base es el del telefono y los prefijos solo agregan.

### El material en pantallas chicas

El desenfoque de fondo es lo mas caro del diseno y una GPU de telefono lo paga en bateria. Por
debajo de 768 px se recorta el **radio** del blur, no el efecto:

```css
--glass-blur: 20px;   /* 30px en escritorio */
--chrome-blur: 30px;  /* 40px */
--scrim-blur: 14px;   /* 24px */
```

El vidrio se sigue leyendo como vidrio. Ademas, con `(hover: none)`:

- Los botones suben de 44 a 48 px de alto.
- El reflejo especular baja a 0,35 de opacidad fija: sin cursor no tiene a quien seguir.
- El tilt 3D y la lente de vigilancia quedan apagados (`(hover: hover) and (pointer: fine)`).
- Los campos de formulario van a 16 px: por debajo de eso, iOS hace zoom solo al enfocarlos.

Las areas seguras de los telefonos con muesca se respetan con las utilidades `.pt-safe`, `.pb-safe`
y `.px-safe`, que usan `env(safe-area-inset-*)`.

### Datos moviles

`hero-bg.mp4` pesa 3,9 MB. En una red medida eso es dinero del visitante, asi que
`VideoBackground` consulta `navigator.connection`: con `saveData` activo o con `effectiveType`
`slow-2g`, `2g` o `3g`, el video **no se descarga** y queda el poster. El diseno no cambia: el velo,
la vineta y el grano siguen encima.

## 12. La interaccion del robot sin cursor

En escritorio el robot sigue al puntero. En telefono y tablet no hay puntero, y seguir el dedo seria
peor que no hacer nada: el dedo tapa el modelo. Hay dos fuentes de control en su lugar.

### Giroscopio: la equivalencia real

`deviceorientation` mapea la inclinacion del dispositivo al paneo y al tilt del objetivo. El efecto
es el mismo que en escritorio pero al reves: en vez de mover el cursor, la persona mueve el mundo, y
el robot **se queda apuntandole**. Es la lectura mas fiel de "te esta vigilando" que permite un
telefono.

```js
const nx = clamp(-event.gamma / 34, -1, 1)              // inclinacion izquierda/derecha
const ny = clamp((event.beta - 48) / 26, -1, 1)         // 48 grados = como se sostiene un telefono
```

iOS 13 y posteriores exigen permiso explicito desde un gesto del usuario. En vez de dejar que
aparezca un dialogo del navegador sin contexto, el permiso se pide con un boton de marca bajo el
lienzo: **"Que te siga"**, que pasa a **"Te esta siguiendo"** cuando el sensor esta activo. Si el
navegador lo deniega, el boton desaparece y queda el arrastre, con un aviso de una linea.

### Arrastre: el que descubre cualquiera

Tocar el robot y moverlo con el dedo. Sin permisos, en todos los dispositivos, y es el gesto que
alguien prueba sin que se lo expliquen. El contenedor lleva `touch-none` para que el gesto no
arrastre la pagina, y `setPointerCapture` para que el dedo no pierda el control al salirse del
lienzo.

Las tres fuentes —cursor, giroscopio, arrastre— escriben en el mismo objetivo y comparten la misma
amortiguacion. `useControlesRobot` decide cuales estan activas segun el dispositivo.

### Reposo

Sin interaccion durante 4,5 segundos arranca el barrido de vigilancia, igual que en escritorio. En
un telefono sin giroscopio activo y sin nadie tocando, eso es lo que mantiene vivo al robot.

### Encuadre responsivo

Un telefono vertical tiene un lienzo mucho mas angosto que alto, y una distancia de camara fija
recorta el robot por los lados. `distanciaCamara(aspect, fov)` calcula la distancia minima que deja
entrar el modelo entero por las dos dimensiones y toma la mayor. Lo usan el Hero y la cinematica de
entrada.

El techo de `dpr` baja de 2 a **1,6** sin cursor: la ganancia visual no compensa el coste de
sombreado en una GPU movil.

## 13. Presupuesto de la primera visita

La primera carga se sentia tosca. Estas son las cuatro causas que se corrigieron, por orden de
impacto medido en trabajo evitado, no en bytes.

### 1. Quince desenfoques vivos al mismo tiempo

Cada elemento con `backdrop-filter` obliga al navegador a recomponer y desenfocar el fondo que tiene
detras, en cada frame. La pagina tiene unas quince teselas de vidrio: eso son quince desenfoques
vivos durante todo el scroll, la mayoria de ellos fuera de pantalla.

`GlassPanel` monta un `IntersectionObserver` que marca `data-vidrio="on"` cuando la tesela se acerca
al viewport (25 % de margen) y lo quita al alejarse. El filtro vive solo en
`.glass[data-vidrio='on']`. El aspecto no cambia: lo que cambia es que el compositor deja de
trabajar por lo que nadie esta mirando.

### 2. Un desenfoque de pantalla completa por frame

El velo del fondo desenfocaba todo el viewport con CSS. Ahora el desenfoque viene horneado en el
video (seccion 3) y el velo aplica 3 px residuales en escritorio y **cero** en telefono.

### 3. 3,9 MB de video en la ruta critica

Desenfocado y a 854 px, el mismo video pesa **717 KB**. El poster bajo de 43 KB a 7 KB.

### 4. Todo el JavaScript de golpe

`App.jsx` carga con `React.lazy` el lienzo bento, el contacto y el pie. En el primer pintado el
navegador solo ejecuta la barra, el Hero y el robot; el resto llega mientras el visitante lee el
titular.

La hoja de fuentes tampoco bloquea: entra como `media="print"` y pasa a `all` al cargar, con
`display=swap`. Ademas se recortaron los pesos tipograficos de cinco a tres por familia.

### Lo que sigue siendo caro, a proposito

El GLB de 340 KB y el `three` con R3F estan en la ruta critica porque la cinematica de entrada los
necesita. Esa es la decision de diseno del sitio, y por eso el modelo se precarga desde el `<head>`
y el video espera a que la intro termine.

## 14. Accesibilidad y rendimiento

- `prefers-reduced-transparency: reduce` vuelve **todo el vidrio opaco** y apaga `backdrop-filter`.
  Es la mitigacion obligatoria de un diseno glass.
- `prefers-reduced-motion: reduce` pausa el video, deja el robot en pose neutra y apaga el escaneo,
  el ticker y los contadores.
- Foco visible en rojo institucional en ambos modos.
- Objetivos tactiles de 44×44 px minimo en toda la barra, switches e inputs.
- El comparador y los conmutadores son navegables por teclado con `role`/`aria-*` correctos.
- `three` + R3F van en su propio chunk (`manualChunks` en `vite.config.js`).
- El texto sobre vidrio lleva `.text-onglass` (sombra de 1 px) para sostener contraste cuando el
  video se mueve detras.

## 15. Pendientes antes de publicar

- [x] Exportar `public/Dahua_Robot_Replica.glb` con Draco (340 KB)
- [x] Verificar los ejes de paneo y tilt
- [ ] Comprobar en el navegador: `__rvRobotTest(90)` gira la cara sin mover el cuerpo ni la rejilla
- [ ] Comprobar que `__rvRobotTest(0, -8)` no rompe el frontal negro del objetivo
- [ ] Comprobar que scrollear repetidas veces ya no acumula giro en la cabeza
- [ ] Medir el blanco del render: debe dar `#F4F4F4` sin llegar a 255; con esa exposicion el azul
      cae cerca de `#3457B4`
- [x] Telefono y correo oficiales integrados (`src/datos/empresa.js`)
- [x] Direccion confirmada: `Virrey Cevallos 784, C1077 CABA`
- [x] Resenas reales cargadas en `public/resenas.json` (4,9 sobre 619 opiniones, 6 resenas)
- [x] Horarios de atencion confirmados: lunes a viernes 09:00-18:00, sabados 09:00-13:00
- [ ] Refrescar `public/resenas.json` cada tanto: el total de opiniones envejece
- [ ] Conectar el formulario a un endpoint real (ver `TODO` en `Contacto.jsx`)
- [ ] Cambiar `hero-poster.jpg` por una foto nocturna real para el comparador Full-color
- [ ] Segunda version del logotipo con "VISION" en blanco, para dark mode
- [ ] Actualizar la URL canonica en `index.html`
- [ ] Verificar `backdrop-filter` en Firefox ESR antiguo (fallback: velo mas opaco)

## 16. El QR del escudo

`RV_Cuerpo_EscudoSponsor` lleva una textura de 512 x 818 empaquetada en el GLB, con el logotipo de
Dahua, la marca PARTNER y un codigo QR **funcional**, decodificado del escudo del robot fisico.
Apunta a `https://app.dahuasecurity.com/download.html`, la descarga de la app DMSS.

### El problema: el tamano

Un lector de QR necesita unos 250 px de ancho de codigo para engancharlo. En el encuadre normal del
Hero el escudo mide unos 40 px: nadie puede escanearlo apuntando el telefono al monitor.

### La solucion: acercar la camara

Al tocar el escudo, la camara 3D se acerca hasta que el escudo ocupa casi todo el lienzo. Recien ahi
el codigo llega al tamano que necesita un lector.

```js
const alto = Math.max(medidas.y, medidas.x / aspect) * MARGEN_ESCUDO
const distancia = alto / 2 / Math.tan(degToRad(fov) / 2)
```

La caja envolvente del escudo se calcula en tiempo de ejecucion con `Box3().setFromObject()`, asi que
el encuadre sigue siendo correcto si el modelo cambia. La transicion usa la misma amortiguacion
exponencial que la cabeza: independiente del framerate.

Mientras el QR esta en primer plano se apagan el aro optico, la linea de escaneo y las pastillas del
HUD. Cruzan el codigo y un lector se traba con ellos.

Se sale con el boton "Volver al robot" o con `Escape`.

### Detalles de implementacion

- **Solo el escudo participa del raycast.** A las demas mallas se les asigna `raycast = () => null`.
  Sin eso, cada movimiento del puntero probaria los 39.342 triangulos del modelo, en cada frame.
- **Un arrastre no dispara el acercamiento.** Por debajo de 8 px de desplazamiento el gesto cuenta
  como click; por encima es un arrastre del robot. Importa en telefono, donde el dedo siempre se
  mueve un poco.
- **Al pasar el cursor** el escudo se tinta con el rojo institucional y aparece una pastilla.
- **Teclado y lector de pantalla.** El contenido de un canvas no existe para ninguno de los dos, asi
  que el mismo destino esta ademas como enlace real fuera del lienzo, visible al tabular.

El destino vive en `EMPRESA.qrEscudo` (`src/datos/empresa.js`). **Si lo cambias, el boton y el
escaneo dejan de coincidir**: el QR esta horneado en la textura, y para cambiar el destino de verdad
hay que regenerar la imagen y reexportar el GLB.

## 17. Limitaciones conocidas del modelo

Del documento de integracion, para que no sorprendan:

0. **El objetivo no se puede animar.** La cara frontal de `RV_Lente_NegroLogo` tiene un agujero de
   8,7 mm de radio y el cristal mide 5,65 mm: 3 mm de juego en total. Cualquier recorrido util saca
   el cristal de su agujero, y ese era el rompimiento visual al mirar arriba y abajo. Por eso el
   tilt se hace con la cabeza y `CTRL_Lente` queda en reposo. Si alguna vez se quiere un objetivo
   que se mueva, hay que agrandar el agujero del frontal en Blender.

1. **El casco es mas alto de lo que deberia.** En el robot real su altura es 0,59 veces su ancho;
   en el modelo es 0,875. Al girar la cabeza de perfil, el casco tapa el cuerpo de la camara, el aro
   dorado y la base. Es la correccion pendiente mas grande.
2. **La espalda esta simplificada.** Faltan la mochila trasera, las rejillas y el tornillo. **No uses
   el modelo en animaciones que giren la camara 360° alrededor del cuerpo.** Girar la cabeza si es
   seguro, y es lo unico que hace la web.
3. **No hay partes moviles ademas de la cabeza.** Brazos, escudo y espada estan fusionados con el
   cuerpo por material.
4. **El peto no tiene el chevron** que el original lleva bajo el simbolo WiFi.
5. **El QR del escudo es funcional** y apunta a `https://app.dahuasecurity.com/download.html`. Para
   escanearlo desde pantalla necesita unos 250 px de ancho en el render y en el encuadre del Hero
   queda por debajo, asi que el escudo se hizo clickeable. Ver la seccion 16.
