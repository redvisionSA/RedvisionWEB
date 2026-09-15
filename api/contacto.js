/**
 * api/contacto.js
 * -----------------------------------------------------------------------
 * Funcion serverless de Vercel (se despliega sola: cualquier archivo bajo
 * /api es una ruta). Recibe el formulario de src/components/Contacto.jsx
 * y envia un correo REAL a la casilla de la empresa via Resend.
 *
 * Por que Resend y no Nodemailer + Gmail SMTP: Gmail bloquea el envio SMTP
 * desde un servidor que no sea "de confianza" salvo que se configure una
 * contrasena de aplicacion, y aun asi los limites de envio y el riesgo de
 * marca como spam son mas altos. Resend esta pensado para justamente este
 * caso -notificaciones transaccionales desde una funcion serverless- y su
 * capa gratuita alcanza sobra para un formulario de contacto.
 *
 * CONFIGURACION REQUERIDA (una sola vez, en el dashboard de Vercel):
 *   1. Crear una cuenta en https://resend.com (gratis).
 *   2. Generar una API key y cargarla como variable de entorno del proyecto
 *      en Vercel: RESEND_API_KEY.
 *   3. Opcional pero recomendado: verificar el dominio propio en Resend
 *      (Domains > Add Domain) y cargar RESEND_FROM con una direccion de ese
 *      dominio, por ejemplo "REDVISION Web <contacto@redvision.com.ar>".
 *      Sin este paso, el correo sale desde la direccion de prueba de Resend
 *      (onboarding@resend.dev): funciona, pero se ve menos profesional y
 *      Resend limita el volumen de esa direccion compartida.
 *   4. Opcional: CONTACTO_EMAIL_DESTINO si algun dia la casilla cambia sin
 *      tocar codigo. Por defecto usa la casilla de EMPRESA.email.
 */

const DESTINATARIO = process.env.CONTACTO_EMAIL_DESTINO || 'ecommerce2.redvision@gmail.com'
const REMITENTE = process.env.RESEND_FROM || 'REDVISION Web <onboarding@resend.dev>'

const TIPO_LABEL = {
  compra: 'Compra de equipamiento',
  proyecto: 'Proyecto llave en mano',
  capacitacion: 'Capacitación técnica',
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'Método no permitido.' })
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  const { nombre, empresa, email, telefono, tipo, mensaje, _hp } = cuerpo

  /* Honeypot: un campo oculto para humanos, irresistible para un bot que
     completa todos los inputs de un formulario. Si llega con contenido,
     se responde "ok" igual -no delatar el filtro- pero no se envia nada. */
  if (_hp) {
    return res.status(200).json({ ok: true })
  }

  const faltantes = []
  if (!String(nombre || '').trim()) faltantes.push('nombre')
  if (!String(telefono || '').trim()) faltantes.push('telefono')
  if (!String(email || '').trim() || !EMAIL_RE.test(String(email).trim())) faltantes.push('email')

  if (faltantes.length > 0) {
    return res.status(400).json({ ok: false, error: `Datos inválidos o faltantes: ${faltantes.join(', ')}.` })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[api/contacto] Falta la variable de entorno RESEND_API_KEY en Vercel.')
    return res.status(500).json({
      ok: false,
      error: 'El envío de correo no está configurado todavía. Contacte a REDVISION por WhatsApp mientras tanto.',
    })
  }

  const tipoLabel = TIPO_LABEL[tipo] || 'Consulta general'
  const asunto = `Nueva consulta (${tipoLabel}) — ${String(nombre).trim()}`

  const filas = [
    ['Tipo de consulta', tipoLabel],
    ['Nombre y apellido', nombre],
    ['Empresa o matrícula', empresa || '—'],
    ['Correo electrónico', email],
    ['Teléfono / WhatsApp', telefono],
    ['Mensaje', mensaje || '—'],
  ]

  const html = `
    <div style="font-family: -apple-system, Segoe UI, Arial, sans-serif; max-width: 560px; color:#111;">
      <h2 style="margin: 0 0 16px;">${escaparHtml(asunto)}</h2>
      <table style="width:100%; border-collapse: collapse;">
        ${filas
          .map(
            ([etiqueta, valor]) => `
          <tr>
            <td style="padding:8px 12px; border-bottom:1px solid #eee; color:#666; font-size:12px; text-transform:uppercase; letter-spacing:0.06em; white-space:nowrap; vertical-align:top;">${escaparHtml(etiqueta)}</td>
            <td style="padding:8px 12px; border-bottom:1px solid #eee; font-size:14px; white-space:pre-wrap;">${escaparHtml(valor)}</td>
          </tr>`
          )
          .join('')}
      </table>
      <p style="margin-top:20px; font-size:12px; color:#999;">Enviado desde el formulario de contacto de redvision.com.ar</p>
    </div>
  `.trim()

  const texto = filas.map(([etiqueta, valor]) => `${etiqueta}: ${valor}`).join('\n')

  try {
    const respuesta = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: REMITENTE,
        to: [DESTINATARIO],
        reply_to: String(email).trim(),
        subject: asunto,
        html,
        text: texto,
      }),
    })

    if (!respuesta.ok) {
      const detalle = await respuesta.text().catch(() => '')
      console.error('[api/contacto] Resend respondió con error:', respuesta.status, detalle)
      return res.status(502).json({ ok: false, error: 'No se pudo enviar el correo. Intente nuevamente en unos minutos.' })
    }

    return res.status(200).json({ ok: true })
  } catch (error) {
    console.error('[api/contacto] Error de red al llamar a Resend:', error)
    return res.status(502).json({ ok: false, error: 'No se pudo enviar el correo. Intente nuevamente en unos minutos.' })
  }
}
