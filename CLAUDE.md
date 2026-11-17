# REDVISION Web — memoria del proyecto

Tienda en línea de REDVISION (seguridad electrónica, Argentina) con lo institucional en pestañas
propias. Rama `ecommerce` (12/11/2026): el inicio es la tienda; el robot, el video y el vidrio se
conservan. Ver sección "Tienda".

- Repo: `github.com/redvisionSA/RedvisionWEB`, rama `main`. Último commit al exportar: `46f73b7`.
- Producción: https://redvision.com.ar y `www` = **Cloudflare Pages, proyecto `redvision-web`**
  (cuenta tecnol.redvision, desde el 16/10). **Subida directa, sin Git conectado: un push a `main` NO
  publica.** Se publica con:
  `npm run build && npx wrangler pages deploy dist --project-name redvision-web --branch main`
  (desde la raíz del repo: sube `dist/` y compila `functions/`; pide `wrangler login` la primera vez).
  Variables del proyecto (Settings → Variables and secrets): `RESEND_API_KEY` y las opcionales de
  `.env.example`. Vercel (`redvision-maqueta.vercel.app`) sigue publicando cada push a `main`, pero ya
  no tiene el dominio.
- Stack: Vite 5 + React 18 + Tailwind 3 + React Three Fiber (`three` 0.169). ESM (`"type": "module"`).
- Comandos: `npm run dev` (5173), `npm run build`. Las funciones de `api/` **no corren en `npm run dev`**:
  probarlas con `npx wrangler pages dev dist` (el mismo runtime de producción). En Pages las expone
  `functions/` (`functions/_vercel.js` adapta la firma `(req, res)` de `api/`; la lógica vive una sola vez
  en `api/` y las variables llegan por `req.env`).

## Leer primero
`README.md` es la documentación técnica detallada (material Liquid Glass, robot 3D, contrato del GLB en
`docs/INTEGRACION_WEB_robot_dahua.md`, copy y registro). **Está desactualizado en lo siguiente; lo que
dice este archivo manda:**

| README dice | Realidad hoy |
|---|---|
| §8 `IntroCinematica` con zoom del robot | **Eliminada.** Ahora `PantallaCarga.jsx` (loader con carrusel de mensajes) tapa la página hasta que video + robot + fuentes están listos (`App.jsx`: `listo`, techo de 7 s, piso de 380 ms). Video y robot cargan en paralelo desde el primer render. No hay `sessionStorage` ni snapshot. |
| §1/§2 el rojo tiñe cada tesela | Rojo = **acento puntual** (CTA, estado activo, una palabra por titular). Bloom, canto lenticular, eyebrows y números son **grafito** (`--rv-ink`, `--glass-bloom`, `--glass-prisma-b`). Pedido de dirección: "demasiado rojo". |
| §3 velo al 78 %, vidrio casi opaco | Clear mode: `--scrim` 0.4, `--glass-bg` 0.34, blur 38 px (el video se ve a través del vidrio). El texto se sostiene con halo blanco (`.text-onglass`, `.rv-muted`), no con sombra oscura. |
| §4 comparador Full-color sobre SVG | `TileFullColor`: **divisor deslizante** (no lente circular; se probó y se descartó por mal mapeo) sobre la foto real `public/full-color-real.webp` (Caminito, La Boca). Capa base con filtro IR verdoso + scanlines + viñeta + grano + OSD "REC · CAM 04 · IR". Si falta la foto cae al SVG `EscenaNocturna`. Ocupa su propia fila de 12 columnas. |
| §12 arrastre del robot con el dedo | **No hay arrastre**: el lienzo usa `touch-action: pan-y` para no secuestrar el scroll. En táctil manda el **giroscopio** (auto en Android; iOS pide permiso con un botón). |
| §15 "conectar formulario" pendiente | Hecho: `api/contacto.js` (ver Infra). |
| Paleta estricta blanco/negro/rojo | Sigue vigente, con **dos excepciones deliberadas**: el degradé multicolor de `.rv-fullcolor-badge` (cita el wordmark de Dahua) y el verde del filtro IR de esa tesela. |

