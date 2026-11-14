import EMPRESA from '../datos/empresa.js'
import { formatoPrecio } from './formato.js'

const NUMERO = EMPRESA.telefono.tel.replace(/\D/g, '')

export function enlaceWhatsapp(texto) {
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(texto)}`
}

export function mensajeProducto(producto) {
  const url = typeof window !== 'undefined' ? `${window.location.origin}/producto/${producto.slug}` : ''
  return `Hola, quisiera consultar por: ${producto.nombre}${producto.sku ? ` (código ${producto.sku})` : ''}. ${url}`.trim()
}

/** Pedido como texto: sirve de respaldo si el envio por correo falla. */
export function mensajePedido({ numero, lineas, cliente, lista }) {
  const filas = lineas
    .filter((l) => l.producto)
    .map((l) => {
      const precio = l.subtotal !== null ? ` — ${formatoPrecio(l.subtotal)}` : ' — precio a confirmar'
      return `• ${l.cantidad} x ${l.producto.nombre}${l.producto.sku ? ` [${l.producto.sku}]` : ''}${precio}`
    })
  return [
    `Hola, quiero confirmar el pedido${numero ? ` ${numero}` : ''} hecho en redvision.com.ar:`,
    ...filas,
    lista ? `Precios de mi lista ${lista} (cuenta de la tienda).` : null,
    cliente?.nombre ? `Nombre: ${cliente.nombre}` : null,
    cliente?.entrega ? `Entrega: ${cliente.entrega}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

/* Mensajes armados para cada consulta: reemplazan al formulario de contacto */
export const CONSULTAS = {
  asesor: 'Hola, quisiera asesoramiento técnico para una compra.',
  mayorista: 'Hola, soy instalador / empresa y quiero abrir una cuenta mayorista en REDVISION.',
  proyecto: 'Hola, quisiera coordinar un relevamiento para un proyecto de seguridad electrónica.',
  capacitacion: 'Hola, quisiera inscribirme o recibir información de la próxima capacitación técnica.',
}

export const enlaceConsulta = (tipo) => enlaceWhatsapp(CONSULTAS[tipo] || CONSULTAS.asesor)
