# REDVISION Web — memoria del proyecto

Tienda en línea de REDVISION (seguridad electrónica, Argentina) con lo institucional en pestañas
propias. Rama `ecommerce` (12/11/2026): el inicio es la tienda; el robot, el video y el vidrio se
conservan. Ver sección "Tienda".

- Repo: `github.com/redvisionSA/RedvisionWEB`, rama `main`. Último commit al exportar: `46f73b7`.
- Producción: https://redvision.com.ar (Vercel, proyecto `redvision-maqueta`, equipo "REDVISION IT",
  plan Hobby). También en `redvision-maqueta.vercel.app`. Cada push a `main` despliega solo.
- Stack: Vite 5 + React 18 + Tailwind 3 + React Three Fiber (`three` 0.169). ESM (`"type": "module"`).
- Comandos: `npm run dev` (5173), `npm run build`. Las funciones de `api/` **no corren en `npm run dev`**
  (solo en Vercel o con `vercel dev`).

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
- **Vercel**: dominio `redvision.com.ar` agregado a producción, SSL emitido. Sin redirección apex→www.
- **Cloudflare** (zona `redvision.com.ar`, DNS completo): el apex era un A a `66.97.35.140` (servidor
  viejo) y pasó a **CNAME `724dfa929cc19eb8.vercel-dns-017.com`, DNS only**. `www` es CNAME al apex →
  también va a Vercel. **No tocar**: MX `mail.redvision.com.ar`, TXT (SPF hostmar, brevo-code,
  google-site-verification, DMARC, DKIM brevo/mail), ni los subdominios del servidor en la nube
  (`ftp`, `mail`, `autoconfig`, `autodiscover`, `tech`, `lista-*` y sus `www.*`, todos → `66.97.35.140`).
- **Correo del formulario**: `api/contacto.js` (función serverless) envía por **Resend** a
  `ecommerce2.redvision@gmail.com` con `reply_to` = cliente y honeypot `_hp`. Requiere en Vercel
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
- Orden del negocio: 1 comercialización (mayorista y minorista), 2 proyectos llave en mano, 3 formación.
- Paleta y jerarquía del rojo (ver tabla de arriba).

## Tienda (rama `ecommerce`, 12/11/2026)
Decisiones del usuario: **catálogo desde el ERP en solo lectura**; **carrito a pedido** (sin cobro en
línea en la fase 1: el pedido llega por correo y se confirma por WhatsApp); **precio público visible**
(lista ECOMMERCE de RV, final con IVA). Gremio/mayorista con inicio de sesión y Mercado Pago, fases
siguientes.

- Rutas (`react-router-dom` 6, `BrowserRouter`; `vercel.json` reescribe todo lo que no es `api/` ni
  archivo a `index.html`): `/` tienda + resumen institucional · `/productos` y `/productos/:linea`
  (filtros en la URL: `q`, `marca`, `stock`, `orden`) · `/producto/:slug` · `/carrito` (checkout) ·
  `/favoritos` · `/empresa` · `/proyectos` · `/tecnologia` · `/capacitaciones` · `/contacto`
  (`?tipo=compra|mayorista|proyecto|capacitacion`) · 404. Cada página es `React.lazy`.
- Datos: `src/tienda/catalogo.js` lee `VITE_CATALOGO_URL` (contrato en `docs/CATALOGO_API.md`). Sin
  esa variable: en dev, `src/tienda/demo.js` con la franja "Datos de demostración"; en producción, la
  tienda dice "catálogo en actualización". **Nunca se inventan productos, precios ni stock.**
- Estado: `src/tienda/TiendaContext.jsx` (carrito de `{id, cantidad}`, favoritos y vistos en
  `localStorage`). El navegador nunca manda precios: `api/pedido.js` los vuelve a leer del ERP, valida,
  arma el correo a ventas (Resend, mismas variables que contacto + `CATALOGO_URL`,
  `PEDIDOS_EMAIL_DESTINO`) y devuelve el número `RV-W-AAMMDD-XXXXX`. Si falla, el carrito ofrece mandar
  el pedido por WhatsApp con el detalle.
- Las seis líneas de `Servicios.jsx` son los departamentos. Cada categoría del ERP se ubica en una
  línea por palabras clave (`src/tienda/lineas.js`; manda la categoría, el nombre solo desempata).
- Las teselas institucionales se reutilizan sin cambiar su copy (`src/paginas/Institucionales.jsx`).
  `BentoCanvas.jsx` se eliminó; `TileRespaldo` pasó a `Servicios.jsx`.
- Psicología de compra, siempre con datos reales: reseñas de Google en el hero, "Últimas unidades"
  solo si el ERP lo dice, vistos recientemente, favoritos, carrito persistente ("Su carrito lo
  espera"), venta cruzada técnica ("Complete la instalación", `COMPLEMENTOS`), barra fija de compra en
  teléfono, WhatsApp flotante con el producto en el mensaje.

### Pendientes de la tienda
1. **Endpoint del ERP** según `docs/CATALOGO_API.md` (sin él, producción queda sin productos: no
   publicar `main` antes).
2. `RESEND_API_KEY` en Vercel y prueba real de `/api/pedido` (en `npm run dev` no corre).
3. Plan **Pro** de Vercel antes de vender (Hobby es no comercial).
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