## Infra y despliegue
- **Cloudflare Pages** (`redvision-web`): dominios `redvision.com.ar`, `www.redvision.com.ar` y
  `redvision-web.pages.dev`. Antes del 16/10 el dominio apuntaba a Vercel; ese proyecto quedó solo con
  su URL `.vercel.app`.
- **Cloudflare** (zona `redvision.com.ar`, DNS completo). **No tocar**: MX `mail.redvision.com.ar`, TXT (SPF hostmar, brevo-code,
  google-site-verification, DMARC, DKIM brevo/mail), ni los subdominios del servidor en la nube
  (`ftp`, `mail`, `autoconfig`, `autodiscover`, `tech`, `lista-*` y sus `www.*`, todos → `66.97.35.140`).
- **Correo de pedidos** (`api/pedido.js`; el formulario de contacto se eliminó el 13/11): envía por **Resend** a
  `ecommerce2.redvision@gmail.com` con `reply_to` = cliente y honeypot `_hp`. Requiere en el proyecto de Pages
  `RESEND_API_KEY` (obligatoria), `RESEND_FROM` y `CONTACTO_EMAIL_DESTINO` (opcionales); ver `.env.example`.
  **Estado de la key al exportar: desconocido** (estaba pendiente de crear la cuenta). Sin key el
  formulario muestra un error controlado, nunca un falso "enviado". Sin `RESEND_FROM` sale desde
  `onboarding@resend.dev`; para producción hay que verificar el dominio en Resend (cuidado: agregar
  registros DNS de Resend en Cloudflare **no** debe pisar el SPF existente: se fusiona en un solo TXT).
- `src/datos/empresa.js` es la fuente única de teléfono, WhatsApp, correo, dirección, horarios y redes
  (`redes.tienda` ya apunta a una tienda MercadoShops existente). El JSON-LD de `index.html` es manual.
- Contacto: el teléfono se muestra como botón WhatsApp (`wa.me`) y el correo como botón que abre el
  compositor de Gmail con el destinatario cargado.

## Qué NO se puede romper (interactivo)
- **Robot 3D** (`RobotDahua.jsx`): pan/tilt desde `CTRL_Cabeza`, render bajo demanda, giroscopio
  (`useControlesRobot`), clic en el escudo → zoom al QR. Contrato de nodos/pivotes en `docs/`.
- **Liquid Glass**: tokens en `src/index.css` (`:root` / `html.dark`), primitiva `GlassPanel` con
  `data-vidrio` por `IntersectionObserver` (el `backdrop-filter` solo vive cerca del viewport: perf).
  Respeta `prefers-reduced-transparency` / `-motion`.
- Video de fondo + modo vigilancia (lente, solo con cursor), dock magnificado del `Navbar`, selector de
  catálogo, contadores, cinta de reseñas, mapa con activación por clic, tema (siempre arranca en clear).
- Reglas táctiles: nunca `touch-action: none` sobre bloques grandes; objetivos ≥ 44 px; inputs a 16 px.
- Rendimiento: `three` (~900 KB) solo lo pide la página de inicio (chunk diferido). `vite.config.js`
  separa React en su propio chunk: si React cae dentro de `three`, toda página baja WebGL. El GLB y
  Draco se precargan desde `index.html` **solo** si la ruta es `/`. **No agregar WebGL a otras páginas**.

## Qué NO se puede romper (institucional)
- Registro profesional, tratamiento impersonal o de usted; sin voseo ni coloquialismos.
- **Multimarca**: Dahua es plataforma de referencia, no el único catálogo. Todo copy nuevo (fichas de
  producto, categorías) debe sostener esa impresión.
- **No inventar cifras** (stock, precios, métricas); las reseñas de Google van textuales
  (`public/resenas.json`).
- Orden del negocio: 1 comercialización (mayorista y minorista), 2 asesoramiento técnico, 3 formación para
  instaladores. **Los proyectos ya no son de REDVISION** (ver «IARED»).
- Paleta y jerarquía del rojo (ver tabla de arriba).

