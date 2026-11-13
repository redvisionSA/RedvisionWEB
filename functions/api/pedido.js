// POST /api/pedido en Cloudflare Pages: la logica es api/pedido.js (ver functions/_vercel.js).
import handler from '../../api/pedido.js'
import { adaptar } from '../_vercel.js'

export const onRequest = adaptar(handler)
