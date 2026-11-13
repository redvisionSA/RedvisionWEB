/**
 * functions/_vercel.js
 * -----------------------------------------------------------------------
 * redvision.com.ar se publica en Cloudflare Pages (proyecto `redvision-web`,
 * subida directa con wrangler). Pages ejecuta lo que esta en functions/; las
 * funciones de la web viven en api/ con la firma de Vercel (req, res). Este
 * adaptador las expone como Pages Functions sin duplicar su logica: arma un
 * `req` con el metodo, el cuerpo y las variables del proyecto (`req.env`) y un
 * `res` minimo (setHeader, status, json) que termina en una Response.
 *
 * El archivo empieza con "_" para que Pages no lo publique como ruta.
 */
export function adaptar(handler) {
  return async ({ request, env }) => {
    const headers = new Headers({ 'Content-Type': 'application/json; charset=utf-8' })
    let status = 200
    let payload = ''
    const res = {
      setHeader(nombre, valor) {
        headers.set(nombre, valor)
        return res
      },
      status(codigo) {
        status = codigo
        return res
      },
      json(objeto) {
        payload = JSON.stringify(objeto)
        return res
      },
    }
    try {
      const body = request.method === 'GET' || request.method === 'HEAD' ? undefined : await request.text()
      await handler({ method: request.method, body, env }, res)
    } catch (error) {
      console.error('[functions] Error no controlado:', error?.message || error)
      status = 500
      payload = JSON.stringify({ ok: false, error: 'Error inesperado. Intente nuevamente en unos minutos.' })
    }
    return new Response(payload, { status, headers })
  }
}
