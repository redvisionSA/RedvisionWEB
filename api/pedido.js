/**
 * api/pedido.js
 * -----------------------------------------------------------------------
 * Recibe el pedido del carrito (src/paginas/Carrito.jsx) y lo envia a ventas
 * por correo (Resend). Fase 1: no hay cobro en linea; un asesor confirma
 * stock, precio y envio.
 *
 * REGLA: el navegador nunca manda precios. Solo ids y cantidades. Los
 * precios se leen aca, del mismo endpoint del ERP que alimenta la tienda.
 * Si el catalogo no responde, el pedido igual se registra con "precio a
 * confirmar": no se pierde una venta por una caida momentanea.
 *
 * Corre en Cloudflare Pages (functions/api/pedido.js la adapta; produccion)
 * y en Vercel. Las variables se leen en cada pedido: en Cloudflare llegan en
 * `req.env`, en Vercel en `process.env`.
 *
 * Cliente con sesion en la tienda (Mayorista, Distribuidor): el navegador
 * manda su accessToken en `Authorization` y aca se leen del ERP sus datos
 * (GET me) y los precios de su lista (GET me/prices), con ese token. Asi el
 * pedido lleva el mismo precio que vio la persona sin que el navegador mande
 * precios. Si el ERP no confirma la sesion, se usan los publicos y el correo
 * lo avisa.
 *
 * Variables de entorno:
 *   RESEND_API_KEY           obligatoria (la misma del formulario de contacto)
 *   RESEND_FROM              opcional; con dominio verificado tambien se envia
 *                            copia al cliente
 *   PEDIDOS_EMAIL_DESTINO    opcional; si falta, CONTACTO_EMAIL_DESTINO o la casilla de ventas
 *   CATALOGO_URL             endpoint del ERP (si falta, VITE_CATALOGO_URL y despues el de produccion)
 *   CUENTAS_URL              base de las cuentas de la tienda en el ERP (si falta, VITE_CUENTAS_URL y
 *                            despues el de produccion)
 */

function configuracion(req) {
  const env = req?.env || globalThis.process?.env || {}
  return {
    apiKey: env.RESEND_API_KEY,
    destinatario: env.PEDIDOS_EMAIL_DESTINO || env.CONTACTO_EMAIL_DESTINO || 'ecommerce2.redvision@gmail.com',
    remitente: env.RESEND_FROM || 'REDVISION Web <onboarding@resend.dev>',
    dominioVerificado: Boolean(env.RESEND_FROM),
    // El mismo endpoint publico que usa la tienda (src/tienda/catalogo.js): sin variable, el de produccion.
    catalogoUrl: env.CATALOGO_URL || env.VITE_CATALOGO_URL || 'https://api-erp.redvision.com.ar/storefront/catalog',
    // La misma base que usa la tienda (src/cuenta/api.js)
    cuentasUrl: (env.CUENTAS_URL || env.VITE_CUENTAS_URL || 'https://api-erp.redvision.com.ar/shop/redvision').replace(/\/+$/, ''),
  }
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_ITEMS = 60
const MAX_CANTIDAD = 99

const PERFILES = { consumidor: 'Consumidor final', instalador: 'Instalador / integrador', empresa: 'Empresa' }
const PAGOS = { transferencia: 'Transferencia bancaria', efectivo: 'Efectivo en el local', mercadopago: 'Mercado Pago (link de pago)' }

function escaparHtml(valor) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function texto(valor, max = 300) {
  return String(valor ?? '').trim().slice(0, max)
}

/* Precio del ERP (string decimal) a centavos enteros: sin errores de coma flotante */
function aCentavos(precio) {
  if (precio === null || precio === undefined) return null
  const m = String(precio).trim().match(/^(\d+)(?:\.(\d{1,4}))?$/)
  if (!m) return null
  const decimales = (m[2] || '').padEnd(2, '0')
  const centavos = Number(m[1]) * 100 + Number(decimales.slice(0, 2)) + (Number(decimales[2] || 0) >= 5 ? 1 : 0)
  return centavos > 0 ? centavos : null
}

function formatoCentavos(c) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(c / 100)
}

