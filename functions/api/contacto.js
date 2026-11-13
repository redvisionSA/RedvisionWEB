// POST /api/contacto en Cloudflare Pages: la logica es api/contacto.js (ver functions/_vercel.js).
import handler from '../../api/contacto.js'
import { adaptar } from '../_vercel.js'

export const onRequest = adaptar(handler)
