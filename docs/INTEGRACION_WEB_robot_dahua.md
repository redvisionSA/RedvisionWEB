# Robot Dahua — Guía de integración web

Documento para el agente que implemente el modelo en la web de Redvision.
Describe el archivo tal como fue exportado, no un modelo genérico: los nombres
de nodo, pivotes y materiales de aquí son los reales del GLB.

---

## 1. El archivo

| Dato | Valor |
|---|---|
| Archivo | `Dahua_Robot_Replica.glb` |
| Peso | 1.813 KB (sin comprimir) |
| Altura | 0,286 m (28,6 cm, coincide con el robot físico) |
| Envergadura | 0,223 m |
| Triángulos | 39.342 |
| Mallas | 17, una por material |
| Unidades | metros |
| Origen | entre los pies, a la altura del suelo |
| Orientación | exportado con Y arriba (`export_yup`) |

El modelo replica un robot físico impreso en 3D que lleva una cámara CCTV Dahua
integrada como cabeza. Está calibrado en color contra fotografías del objeto real.

---

## 2. Jerarquía y controles

Solo hay **dos nodos animables**. Todo lo demás es estático.

```
CTRL_Cabeza          ← paneo de la cabeza (casco + cuerpo de cámara)
│   pivote: x=0, y=0.1815 m, z=0   [coordenadas glTF, Y arriba]
│
├── CTRL_Lente       ← inclinación del objetivo
│   │   pivote: x=0, y=0.1943 m, z=0
│   ├── RV_Lente_NegroLogo          (frontal negro de la cámara)
│   ├── RV_Lente_GrisArticulacion   (bisel y anillo del objetivo)
│   └── RV_Lente_LenteVidrio        (cristal)
│
├── RV_Cabeza_BlancoVidrioso        (casco + cuerpo de la cámara)
├── RV_Cabeza_AzulDahua             (cresta, tetones, trapecio)
├── RV_Cabeza_AroLaton              (aro dorado)
├── RV_Cabeza_NegroLogo             (visor de la baliza)
├── RV_Cabeza_DahuaRojo             (logotipo dahua del casco, parte roja)
└── RV_Cabeza_DahuaNegro            (logotipo dahua del casco, parte negra)

ESTÁTICOS (no tocar, no reparentar):
    RV_Cuerpo_BlancoVidrioso    RV_Cuerpo_AzulDahua
    RV_Cuerpo_GrisArticulacion  RV_Cuerpo_NegroLogo
    RV_Cuerpo_DahuaRojo         RV_Cuerpo_DahuaNegro
    RV_Cuerpo_EscudoSponsor     RV_Cuerpo_GrisCamara
```

### Reglas que no hay que romper

- **Animar únicamente `CTRL_Cabeza` y `CTRL_Lente`.** Rotar mallas sueltas
  desarma el conjunto.
- **`RV_Cuerpo_GrisCamara` es la rejilla del altavoz y la ranura SD de la base
  de la cámara. Es fija a propósito.** En una cámara PT real la base no gira,
  solo panea la bola superior. Si se reparenta a la cabeza, la rejilla da la
  vuelta con ella y el efecto se rompe.
- **Las mallas están fusionadas por material.** El brazo izquierdo, el escudo y
  la pierna derecha comparten geometría. No se puede animar una extremidad sin
  rehacer el modelo en Blender.

---

## 3. Ejes: verificar antes de asumir

En Blender el paneo es rotación Z. El exportador convierte a Y arriba, así que
**en Three.js el paneo debería ser `rotation.y`** y el tilt `rotation.x`.

**No lo doy por cierto.** No pude cargar el GLB en un navegador para
comprobarlo, y según cómo el exportador reparta la conversión de ejes, los nodos
pueden llegar con una rotación local previa. Usar este método, que funciona
en cualquier caso porque trabaja con incrementos sobre la pose inicial:

```js
// Al cargar, guardar la orientación de partida
const cabeza = scene.getObjectByName('CTRL_Cabeza');
const lente  = scene.getObjectByName('CTRL_Lente');
const qCabeza0 = cabeza.quaternion.clone();
const qLente0  = lente.quaternion.clone();

const ejePan  = new THREE.Vector3(0, 1, 0); // verificar
const ejeTilt = new THREE.Vector3(1, 0, 0); // verificar

function aplicar(pan, tilt) {
  cabeza.quaternion.copy(qCabeza0)
        .multiply(new THREE.Quaternion().setFromAxisAngle(ejePan, pan));
  lente.quaternion.copy(qLente0)
       .multiply(new THREE.Quaternion().setFromAxisAngle(ejeTilt, tilt));
}
```