function numeroPedido() {
  const ahora = new Date()
  const ar = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
  const fecha = `${String(ar.getFullYear()).slice(2)}${String(ar.getMonth() + 1).padStart(2, '0')}${String(ar.getDate()).padStart(2, '0')}`
  const azar = (globalThis.crypto?.randomUUID?.() || Math.random().toString(16).slice(2)).replace(/-/g, '').slice(0, 5).toUpperCase()
  return `RV-W-${fecha}-${azar}`
}

async function leerCatalogo(url) {
  if (!url) return null
  try {
    const control = new AbortController()
    const corte = setTimeout(() => control.abort(), 6000)
    const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: control.signal })
    clearTimeout(corte)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const json = await r.json()
    /* Combos de ML aprobados en el ERP (`combos`, 17/11): mismo id en el carrito,
       precio calculado por el ERP con sus componentes. */
    return new Map([...(json.products || []), ...(json.combos || []).map((c) => ({ ...c, esCombo: true }))].map((p) => [String(p.id), p]))
  } catch (error) {
    console.error('[api/pedido] Catálogo no disponible, el pedido sigue con precio a confirmar:', error.message)
    return null
  }
}

const LISTAS = { GREMIO: 'Gremio', MAYORISTA: 'Mayorista', DISTRIBUIDOR: 'Distribuidor' }

