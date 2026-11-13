import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTienda } from '../tienda/TiendaContext.jsx'
import LineaCarrito from '../tienda/LineaCarrito.jsx'
import { Migas } from '../tienda/piezas.jsx'
import { formatoPrecio } from '../tienda/formato.js'
import { enlaceWhatsapp, mensajePedido } from '../tienda/whatsapp.js'
import { IconoCheck, IconoEscudo, IconoWhatsapp } from '../tienda/Iconos.jsx'
import EMPRESA from '../datos/empresa.js'
import { registrarEvento } from '../tienda/popularidad.js'
import Pagina, { usePagina } from './Pagina.jsx'

/**
 * Carrito y cierre del pedido.
 *
 * Fase 1 (decision de la empresa): no se cobra en linea. El pedido llega a
 * ventas por correo (api/pedido.js) y el visitante lo confirma tambien por
 * WhatsApp. El navegador solo manda ids y cantidades: los precios los
 * resuelve el servidor contra el catalogo del ERP.
 */

const PASOS = ['Carrito', 'Datos', 'Confirmación']

const PERFILES = [
  { id: 'consumidor', label: 'Consumidor final' },
  { id: 'instalador', label: 'Instalador / integrador' },
  { id: 'empresa', label: 'Empresa' },
]

const PAGOS = [
  { id: 'transferencia', label: 'Transferencia bancaria' },
  { id: 'efectivo', label: 'Efectivo en el local' },
  { id: 'mercadopago', label: 'Mercado Pago (link de pago)' },
]

const PROVINCIAS = [
  'Ciudad Autónoma de Buenos Aires', 'Buenos Aires', 'Catamarca', 'Chaco', 'Chubut', 'Córdoba', 'Corrientes',
  'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja', 'Mendoza', 'Misiones', 'Neuquén', 'Río Negro',
  'Salta', 'San Juan', 'San Luis', 'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Pasos({ actual }) {
  return (
    <ol className="mb-6 flex items-center gap-2 px-1" aria-label="Pasos del pedido">
      {PASOS.map((p, i) => (
        <li key={p} className="flex items-center gap-2">
          <span
            className={`num inline-flex h-7 w-7 items-center justify-center rounded-pill text-xs font-bold ${
              i < actual ? 'bg-black text-white dark:bg-white dark:text-black' : i === actual ? 'bg-rv-red text-white' : 'text-black/50 dark:text-white/50'
            }`}
            style={i > actual ? { border: '1px solid rgba(127,127,127,0.35)' } : undefined}
            aria-current={i === actual ? 'step' : undefined}
          >
            {i < actual ? <IconoCheck className="h-3.5 w-3.5" /> : i + 1}
          </span>
          <span className={`font-display text-xs font-semibold uppercase tracking-wide ${i === actual ? 'text-black dark:text-white' : 'rv-muted hidden sm:inline'}`}>{p}</span>
          {i < PASOS.length - 1 && <span className="mx-0.5 h-px w-4 bg-black/20 dark:bg-white/25 sm:mx-1 sm:w-10" aria-hidden="true" />}
        </li>
      ))}
    </ol>
  )
}

function Campo({ id, label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-black/80 dark:text-white/85">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-semibold text-rv-red">
          {error}
        </p>
      )}
    </div>
  )
}