**Prueba de verificación (hacerla primero):** aplicar `pan = Math.PI/2` y
comprobar visualmente que la cara mira a la derecha del espectador y el cuerpo
no se mueve. Si el robot se inclina hacia atrás en lugar de girar, el eje de
paneo es otro; probar `(0,0,1)`. Si el giro va al revés, negar el ángulo.

---

## 4. Animación: el lente sigue al cursor

### Cálculo del objetivo

```js
const objetivo = { pan: 0, tilt: 0 };

addEventListener('pointermove', (e) => {
  const nx = (e.clientX / innerWidth)  * 2 - 1;  // -1 izq, +1 der
  const ny = (e.clientY / innerHeight) * 2 - 1;  // -1 arriba, +1 abajo
  objetivo.pan  =  nx * PAN_MAX;
  objetivo.tilt =  ny * TILT_MAX;
});
```

### Límites recomendados

| Eje | Rango | Motivo |
|---|---|---|
| `pan` (CTRL_Cabeza) | ±180° (360° completo) | Geométricamente limpio, probado a 90°, 180° y 270° sin interpenetración |
| `tilt` (CTRL_Lente) | **±15°** | Más allá, el barril del objetivo empieza a salirse del frontal negro |

Para seguimiento de cursor, un paneo de ±60° se siente más natural que usar el
rango completo. Reservar el giro de 360° para animaciones puntuales: un barrido
de vigilancia, la entrada a una sección, un easter egg.

### Amortiguación independiente del framerate

Una cámara PTZ real tiene inercia. Saltar al ángulo del cursor se ve mecánico y
barato. Interpolar así, que da el mismo resultado a 30 o 144 fps:

```js
const K = 6; // mayor = más rápido; 4–8 funciona bien
function suavizar(actual, objetivo, dt) {
  return actual + (objetivo - actual) * (1 - Math.exp(-K * dt));
}
```

Usar `Math.exp`, **no** `lerp(a, b, 0.1)` a secas: el lerp simple hace que la
animación vaya más rápida cuanto mayor sea el framerate.

### Comportamiento en reposo

Si no hay `pointermove` en 4–5 segundos, iniciar un barrido lento (seno de
periodo largo, amplitud ±25° en paneo y ±5° en tilt). Refuerza la idea de
cámara de vigilancia y evita que el robot quede congelado.

### Accesibilidad y móvil

```js
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;
```
Si está activo, dejar el robot en pose neutra y no animar.

En móvil no hay cursor. Opciones: barrido en reposo permanente, o
`deviceorientation` con permiso explícito. No usar `touchmove` para seguir el
dedo, porque el dedo tapa el modelo.

---

## 5. Rendimiento

39.342 triángulos es poco. **El cuello de botella no es la geometría.** Por
orden de impacto real:

### 5.1. Renderizar bajo demanda — la mejora más grande

El robot está quieto la mayor parte del tiempo. Un bucle `requestAnimationFrame`
permanente quema batería sin ganar nada.

```js
let sucio = true;
function bucle(t) {
  const dt = Math.min((t - tPrev) / 1000, 0.1); tPrev = t;
  const panAnt = actual.pan, tiltAnt = actual.tilt;
  actual.pan  = suavizar(actual.pan,  objetivo.pan,  dt);
  actual.tilt = suavizar(actual.tilt, objetivo.tilt, dt);
  if (Math.abs(actual.pan - panAnt) > 1e-4 ||
      Math.abs(actual.tilt - tiltAnt) > 1e-4) sucio = true;
  if (sucio) { aplicar(actual.pan, actual.tilt); renderer.render(scene, camera); sucio = false; }
  requestAnimationFrame(bucle);
}
```

Complementar con un `IntersectionObserver`: si el canvas no está en pantalla,
no pedir frames.

### 5.2. Iluminación por entorno, no por luces

El modelo usa materiales PBR. Muchas luces puntuales salen caras y se ven peor
que un buen mapa de entorno.

```js
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
```

`RoomEnvironment` es geometría procedural, no descarga nada. Añadir **una sola**
`DirectionalLight` para el modelado de volumen. Evitar sombras en tiempo real:
usar un PNG de sombra de contacto sobre un plano bajo los pies.

### 5.3. Comprimir la malla

El GLB sale sin comprimir. Reexportar desde Blender con **Draco** o
**meshopt** (ambos disponibles en el exportador; la consola confirmó que están
instalados). Esperable: bajar de 1.813 KB a unos 300–500 KB. Requiere registrar
el loader correspondiente:

```js
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(draco);
```

### 5.4. Barniz (clearcoat)

Varios materiales usan `KHR_materials_clearcoat`, que en Three.js obliga a
`MeshPhysicalMaterial`, más caro que `MeshStandardMaterial`.