## Tienda (rama `ecommerce`, 12/11/2026)
Decisiones del usuario: **catálogo desde el ERP en solo lectura**; **carrito a pedido** (sin cobro en
línea en la fase 1: el pedido llega por correo y se confirma por WhatsApp); **precio público visible**
(lista **GREMIO** de RV, final con IVA; decisión del 12/11). Mayorista y distribuidor, con inicio de sesión y Mercado Pago, fases
siguientes.

- Rutas (`react-router-dom` 6, `BrowserRouter`; `vercel.json` reescribe todo lo que no es `api/` ni
  archivo a `index.html`): `/` tienda + resumen institucional · `/productos` y `/productos/:categoria`
  (filtros en la URL: `q`, `marca`, `stock`, `orden`) · `/producto/:slug` · `/carrito` (checkout) ·
  `/favoritos` · `/cuenta` (ingreso: hoy explica que el login llega con las listas mayorista y
  distribuidor) · `/empresa` (con el mapa en `#ubicacion`) · `/iared` (`/proyectos` redirige ahí) · `/tecnologia` ·
  `/capacitaciones` · 404. **`/contacto` y su formulario se eliminaron (13/11)**: la ruta redirige a
  `/empresa#ubicacion`; las consultas van por WhatsApp con mensaje armado (`CONSULTAS` en
  `src/tienda/whatsapp.js`: asesor, mayorista, capacitación; los proyectos van por `src/datos/iared.js`). Cada página es `React.lazy`.
- **Combos de MercadoLibre** (17/11, contrato v2, aditivo): el catálogo trae `combos[]` (los aprobó una persona en el ERP, «Ofertas en la web»; precio = suma de sus productos a Gremio con IVA, calculado por el ERP). `catalogo.js` los suma como productos con `combo.componentes` (carrito, favoritos, búsqueda, categoría); la ficha lista lo que incluye; `api/pedido.js` los busca en `combos` y el correo detalla el combo. Sin enlace a ML.
- Datos: `src/tienda/catalogo.js` lee `VITE_CATALOGO_URL` (contrato en `docs/CATALOGO_API.md`). Sin
  esa variable: en dev, `src/tienda/demo.js` con la franja "Datos de demostración"; en producción, el
  endpoint del ERP `https://api-erp.redvision.com.ar/storefront/catalog` (público, no es un secreto;
  `api/pedido.js` usa el mismo por defecto). Si el ERP no responde, la tienda dice "catálogo en
  actualización". **Nunca se inventan productos, precios ni stock.**
- Estado: `src/tienda/TiendaContext.jsx` (carrito de `{id, cantidad}`, favoritos y vistos en
  `localStorage`). El navegador nunca manda precios: `api/pedido.js` los vuelve a leer del ERP, valida,
  arma el correo a ventas (Resend, mismas variables que contacto + `CATALOGO_URL`,
  `PEDIDOS_EMAIL_DESTINO`) y devuelve el número `RV-W-AAMMDD-XXXXX`. Si falla, el carrito ofrece mandar
  el pedido por WhatsApp con el detalle.
- **Búsqueda y filtros** (`src/tienda/motor.js`, `specs.js`): búsqueda tolerante (tildes, plural,
  sinónimos del rubro como bala=bullet o 4mp=4 MP, errores de tipeo con "resultados para…"), ranking
  código > nombre > marca/categoría > descripción; facetas disyuntivas con conteos (marca, tecnología,
  resolución, tipo de equipo, canales, lente, alcance IR, instalación, capacidad, puertos, categoría),
  precio con histograma y rango doble, solo con stock, chips activos, atajos, orden (relevancia,
  precio, resolución, entrega inmediata, nombre), vista grilla/lista. Todo en la URL. Las specs salen
  de `specs` del ERP y, si faltan, del texto del producto.
- **Solidez en la tienda:** en `/productos`, `/producto`, `/carrito` y `/favoritos` el `<html>` lleva
  `data-zona="tienda"` (velo del video casi opaco) y las superficies son `.rv-solido` / `.rv-sutil`
  (blanco pleno, borde 1 px, sin `backdrop-filter`). Tarjetas de producto, departamentos y beneficios
  del inicio también son sólidos. El vidrio queda para lo institucional (hero, barra, pestañas).