async function leerJson(url, token) {
  const control = new AbortController()
  const corte = setTimeout(() => control.abort(), 6000)
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` }, signal: control.signal })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    return await r.json()
  } finally {
    clearTimeout(corte)
  }
}

/**
 * Cuenta y lista de precios del cliente con sesion. null sin token;
 * { error } si el ERP no la confirma (token vencido, ERP caido).
 */
async function leerCuenta(cuentasUrl, autorizacion) {
  const token = String(autorizacion || '').match(/^Bearer\s+(\S{10,4096})$/)?.[1]
  if (!token) return null
  try {
    const [cuenta, lista] = await Promise.all([leerJson(`${cuentasUrl}/me`, token), leerJson(`${cuentasUrl}/me/prices`, token)])
    const precios = lista.priceTier && lista.priceTier !== 'GREMIO' ? new Map((lista.prices || []).map((x) => [String(x.id), x.price])) : null
    return { cuenta, tier: lista.priceTier, link: lista.link, precios }
  } catch (error) {
    console.error('[api/pedido] No se pudo confirmar la cuenta del cliente; se usan los precios públicos:', error.message)
    return { error: true }
  }
}

async function enviarCorreo(apiKey, cuerpo) {
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cuerpo),
  })
  if (!r.ok) {
    const detalle = await r.text().catch(() => '')
    throw new Error(`Resend ${r.status}: ${detalle.slice(0, 300)}`)
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Método no permitido.' })
  }

  let cuerpo
  try {
    cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return res.status(400).json({ ok: false, error: 'Solicitud inválida.' })
  }

  /* Honeypot: responde ok sin enviar nada */
  if (cuerpo._hp) return res.status(200).json({ ok: true, numero: numeroPedido(), total: null })

  const c = cuerpo.cliente || {}
  const cliente = {
    nombre: texto(c.nombre, 120),
    telefono: texto(c.telefono, 40),
    email: texto(c.email, 160),
    perfil: PERFILES[c.perfil] || PERFILES.consumidor,
    cuit: texto(c.cuit, 20),
    pago: PAGOS[c.pago] || PAGOS.transferencia,
    entrega: c.entrega === 'envio' ? 'envio' : 'retiro',
    direccion: texto(c.direccion, 160),
    localidad: texto(c.localidad, 80),
    provincia: texto(c.provincia, 60),
    cp: texto(c.cp, 12),
    comentarios: texto(c.comentarios, 1500),
  }

  const faltantes = []
  if (!cliente.nombre) faltantes.push('nombre')
  if (!cliente.telefono) faltantes.push('teléfono')
  if (!EMAIL_RE.test(cliente.email)) faltantes.push('correo')
  if (cliente.entrega === 'envio' && (!cliente.direccion || !cliente.localidad || !cliente.provincia || !cliente.cp)) {
    faltantes.push('dirección de envío')
  }
  if (faltantes.length) {
    return res.status(400).json({ ok: false, error: `Datos inválidos o faltantes: ${faltantes.join(', ')}.` })
  }

  const items = Array.isArray(cuerpo.items) ? cuerpo.items : []
  const limpios = items
    .slice(0, MAX_ITEMS)
    .map((i) => ({ id: texto(i?.id, 80), cantidad: Math.floor(Number(i?.cantidad)) }))
    .filter((i) => i.id && Number.isInteger(i.cantidad) && i.cantidad >= 1 && i.cantidad <= MAX_CANTIDAD)
  if (!limpios.length) {
    return res.status(400).json({ ok: false, error: 'El carrito está vacío.' })
  }

  const { apiKey, destinatario, remitente, dominioVerificado, catalogoUrl, cuentasUrl } = configuracion(req)
  if (!apiKey) {
    console.error('[api/pedido] Falta la variable RESEND_API_KEY.')
    return res.status(500).json({
      ok: false,
      error: 'El envío de pedidos no está configurado todavía. Envíelo por WhatsApp con el botón de abajo.',
    })
  }

  const [catalogo, sesion] = await Promise.all([leerCatalogo(catalogoUrl), leerCuenta(cuentasUrl, req.headers?.authorization)])
  /* Lista del cliente: su precio o, si no lo tiene en su lista, a confirmar (como lo vio) */
  const precios = sesion?.precios || null
  const lineas = limpios.map((i) => {
    const p = catalogo?.get(i.id)
    const unitario = precios ? aCentavos(precios.get(i.id)) : p ? aCentavos(p.price) : null
    return {
      cantidad: i.cantidad,
      nombre: p?.name || `Producto ${i.id}`,
      sku: p?.sku || '',
      /* Lo que trae el combo, para que ventas arme el pedido sin abrir la tienda */
      componentes: p?.esCombo && Array.isArray(p.components)
        ? p.components.map((x) => `${Number(x.qty) || 1} × ${texto(x.sku || x.name, 80)}`).join(' + ')
        : '',
      publicado: catalogo ? Boolean(p) : null,
      unitario,
      subtotal: unitario !== null ? unitario * i.cantidad : null,
    }
  })
  const todosConPrecio = lineas.every((l) => l.subtotal !== null)
  const totalCentavos = lineas.reduce((s, l) => s + (l.subtotal || 0), 0)

  const numero = numeroPedido()
  const asunto = `Pedido web ${numero} — ${cliente.nombre}`
  const entregaTexto =
    cliente.entrega === 'envio'
      ? `Envío a ${cliente.direccion}, ${cliente.localidad}, ${cliente.provincia} (CP ${cliente.cp})`
      : 'Retiro en el local'

  const filasProductos = lineas
    .map(
      (l) => `<tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;">${l.cantidad}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;">${escaparHtml(l.nombre)}${l.sku ? `<br><span style="color:#888;font-size:12px;">${escaparHtml(l.sku)}</span>` : ''}${l.componentes ? `<br><span style="color:#888;font-size:12px;">Combo: ${escaparHtml(l.componentes)}</span>` : ''}${l.publicado === false ? '<br><b style="color:#D61922;font-size:12px;">No figura en el catálogo actual</b>' : ''}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;white-space:nowrap;">${l.unitario !== null ? formatoCentavos(l.unitario) : 'A confirmar'}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;font-size:14px;text-align:right;white-space:nowrap;">${l.subtotal !== null ? formatoCentavos(l.subtotal) : 'A confirmar'}</td>
      </tr>`
    )
    .join('')

  const cuentaTienda = sesion?.error
    ? 'Tenía sesión, pero el ERP no la confirmó: precios de lista Gremio. Verificar la lista del cliente.'
    : sesion
      ? [
          sesion.cuenta.name,
          sesion.cuenta.username ? `usuario ${sesion.cuenta.username}` : 'sin cliente vinculado',
          sesion.cuenta.email,
          `lista ${LISTAS[sesion.tier] || sesion.tier}`,
          sesion.link === 'PENDING' ? 'vinculación pendiente de aprobar' : null,
        ]
          .filter(Boolean)
          .join(' · ')
      : null

  const datos = [
    ...(cuentaTienda ? [['Cuenta de la tienda', cuentaTienda]] : []),
    ['Nombre', cliente.nombre],
    ['Teléfono / WhatsApp', cliente.telefono],
    ['Correo', cliente.email],
    ['Compra como', cliente.perfil],
    ['CUIT', cliente.cuit || '—'],
    ['Medio de pago preferido', cliente.pago],
    ['Entrega', entregaTexto],
    ['Comentarios', cliente.comentarios || '—'],
  ]

  const html = `
  <div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:640px;color:#111;">
    <h2 style="margin:0 0 4px;">${escaparHtml(asunto)}</h2>
    <p style="margin:0 0 16px;color:#666;font-size:13px;">Pedido sin cobro: confirmar stock, precio y envío con el cliente.${precios ? ` <b>Precios de la lista ${escaparHtml(LISTAS[sesion.tier] || sesion.tier)} del cliente.</b>` : ''}${catalogo ? '' : ' <b style="color:#D61922;">El catálogo no respondió: todos los precios quedan a confirmar.</b>'}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:12px;">
      <thead><tr style="text-align:left;color:#666;font-size:12px;text-transform:uppercase;">
        <th style="padding:8px;">Cant.</th><th style="padding:8px;">Producto</th><th style="padding:8px;text-align:right;">Unitario</th><th style="padding:8px;text-align:right;">Subtotal</th>
      </tr></thead>
      <tbody>${filasProductos}</tbody>
    </table>
    <p style="font-size:16px;text-align:right;margin:0 0 20px;"><b>Total ${todosConPrecio ? '' : 'parcial '}con IVA: ${formatoCentavos(totalCentavos)}</b></p>
    <table style="width:100%;border-collapse:collapse;">
      ${datos
        .map(
          ([k, v]) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #eee;color:#666;font-size:12px;text-transform:uppercase;white-space:nowrap;vertical-align:top;">${escaparHtml(k)}</td><td style="padding:6px 8px;border-bottom:1px solid #eee;font-size:14px;white-space:pre-wrap;">${escaparHtml(v)}</td></tr>`
        )
        .join('')}
    </table>
    <p style="margin-top:20px;font-size:12px;color:#999;">Enviado desde la tienda de redvision.com.ar</p>
  </div>`.trim()

  const textoPlano = [
    asunto,
    '',
    ...lineas.map(
      (l) => `${l.cantidad} x ${l.nombre}${l.sku ? ` [${l.sku}]` : ''}${l.componentes ? ` (combo: ${l.componentes})` : ''} — ${l.subtotal !== null ? formatoCentavos(l.subtotal) : 'a confirmar'}`
    ),
    `Total ${todosConPrecio ? '' : 'parcial '}con IVA: ${formatoCentavos(totalCentavos)}`,
    '',
    ...datos.map(([k, v]) => `${k}: ${v}`),
  ].join('\n')

  try {
    await enviarCorreo(apiKey, {
      from: remitente,
      to: [destinatario],
      reply_to: cliente.email,
      subject: asunto,
      html,
      text: textoPlano,
    })
  } catch (error) {
    console.error('[api/pedido] No se pudo enviar el pedido a ventas:', error.message)
    return res.status(502).json({ ok: false, error: 'No se pudo registrar el pedido. Envíelo por WhatsApp con el botón de abajo.' })
  }

  /* Copia al cliente: solo con dominio propio verificado en Resend. Si falla,
     el pedido ya llego a ventas: no se informa error al cliente. Se espera
     la respuesta porque la funcion se congela al responder. */
  if (dominioVerificado) {
    await enviarCorreo(apiKey, {
      from: remitente,
      to: [cliente.email],
      subject: `Recibimos su pedido ${numero} — REDVISION`,
      html: `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;max-width:640px;color:#111;"><p>Hola ${escaparHtml(cliente.nombre)}, recibimos su pedido <b>${numero}</b>. Un asesor confirma stock, precio final y envío, y le envía los datos de pago. No se realizó ningún cobro.</p>${html}</div>`,
      text: textoPlano,
    }).catch((error) => console.error('[api/pedido] Copia al cliente no enviada:', error.message))
  }

  return res.status(200).json({ ok: true, numero, total: todosConPrecio ? totalCentavos / 100 : null })
}