function Confirmacion({ pedido }) {
  return (
    <Pagina>
      <Pasos actual={2} />
      <div className="rv-solido mx-auto max-w-2xl p-6 text-center sm:p-10">
        <span className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-pill bg-rv-red text-white">
          <IconoCheck className="h-7 w-7" />
        </span>
        <h1 className="text-onglass font-display text-2xl font-bold sm:text-3xl">Recibimos su pedido</h1>
        <p className="mt-2 font-display text-lg font-semibold text-black dark:text-white">
          N.º <span className="num">{pedido.numero}</span>
        </p>
        <p className="rv-muted mx-auto mt-3 max-w-md text-sm leading-relaxed">
          Un asesor confirma stock, precio final y costo de envío, y le envía los datos de pago. No se realizó ningún cobro.
          Para agilizarlo, confirme el pedido por WhatsApp.
        </p>
        {pedido.total !== null && (
          <p className="mt-4 text-sm text-black/80 dark:text-white/85">
            Total estimado: <strong className="num font-display text-lg">{formatoPrecio(pedido.total)}</strong> con IVA
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={enlaceWhatsapp(pedido.mensaje)} target="_blank" rel="noopener noreferrer" className="rv-btn-primary">
            <IconoWhatsapp className="h-4 w-4" />
            Confirmar por WhatsApp
          </a>
          <Link to="/productos" className="rv-btn-glass">
            Seguir comprando
          </Link>
        </div>
      </div>
    </Pagina>
  )
}

export default function Carrito() {
  usePagina({ titulo: 'Carrito' })
  const { lineas, resumen, vaciar, catalogo } = useTienda()
  const [entrega, setEntrega] = useState('retiro')
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [pedido, setPedido] = useState(null)
  const [mensajeRespaldo, setMensajeRespaldo] = useState('')

  if (pedido) return <Confirmacion pedido={pedido} />

  const validas = lineas.filter((l) => l.producto)

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const d = Object.fromEntries(new FormData(form).entries())
    const e = {}
    if (!String(d.nombre || '').trim()) e.nombre = 'Indique nombre y apellido.'
    if (!String(d.telefono || '').trim()) e.telefono = 'Indique un teléfono o WhatsApp.'
    if (!EMAIL_RE.test(String(d.email || '').trim())) e.email = 'Verifique el correo (ejemplo: nombre@dominio.com).'
    if (entrega === 'envio') {
      ;['direccion', 'localidad', 'provincia', 'cp'].forEach((k) => {
        if (!String(d[k] || '').trim()) e[k] = 'Dato necesario para cotizar el envío.'
      })
    }
    setErrores(e)
    if (Object.keys(e).length) {
      form.querySelector(`[name="${Object.keys(e)[0]}"]`)?.focus()
      return
    }

    const cliente = {
      nombre: d.nombre,
      telefono: d.telefono,
      email: d.email,
      perfil: d.perfil,
      cuit: d.cuit,
      pago: d.pago,
      entrega,
      direccion: d.direccion,
      localidad: d.localidad,
      provincia: d.provincia,
      cp: d.cp,
      comentarios: d.comentarios,
    }
    const textoEntrega =
      entrega === 'envio' ? `Envío a ${d.direccion}, ${d.localidad}, ${d.provincia} (${d.cp})` : 'Retiro en el local'
    const respaldo = mensajePedido({ lineas: validas, cliente: { nombre: d.nombre, entrega: textoEntrega } })

    registrarEvento('pedido', validas.map((l) => l.id))
    setErrorEnvio('')
    setMensajeRespaldo('')
    setEnviando(true)
    try {
      const respuesta = await fetch('/api/pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cliente, items: validas.map((l) => ({ id: l.id, cantidad: l.cantidad })), _hp: d._hp }),
      })
      const r = await respuesta.json().catch(() => ({}))
      if (!respuesta.ok || !r.ok) throw new Error(r.error || 'No se pudo registrar el pedido.')
      setPedido({
        numero: r.numero,
        total: typeof r.total === 'number' ? r.total : null,
        mensaje: mensajePedido({ numero: r.numero, lineas: validas, cliente: { nombre: d.nombre, entrega: textoEntrega } }),
      })
      vaciar()
      window.scrollTo({ top: 0 })
    } catch (error) {
      setErrorEnvio(error.message || 'No se pudo registrar el pedido.')
      setMensajeRespaldo(respaldo)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Pagina>
      <Migas items={[{ label: 'Inicio', to: '/' }, { label: 'Carrito' }]} />
      <Pasos actual={validas.length ? 1 : 0} />

      {lineas.length === 0 ? (
        <div className="rv-solido mx-auto max-w-xl p-8 text-center">
          <h1 className="text-onglass font-display text-2xl font-bold">Su carrito está vacío</h1>
          <p className="rv-muted mt-2 text-sm">Busque por producto, código o marca, o recorra las líneas del catálogo.</p>
          <Link to="/productos" className="rv-btn-primary mt-5">
            Ver productos
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-6">
          <div className="flex flex-col gap-5">
            <div className="rv-solido p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-onglass font-display text-xl font-bold sm:text-2xl">Su pedido</h1>
                <button type="button" onClick={vaciar} className="rv-link text-xs font-semibold uppercase tracking-wide">
                  Vaciar carrito
                </button>
              </div>
              {catalogo.estado === 'cargando' ? (
                <p className="rv-muted py-6 text-sm">Actualizando precios…</p>
              ) : (
                <ul className="divide-y divide-black/10 dark:divide-white/10">
                  {lineas.map((l) => (
                    <LineaCarrito key={l.id} linea={l} />
                  ))}
                </ul>
              )}
            </div>

            <div className="rv-solido p-5 sm:p-6">
              <h2 className="text-onglass mb-4 font-display text-lg font-bold">Sus datos</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Campo id="nombre" label="Nombre y apellido *" error={errores.nombre}>
                  <input id="nombre" name="nombre" autoComplete="name" className="rv-field text-base" aria-invalid={!!errores.nombre} />
                </Campo>
                <Campo id="telefono" label="Teléfono / WhatsApp *" error={errores.telefono}>
                  <input id="telefono" name="telefono" type="tel" autoComplete="tel" inputMode="tel" className="rv-field text-base" aria-invalid={!!errores.telefono} />
                </Campo>
                <Campo id="email" label="Correo electrónico *" error={errores.email}>
                  <input id="email" name="email" type="email" autoComplete="email" inputMode="email" className="rv-field text-base" aria-invalid={!!errores.email} />
                </Campo>
                <Campo id="perfil" label="Compra como">
                  <select id="perfil" name="perfil" className="rv-field cursor-pointer text-base" defaultValue="consumidor">
                    {PERFILES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Campo>
                <Campo id="cuit" label="CUIT (opcional, para factura A)">
                  <input id="cuit" name="cuit" inputMode="numeric" className="rv-field text-base" placeholder="30-12345678-9" />
                </Campo>
                <Campo id="pago" label="Medio de pago preferido">
                  <select id="pago" name="pago" className="rv-field cursor-pointer text-base" defaultValue="transferencia">
                    {PAGOS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Campo>
              </div>

              <fieldset className="mt-6">
                <legend className="mb-2 text-xs font-semibold text-black/80 dark:text-white/85">Entrega</legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    { id: 'retiro', titulo: 'Retiro en el local', texto: `${EMPRESA.direccion.calle}, CABA. Le avisamos cuando está listo.` },
                    { id: 'envio', titulo: 'Envío a domicilio', texto: 'Todo el país. El costo se cotiza al confirmar.' },
                  ].map((op) => (
                    <label
                      key={op.id}
                      className={`rv-sutil flex cursor-pointer items-start gap-3 rounded-xl p-4 transition-colors ${entrega === op.id ? '!border-rv-red ring-1 ring-rv-red' : ''}`}
                    >
                      <input
                        type="radio"
                        name="entrega"
                        value={op.id}
                        checked={entrega === op.id}
                        onChange={() => setEntrega(op.id)}
                        className="mt-1 h-4 w-4 accent-[#D61922]"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-black dark:text-white">{op.titulo}</span>
                        <span className="rv-muted block text-xs">{op.texto}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {entrega === 'envio' && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Campo id="direccion" label="Calle y número *" error={errores.direccion} className="sm:col-span-2">
                    <input id="direccion" name="direccion" autoComplete="street-address" className="rv-field text-base" />
                  </Campo>
                  <Campo id="localidad" label="Localidad *" error={errores.localidad}>
                    <input id="localidad" name="localidad" autoComplete="address-level2" className="rv-field text-base" />
                  </Campo>
                  <Campo id="cp" label="Código postal *" error={errores.cp}>
                    <input id="cp" name="cp" autoComplete="postal-code" className="rv-field text-base" />
                  </Campo>
                  <Campo id="provincia" label="Provincia *" error={errores.provincia} className="sm:col-span-2">
                    <select id="provincia" name="provincia" className="rv-field cursor-pointer text-base" defaultValue="">
                      <option value="" disabled>
                        Seleccione
                      </option>
                      {PROVINCIAS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Campo>
                </div>
              )}

              <Campo id="comentarios" label="Comentarios (opcional)" className="mt-4">
                <textarea id="comentarios" name="comentarios" rows={3} className="rv-field text-base" placeholder="Horario de entrega, datos del proyecto, consultas técnicas…" />
              </Campo>

              {/* Honeypot: invisible para personas */}
              <div className="hidden" aria-hidden="true">
                <label htmlFor="_hp">No completar</label>
                <input id="_hp" name="_hp" tabIndex={-1} autoComplete="off" />
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-[110px] lg:self-start">
            <div className="rv-solido p-5 sm:p-6">
              <h2 className="text-onglass font-display text-lg font-bold">Resumen</h2>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="rv-muted">Productos ({resumen.unidades})</dt>
                  <dd className="num font-semibold text-black dark:text-white">{formatoPrecio(resumen.subtotal) || '$ 0'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="rv-muted">Envío</dt>
                  <dd className="text-black dark:text-white">{entrega === 'retiro' ? 'Sin cargo (retiro)' : 'A cotizar'}</dd>
                </div>
              </dl>
              <div className="mt-4 flex items-baseline justify-between border-t rv-hairline pt-4">
                <span className="font-semibold text-black dark:text-white">Total estimado</span>
                <span className="num font-display text-3xl font-bold text-black dark:text-white">{formatoPrecio(resumen.subtotal) || '$ 0'}</span>
              </div>
              <p className="rv-muted mt-1 text-xs">
                IVA incluido.{resumen.hayAConfirmar ? ' Incluye productos con precio a confirmar.' : ''}
              </p>

              {errorEnvio && (
                <div className="mt-4 rounded-2xl p-4 text-sm" style={{ border: '1px solid #D61922', background: 'rgba(214,25,34,0.06)' }} role="alert">
                  <p className="font-semibold text-rv-red">{errorEnvio}</p>
                  {mensajeRespaldo && (
                    <a href={enlaceWhatsapp(mensajeRespaldo)} target="_blank" rel="noopener noreferrer" className="rv-btn-primary mt-3 w-full">
                      <IconoWhatsapp className="h-4 w-4" />
                      Enviar el pedido por WhatsApp
                    </a>
                  )}
                </div>
              )}

              <button type="submit" disabled={enviando || validas.length === 0} className="rv-btn-primary mt-5 w-full disabled:cursor-not-allowed disabled:opacity-60">
                {enviando ? 'Enviando pedido…' : 'Confirmar pedido'}
              </button>
              <p className="rv-muted mt-3 flex items-start gap-2 text-xs leading-relaxed">
                <IconoEscudo className="mt-0.5 h-4 w-4 shrink-0" />
                No se cobra nada ahora. Un asesor confirma stock, precio y envío y le envía los datos de pago.
              </p>
            </div>
          </div>
        </form>
      )}
    </Pagina>
  )
}