- Sello **"Distribuidor oficial Dahua"** (`PreHeader` en `Navbar.jsx`, logo oficial
  `public/marcas/dahua.svg` en chip blanco): segunda fila de la barra, hero, menú móvil y fichas Dahua.
- **Logos (17/11):** marcas en `public/marcas/` como SVG oficiales sanitizados (sin scripts, metadatos,
  ids ni fondo; viewBox al dibujo con 3 % de aire parejo): Dahua (nunca `dahua-logo.png`, borroso en 2x),
  Hikvision, Imou (vector negro con el naranja #F08C00 del logo oficial), TP-Link y Tenda. **EZVIZ sin
  logo** (`logo: null`, va el nombre): el vigente es otro y solo tenemos el viejo. `LogoMarca` mide con
  `medidaLogo` (`marcas.js`, peso visual parejo por `proporcion`), alt = nombre oficial; sin pastilla, en
  dark va sobre placa blanca (`.rv-logo-marca`). Logo propio vectorial: `redvision-logo.svg` (claro) y
  `redvision-logo-oscuro.svg` (el mismo con negros a blanco, rojo y gris intactos). `favicon.svg` = rombo
  (en dark el aro pasa a blanco), `favicon.png` y `apple-touch-icon.png` renderizados de él;
  `og-image.jpg` 1200x630 con URL absoluta. `redvision-logo.png` queda para el JSON-LD.
- **Barra en una sola fila (13/11):** logo · «Productos» (clic al catálogo, flecha o cursor: líneas y
  marcas) · «Empresa ▾» (Empresa, Proyectos, Tecnología, Capacitación) · buscador · sello Dahua (2xl) ·
  ingresar · favoritos · tema · carrito. En teléfono: logo · lupa (despliega el buscador) · carrito ·
  menú. Hero y páginas arrancan a ~104–124 px.
- **Inicio sin saturar (13/11):** hero con «Ver todos los productos», banda roja, **un solo carrusel
  automático** (`CarruselProductos`: avanza solo, se pausa al usarlo, quieto con reduced-motion) con
  **lo más buscado y cotizado de la semana** y **cinta automática de marcas** (`CarruselMarcas`).
  Sin departamentos ni otros rieles en el inicio: la variedad está en `/productos`.
- **Popularidad** (`src/tienda/popularidad.js`, `functions/api/evento.js`, `functions/api/populares.js`):
  el navegador avisa búsqueda elegida (1), agregado al carrito (3) y pedido (5); se cuenta una vez por
  visitante, producto y gesto por día con un hash de IP+día+sal (no se guarda la IP), últimos 7 días,
  respuesta cacheada 10 min. Base **D1** con binding `DB` (esquema `docs/popularidad.sql`) y sal
  `POPULARIDAD_SAL`. Sin la base o con menos de 4 productos rankeados, el carrusel muestra
  «Productos destacados» (el título no promete lo que no hay).
- **Buscador:** sugerencias mientras se escribe (espera 180 ms), por palabras parciales, sinónimos y
  errores de tipeo, y **por código parcial escrito como sea** («DH-IPC-HFW», «dh ipc hfw», «ipchfw»):
  se compara la consulta compactada contra el código compactado.
- **Disponibilidad visible (14/11, pedido del usuario):** pastilla con icono y texto (`Disponibilidad` en
  `piezas.jsx`), nunca solo color: Disponible (negro), Últimas unidades (rojo, punto que late), A pedido
  (gris con reloj; la ficha explica que se encarga y un asesor confirma el plazo), Sin stock (rojo pleno).
  **Sin stock**: etiqueta roja sobre la foto, con la foto desenfocada, atenuada y en gris debajo
  (`ImagenProducto`; en miniaturas de 48 px, `tamano="xs"`, solo la foto atenuada); se puede consultar el
  ingreso por WhatsApp, no agregar al carrito. A pedido sí se agrega (el pedido se confirma con el asesor).
  En oscuro el rojo de texto pasa a `rv-red-glow` por contraste.
- **Stock con sesión (14/11):** `CuentaContext` pide `GET me/stock` al ERP para cualquier canal (al entrar y
  al volver a la pestaña si pasó un minuto) y `TiendaContext` lo superpone (`conStockDeSesion`): «3 en
  stock», «Última en stock», «+10 en stock» (el ERP topea en 10: la cantidad real nunca llega). Sin sesión,
  los tramos y «Ingrese para ver el stock» (`InvitacionStock`, no en lo que está sin stock).
- **Pastilla de marca de tamaño fijo** en las tarjetas (`LogoMarca uniforme`: 96×28, logo contenido).
- **Marcas** (`src/tienda/marcas.js`, `LogoMarca` en `piezas.jsx`): Dahua, Hikvision, Imou, EZVIZ, TP-Link
  y Tenda con logo oficial (`public/marcas/`, archivos de la empresa, siempre sobre blanco) y color tomado
  del archivo: Dahua **azul secundario `#326795`** (el rojo queda para Hikvision `#D71820` y los botones),
  Imou `#F08C00`, EZVIZ `#989A9C`, TP-Link `#4ACBD6`, Tenda `#E8511B`. Franja en tarjetas, ficha, filtro,
  portada de marca y cinta del inicio. Sin archivo, nombre en texto. Genéricas: nunca se nombran.
- **Similares y compatibles** (`src/tienda/similares.js`, ficha de producto): reglas fijas sobre las specs.
  Similares = misma línea, mismo tipo de equipo, nunca menos resolución/canales/capacidad ni otro sistema
  (IP vs HDCVI). Compatibles = cámara IP → NVR, switch PoE, disco; HDCVI → XVR, fuente, disco; grabador →
  disco y cámaras de su tecnología; switch → cable y cámaras IP. Si el producto no tiene entrega
  inmediata, primero «Alternativas con stock». La equivalencia de Hikvision de Kike (rama
  `crmovil/2026-11-05-equivalencias`, sin mergear) va a llegar por el ERP y tiene prioridad.
- **Categorías del ERP** (17/11): la tienda se navega por el árbol `categories` del catálogo
  (`src/tienda/categorias.js`): `/productos/<slug>` incluye a sus descendientes; menú «Productos ▾»
  (categorías con sus hijas y marcas, superficie sólida), hoja del teléfono, panel y chips del catálogo,
  migas y pie. **Orden y alias en un solo archivo: `src/datos/categorias.js`** (`PRIORIDAD`, el resto
  alfabético, `AL_FINAL` y «…-outlet» al final; sin productos no se muestra; `LINEAS_VIEJAS` redirige
  `/productos/<linea>`, `?linea=`, `?categoria=` y `?cat=`). La faceta plana «Categoría» se quitó.
- Las seis líneas de `Servicios.jsx` siguen como copy institucional y criterio interno (similares,
  compatibles, venta cruzada; `src/tienda/lineas.js`), ya no como menú de la tienda.
- Las teselas institucionales se reutilizan sin cambiar su copy (`src/paginas/Institucionales.jsx`).
  `BentoCanvas.jsx` se eliminó; `TileRespaldo` pasó a `Servicios.jsx`.
- Psicología de compra, siempre con datos reales: reseñas de Google en el hero, "Últimas unidades"
  solo si el ERP lo dice, vistos recientemente, favoritos, carrito persistente ("Su carrito lo
  espera"), venta cruzada técnica ("Complete la instalación", `COMPLEMENTOS`), barra fija de compra en
  teléfono, WhatsApp flotante con el producto en el mensaje.

### IARED: los proyectos son de IARED (17/11)
REDVISION **no ofrece proyectos** (relevamiento, ingeniería, integración, instalación, puesta en marcha,
capacitación en obra, «llave en mano»). Los realiza **IARED** (marca propia, con su manual). La tienda solo le da visibilidad y deriva: bloque destacado en el inicio
(`BloqueIared`, antes de lo institucional), página `/iared` (`/proyectos` redirige ahí) y «Proyectos · IARED»
en «Empresa ▾» y en el pie. Se quitaron la tesela del departamento de proyectos (`TileProyectos`), la página
`Proyectos`, el mensaje `proyecto` de WhatsApp y las menciones en meta, OG y JSON-LD. La **capacitación para
instaladores** sigue siendo de REDVISION (`/capacitaciones`).
- Archivos: `src/datos/iared.js` (único lugar con sus datos), `src/components/Iared.jsx` (marca, botón,
  bloque), `src/paginas/Iared.jsx`.
- **Marca (manual de IARED v1.0, 17/11)**: logo oficial **con eslogan** en `public/iared/` (copiado byte a
  byte del manual tras revisar que no tiene scripts, `on*` ni referencias externas): a color sobre claro,
  negativo sobre Noche; 210–260 px de ancho (mínimo 160), 180 px en teléfonos, con resguardo de 2X debajo y a
  la derecha. Eslogan aprobado: «Inteligencia Aplicada a la Red» (`IARED.eslogan`). Colores del manual en el
  CSS de `.iared-zona` (Esmeralda, Verde IA, Verde Red, Lima, Tinta, Noche, Niebla, Menta; degradado
  esmeralda→lima a 120°, el claro sobre oscuro). Títulos y botones en **Sora** 600/700, que se pide a Google
  Fonts solo cuando aparece IARED (`useFuenteIared`); el cuerpo sigue con la fuente de la tienda.
  **Dentro de `.iared-zona` no va el rojo de REDVISION ni vidrio detrás del logo** (el manual lo prohíbe como color de apoyo de IARED); texto blanco
  solo sobre Esmeralda, Tinta o Noche.
- **A conversar (arquitectura de marca)**: el manual presenta a IARED como «división de inteligencia artificial
  de Control Red y Red Vision» y propone la firma «Una división de Control Red y Red Vision». La tienda no la
  muestra (nombraría a la otra empresa) y ya no dice «empresa independiente»: no afirma ninguna de las dos.
  Decidirlo con el CEO.
- **Contacto**: el manual no trae datos reales (la tarjeta de ejemplo usa «nombre@iared.com» y «+00 000…»).
  `url`, `whatsapp` y `email` siguen en `null`; mientras tanto, el botón abre el WhatsApp de REDVISION con
  «Hola REDVISION, quiero que IARED me contacte por un proyecto.» y la página lo avisa (`AvisoRespaldo`). Al
  completar un campo, el botón cambia solo (prioridad: sitio → WhatsApp → correo). **No inventar** dominio,
  cifras, clientes ni plazos de IARED.
  Superficie sólida propia (`.iared-panel`): blanco en modo claro, Noche en oscuro, con el radio de la tienda.
- Límite entre empresas: en `iared.js` no va nada de REDVISION ni de Control Red.

### Cuentas de clientes (13/11)
Solo clientes de los puntos de venta (Gremio, Mayorista, Distribuidor) dados de alta por el vendedor
en el ERP; no hay registro abierto. API: módulo `customer_portal` del ERP (CONTRACTS.md del backend),
base `VITE_CUENTAS_URL` (por defecto `https://api-erp.redvision.com.ar/shop/redvision`). Si el ERP
la apaga (`SHOP_ACCOUNTS_ENABLED=false` → 404) la web muestra «El acceso de clientes todavía no está
habilitado».
- Rutas (`src/paginas/Cuenta.jsx`, `noindex`, zona tienda): `/cuenta` (datos, cambiar contraseña,
  cerrar sesión) · `/cuenta/ingresar?volver=` · `/cuenta/activar?token=` (enlace de la invitación) ·
  `/cuenta/activar-codigo` (código `XXXX-XXXX` del vendedor) · `/cuenta/olvide` (contraseña y usuario:
  siempre el mismo mensaje) · `/cuenta/restablecer?token=`. Los errores muestran el `message` del ERP.
- Sesión (`src/cuenta/sesion.js`): accessToken solo en memoria; refreshToken rotativo + datos de la
  cuenta en `localStorage` (`rv-cuenta-v1`), sin cookies. **La renovación corre bajo Web Locks entre
  pestañas** y lee el refreshToken vigente justo antes de usarlo: reusar uno viejo cierra todas las
  sesiones de la cuenta en el ERP. Salir o entrar en otra pestaña se refleja por el evento `storage`.
- **Registro propio (14/11)**: `/cuenta/registrarse` en dos pasos (correo → `auth/register/start`, 202
  siempre; código de 6 números + CUIT/DNI + nombre + contraseña → `auth/register/complete` → sesión).
  Documento de un cliente con otro correo → cuenta `link: PENDING` (Gremio) hasta que el vendedor la
  aprueba en el ERP; Mi cuenta lo avisa. `username` puede ser null (entra con el correo).
- **Precios del canal (14/11)**: con sesión Mayorista o Distribuidor, `CuentaContext` lee `GET me/prices`
  y `TiendaContext` los superpone por `id` al catálogo (`conPreciosDeCanal` en `catalogo.js`): tarjetas,
  ficha, buscador, filtros, carrito y WhatsApp usan ese precio; sin precio en su lista, «Consultar
  precio»; junto al precio, «Precio Mayorista». Gremio no superpone (el público ya es Gremio). El JSON-LD
  no publica el precio del canal. `api/pedido.js` recibe el token en `Authorization` y lee del ERP
  `me` y `me/prices` (`CUENTAS_URL`, por defecto el de producción): el correo a ventas lleva el mismo
  precio y la cuenta del cliente; si el ERP no confirma la sesión, usa los públicos y lo avisa.
- Barra: `BotonCuenta` en `Navbar.jsx` ocupa el lugar del ícono de persona del nav de una fila (con
  sesión muestra el nombre desde `xl` y un punto rojo debajo); en la hoja del menú es la primera entrada.
- Probar en local: ERP con `SHOP_ACCOUNTS_ENABLED=true SHOP_MAIL_MODE=log SHOP_RV_URL=http://localhost:5180`
  sobre una base descartable (nunca `rvcr_dev`), `.env.local` con `VITE_CUENTAS_URL` y Vite en 5180;
  los enlaces de los correos salen en el log del ERP. **Borrar `.env.local` antes de compilar para
  publicar** (Vite lo incrusta en el build).

### Pendientes de la tienda
1. ~~Endpoint del ERP~~: en producción desde el 13/11 (`https://api-erp.redvision.com.ar/storefront/catalog`,
   precio = lista Gremio de RV con IVA; RV todavía sin stock: todo «a pedido»).
2. `RESEND_API_KEY` en las variables del proyecto `redvision-web` de Cloudflare Pages y prueba real de
   `/api/pedido` (sin la key responden un error controlado y el carrito ofrece WhatsApp).
3b. ~~D1 para «lo más buscado»~~ **Hecho 13/11:** base D1 `redvision-web` (id `98d1c3d8-fd9a-4dcc-9ad5-87dcc7e433b4`)
   con `docs/popularidad.sql`, vinculada a producción como `DB` y con el secreto `POPULARIDAD_SAL`, por la API
   de Pages (sin `wrangler.toml`, que pasaría a mandar sobre la configuración del panel).
4. SEO por producto: prerender o SSR y `sitemap.xml` (hoy es SPA; título, descripción, canónica y
   JSON-LD `Product` se ponen en el navegador).
5. Fases 2–4 del contrato: pedido → presupuesto en el ERP, Mercado Pago, precios por perfil.

## Gotchas de herramientas
- El navegador integrado (`mcp__Claude_Browser__*`) a veces devuelve screenshots en blanco tras hacer
  scroll; el DOM está bien (verificar con estilos computados / `javascript_tool`). Funciona mejor en
  pestaña nueva y con espera larga.
- Para tocar Vercel/Cloudflare con sesión real se usa Claude in Chrome (`mcp__claude-in-chrome__*`); hay
  dos Chrome conectados y hay que elegir uno (Browser 1 tenía las sesiones).
- Claude no puede guardar en disco una imagen pegada en el chat: los assets los coloca el usuario en
  `public/` (así se hizo con `full-color-real.webp`).
- Git en Windows avisa LF→CRLF; es inocuo.