Si hace falta rascar rendimiento en gama baja, convertir a `MeshStandardMaterial`
bajando la rugosidad para compensar el brillo perdido. Medir antes: en un
modelo de 39k triángulos probablemente no haga falta.

### 5.5. Ajustes del renderer

```js
renderer.setPixelRatio(Math.min(devicePixelRatio, 2)); // techo en 2
renderer.toneMapping = THREE.NeutralToneMapping;       // equivale al de Blender
renderer.outputColorSpace = THREE.SRGBColorSpace;
```

`NeutralToneMapping` en Three.js es la implementación de Khronos PBR Neutral,
que es exactamente la transformación con la que se calibró el color. Usar
`ACESFilmic` desatura y el azul se irá de marca.

Sin post-procesado. Un bloom o un SSAO cuestan más que todo el modelo junto.

### 5.6. Cámara

Modelo de 0,286 m: `near = 0.01`, `far = 10`. Un `near` de 0,1 recorta el robot.

---

## 6. Color: cómo validar que la marca se respeta

Los materiales se calibraron midiendo el robot físico. Valores objetivo:

| Elemento | sRGB |
|---|---|
| Azul Dahua | `#3457B4` |
| Blanco | papel puro, `#F4F4F4` en zona iluminada |
| Rojo del logotipo dahua | `#A9111A` |
| Aro de la cámara | `#C6A878` metálico |

El azul se obtuvo comparando, en 67 fotogramas, el azul contra el blanco **de la
misma foto**. Como el blanco del robot es papel puro, esa relación da el albedo
real sin depender de la exposición ni de la dominante de la lámpara.

**Procedimiento de validación en la web:** capturar el canvas, medir el percentil
90 de los píxeles blancos y ajustar la intensidad de la luz hasta que dé
`#F4F4F4` sin llegar a 255. Con esa exposición, el azul debería caer cerca de
`#3457B4`.

Aviso: en una superficie brillante el color percibido nunca iguala al albedo. El
barniz suma un reflejo blanco que aclara proporcionalmente más a los colores
oscuros. Donde el azul recibe luz de frente se verá más claro que `#3457B4`,
igual que en las fotos del robot real. No es un error que haya que corregir
tocando el material.

---

## 7. El escudo

`RV_Cuerpo_EscudoSponsor` lleva una textura de 512×818 empaquetada en el GLB con
el logotipo "dahua TECHNOLOGY", el código QR y la marca "PARTNER".

**El QR es funcional.** Fue decodificado del escudo físico (versión 3, nivel L,
máscara 2) y regenerado limpio, verificado con cero errores. Apunta a:

```
https://app.dahuasecurity.com/download.html
```

Si en algún momento se quiere cambiar el destino, hay que regenerar la textura y
reexportar: no se puede editar el QR sobre la imagen.

Para que el QR sea escaneable desde pantalla, el escudo debe ocupar al menos
unos 250 px de ancho en el render. Por debajo de eso los módulos se funden.

---

## 8. Limitaciones conocidas

Conviene que estén sobre la mesa antes de empezar.

1. **El casco es más alto de lo que debería.** Medido del robot real, su altura
   debería ser 0,59 veces su ancho; en el modelo es 0,875. Al girar la cabeza de
   perfil se nota: el casco tapa el cuerpo de la cámara, el aro dorado y la base,
   que en el original quedan a la vista. Es la corrección pendiente más grande.

2. **La espalda está simplificada.** En una fase anterior se eliminó detalle
   trasero para aligerar el modelo y después se decidió volver a la réplica
   exacta. Faltan la mochila trasera, las rejillas y el tornillo de la espalda.
   **No usar el modelo en animaciones que giren la cámara 360° alrededor del
   cuerpo.** Girar la cabeza sí es seguro.

3. **No hay partes móviles además de la cabeza.** Brazos, escudo y espada están
   fusionados con el cuerpo.

4. **El peto no tiene el chevrón** que el original lleva bajo el símbolo WiFi.

---

## 9. Comprobaciones antes de dar por buena la integración

- [ ] Verificado empíricamente el eje de paneo (prueba de 90°)
- [ ] El cuerpo no se mueve al girar la cabeza
- [ ] La rejilla del altavoz **no** gira con la cabeza
- [ ] Tilt limitado a ±15°; el objetivo no se sale del frontal negro
- [ ] `NeutralToneMapping` activo y blanco medido en `#F4F4F4`
- [ ] Render bajo demanda: `renderer.info.render.calls` en 0 con el robot quieto
- [ ] `prefers-reduced-motion` respetado
- [ ] Comportamiento definido en móvil (sin cursor)
- [ ] GLB comprimido con Draco o meshopt
- [ ] Probado en gama baja con el pixel ratio limitado a 2
