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
      "featured": false
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
| `price` | string decimal \| null | **Lista ECOMMERCE de REDVISION, en pesos, final con IVA**, convertida con la cotización del día que usa el ERP (BNA billete vendedor). `null` = "Consultar precio". Nunca `0`. |
| `availability` | enum | `disponible` · `ultimas` (pocas unidades; umbral lo define el ERP) · `a_pedido` · `sin_stock`. **No se publica la cantidad exacta.** |
| `featured` | bool | Opcional. Destacados del inicio. |

### Qué NO viaja nunca

Costo, rentabilidad, otras listas (Gremio, Mayorista, Distribuidor), stock exacto, stock de
Control Red, proveedores, datos de clientes. Solo productos `active` de catálogo con precio de
la lista ECOMMERCE de RV o marcados para la web.

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
4. Precio por perfil (gremio/mayorista) con inicio de sesión.
