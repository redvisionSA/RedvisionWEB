# Contrato del catálogo público (ERP → tienda redvision.com.ar)

La tienda no tiene base de datos propia. Lee el catálogo de REDVISION desde el ERP
(`api-erp.redvision.com.ar`) en **modo solo lectura**, por un endpoint público que el ERP
expone para este fin. Este documento es el contrato entre los dos lados.

- Consumidores en la web: `src/tienda/catalogo.js` (navegador, `VITE_CATALOGO_URL`) y
  `api/pedido.js` (servidor, `CATALOGO_URL`, para poner precio a los pedidos).
- Mientras el endpoint no exista, `npm run dev` usa `src/tienda/demo.js` (marcado en pantalla
  como demostración); el build de producción no lo incluye y muestra "catálogo en actualización".

## Endpoint

```
GET {VITE_CATALOGO_URL}
Accept: application/json
```

Respuesta `200`, `Content-Type: application/json`, `Cache-Control: public, max-age=300`.
CORS: `Access-Control-Allow-Origin` para `https://redvision.com.ar` y `https://www.redvision.com.ar`
(y `http://localhost:5173` / `5180` solo fuera de producción).

```json
{
  "company": "RV",
  "currency": "ARS",
  "updatedAt": "2026-11-12T13:00:00-03:00",
  "brands": [{ "slug": "dahua", "name": "Dahua Technology" }],
  "categories": [{ "slug": "camaras-ip", "name": "Cámaras IP", "parent": null }],
  "products": [
    {
      "id": "uuid del producto",
      "slug": "camara-ip-bullet-4mp-dh-ipc-hfw2441s-s",
      "sku": "DH-IPC-HFW2441S-S",
      "name": "Cámara IP bullet 4 MP …",
      "description": "Texto plano, puede tener saltos de línea",
      "brand": "dahua",
      "category": "camaras-ip",
      "imageUrl": "https://… (URL pública directa, o null)",
      "price": "98500.00",
      "availability": "disponible",
      "featured": false,
      "specs": {
        "mp": 4,
        "technologies": ["Full-Color", "WizSense", "PoE"],
        "formFactor": "Bullet",
        "channels": null,
        "lensMm": 2.8,
        "irRangeM": 30,
        "environment": "exterior",
        "storageTb": null,
        "ports": null,
        "poe": true
      }
    }
  ]
}
```

### Campos de producto

| Campo | Tipo | Regla |
|---|---|---|
| `id` | string | Estable. Es lo único que el carrito guarda y lo que `api/pedido.js` busca. |
| `slug` | string | Estable y único; forma la URL `/producto/{slug}`. Cambiarlo rompe enlaces compartidos. |
| `sku` | string | Código visible al cliente (el que usa Ventas). |
| `name`, `description` | string | Sin HTML. |
| `brand`, `category` | slug | Deben existir en `brands` / `categories`. |
| `imageUrl` | string \| null | Sin foto = `null` (la web dibuja un ícono de la línea). |
| `price` | string decimal \| null | **Lista GREMIO de REDVISION, en pesos, final con IVA** (decisión del 12/11: el precio público de la web es Gremio), convertida con la cotización del día que usa el ERP (BNA billete vendedor). `null` = "Consultar precio". Nunca `0`. |
| `availability` | enum | `disponible` · `ultimas` (pocas unidades; umbral lo define el ERP) · `a_pedido` · `sin_stock`. **No se publica la cantidad exacta.** |
| `featured` | bool | Opcional. Destacados del inicio. |
| `specs` | object | **Opcional**, alimenta los filtros de la tienda. Cada clave puede faltar o ser `null`. Ver abajo. |

### `specs` (filtros facetados)

| Clave | Tipo | Ejemplo | Filtro en la tienda |
|---|---|---|---|
| `mp` | número | `4` | Resolución |
| `technologies` | string[] | `["Full-Color","WizSense"]` | Tecnología. Nombres de la marca tal cual (Full-Color, WizSense, WizMind, Starlight, Smart Dual Light, TiOC, ColorVu, AcuSense, HDCVI, IP, Wi-Fi, PoE, ePoE, H.265+…). |
| `formFactor` | string | `"Domo"` | Tipo de equipo (Domo, Bullet, PTZ, Turret / eyeball, Fisheye, NVR, XVR / DVR, Switch, Lector, Panel, Sensor, Fuente, UPS, Disco). |
| `channels` | número | `8` | Canales (grabadores). |
| `lensMm` | número | `2.8` | Lente. |
| `irRangeM` | número | `30` | Alcance de visión nocturna (la web lo agrupa en tramos). |
| `environment` | `"interior"` \| `"exterior"` | | Instalación. |
| `storageTb` | número | `4` | Capacidad (discos). |
| `ports` | número | `8` | Puertos (switches). |
| `poe` | bool | `true` | Alimentación PoE. |

Si el ERP no manda `specs` (o manda solo algunas claves), la web completa lo que falta leyendo el
nombre y la descripción (`src/tienda/specs.js`): "4 MP", "Full-Color", "8 canales", "2,8 mm",
"IR 30 m". Solo extrae lo escrito; nunca deduce. Lo que manda el ERP gana siempre.

### Marcas

- Marcas de dispositivos con identidad propia en la tienda (logo y color): **Dahua, Hikvision e Imou**
  (`src/tienda/marcas.js`). Se reconocen por slug o nombre; los logos oficiales van en
  `public/marcas/` (`dahua.svg`, `hikvision.png`, `imou.png`, `ezviz.webp`, `tp-link.png`, `tenda.webp`). También EZVIZ, TP-Link y Tenda.
- **Marcas genéricas o alternativas** (slug o nombre con "genérico", "sin marca", "alternativa",
  "OEM", "varios", "otras marcas", "importado"…): la tienda **no muestra la marca**; el producto va a
  la línea de su categoría, como cualquier otro (13/11). Si el ERP tiene un nombre distinto para estas marcas,
  sumarlo al patrón `GENERICA` de `marcas.js`.



Costo, rentabilidad, otras listas (Mayorista, Distribuidor, ECOMMERCE), stock exacto, stock de
Control Red, proveedores, datos de clientes. Solo productos `active` de catálogo con precio de
la lista GREMIO de RV.

### Categorías

`parent` es el slug del padre o `null`. La web no replica el árbol: ubica cada categoría en una de
sus seis líneas (videovigilancia, accesos, intrusión, redes, energía, accesorios) por palabras
clave (`src/tienda/lineas.js`). Lo que no encaja cae en accesorios.

## Pedidos

El navegador manda a `api/pedido.js` solo `{ id, cantidad }`. El servidor vuelve a leer este
endpoint y pone el precio. Si el endpoint no responde, el pedido se registra igual con "precio a
confirmar". Fase 1: el pedido llega a ventas por correo; no hay cobro en línea ni escritura en el
ERP.

## Evolución prevista

1. Endpoint en el ERP (este contrato).
2. Pedido web → presupuesto en el ERP (en lugar del correo), por un endpoint propio con
   `Idempotency-Key`.
3. Mercado Pago (Checkout Pro) con webhook verificado; requiere plan Pro de Vercel.
4. Precio por perfil con inicio de sesión: la cuenta mayorista ve la lista MAYORISTA y la de
   distribuidor la DISTRIBUIDOR (siempre resuelto en el ERP, nunca en el navegador).
