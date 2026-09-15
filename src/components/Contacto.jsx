import { useState } from 'react'
import GlassPanel from './GlassPanel.jsx'
import { TileMapa, TileResenas } from './Ubicacion.jsx'
import EMPRESA from '../datos/empresa.js'

/**
 * Contacto.jsx
 * -----------------------------------------------------------------------
 * Tesela de conversion. El formulario separa las tres puertas de entrada al
 * negocio, porque no las atiende la misma persona:
 *   compra        mostrador y mayorista
 *   capacitacion  inscripcion al proximo taller
 *   proyecto      relevamiento de obra
 *
 * Los datos de contacto salen de src/datos/empresa.js, que es la fuente unica
 * de verdad del telefono, el correo y la direccion.
 *
 * El envio real del formulario lo hace api/contacto.js (funcion serverless
 * de Vercel, Resend por debajo). Ver ese archivo para la configuracion de
 * variables de entorno requerida.
 */

const TIPOS = [
  {
    id: 'compra',
    label: 'Compra de equipamiento',
    ayuda: 'Cotización, lista de precios o consulta de disponibilidad.',
  },
  {
    id: 'proyecto',
    label: 'Proyecto llave en mano',
    ayuda: 'Coordinamos la visita técnica y elaboramos la propuesta de ingeniería.',
  },
  {
    id: 'capacitacion',
    label: 'Capacitación técnica',
    ayuda: 'Informamos fecha, temario y disponibilidad de cupos del próximo taller.',
  },
]

const CAMPOS = [
  { id: 'nombre', label: 'Nombre y apellido', type: 'text', autoComplete: 'name', required: true },
  { id: 'empresa', label: 'Empresa o matrícula', type: 'text', autoComplete: 'organization', required: false },
  { id: 'email', label: 'Correo electrónico', type: 'email', autoComplete: 'email', required: true },
  { id: 'telefono', label: 'Teléfono / WhatsApp', type: 'tel', autoComplete: 'tel', required: true },
]

const IconoWhatsapp = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.8 9.8 0 0 0 4.69 1.2h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2Zm4.49 11.89c-.25-.12-1.46-.72-1.68-.8-.23-.09-.39-.13-.55.12s-.64.8-.78.97c-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.58.26 1.04.41 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
)

/* Sobre de correo generico, no el logotipo de Gmail: la marca de Google no
   se reproduce sin sus assets oficiales, igual que el resto del sitio usa
   glifos de linea -no logos a color- para enlazar a servicios de terceros
   (ver IconoWhatsapp arriba, o Instagram/Facebook en Footer.jsx). */
const IconoGmail = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.4" />
    <path d="m4 6.5 8 6.5 8-6.5" />
  </svg>
)

const DATOS = [
  {
    titulo: 'Ventas y mostrador',
    tipo: 'icono',
    Icono: IconoWhatsapp,
    etiqueta: 'Escribir por WhatsApp',
    href: EMPRESA.telefono.whatsapp,
  },
  {
    titulo: 'Pedidos y cotizaciones',
    tipo: 'icono',
    Icono: IconoGmail,
    etiqueta: 'Escribir por Gmail',
    /* Abre el compositor de Gmail en el navegador, no el cliente de correo
       por defecto del sistema: la cuenta de la empresa es una cuenta Gmail. */
    href: `https://mail.google.com/mail/?view=cm&fs=1&to=${EMPRESA.email}`,
  },
  {
    titulo: 'Local y depósito',
    tipo: 'texto',
    valor: EMPRESA.direccion.completa,
    href: EMPRESA.direccion.ficha,
  },
]

export default function Contacto() {
  const [tipo, setTipo] = useState(TIPOS[0].id)
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [errorEnvio, setErrorEnvio] = useState('')
  const [errores, setErrores] = useState({})

  const tipoActivo = TIPOS.find((t) => t.id === tipo) || TIPOS[0]

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    const datos = new FormData(form)
    const nuevosErrores = {}

    CAMPOS.filter((c) => c.required).forEach((campo) => {
      const valor = String(datos.get(campo.id) || '').trim()
      if (!valor) nuevosErrores[campo.id] = 'Este dato es necesario para dar respuesta.'
    })

    const email = String(datos.get('email') || '')
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nuevosErrores.email = 'Verifique el formato del correo (ejemplo: nombre@dominio.com).'
    }

    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setErrorEnvio('')
    setEnviando(true)
    try {
      const respuesta = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: datos.get('nombre'),
          empresa: datos.get('empresa'),
          email: datos.get('email'),
          telefono: datos.get('telefono'),
          tipo: datos.get('tipo'),
          mensaje: datos.get('mensaje'),
          _hp: datos.get('_hp'), // honeypot: siempre vacio para un humano
        }),
      })
      const resultado = await respuesta.json().catch(() => ({}))

      if (!respuesta.ok || !resultado.ok) {
        throw new Error(resultado.error || 'No se pudo enviar la consulta.')
      }

      setEnviado(true)
      form.reset()
    } catch (error) {
      setErrorEnvio(
        error.message || 'No se pudo enviar la consulta. Intente nuevamente o escríbanos por WhatsApp.'
      )
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section id="contacto" className="scroll-mt-32 pb-8 pt-4">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12">
          {/* ---------------- Llamado a la accion ---------------- */}
          <GlassPanel className="flex flex-col justify-between p-6 sm:p-8 md:col-span-6 lg:col-span-5">
            <div>
              <p className="rv-eyebrow mb-2">Siguiente paso</p>
              <h2 className="text-onglass font-display text-2xl font-bold sm:text-3xl">
                Su requerimiento,
                <br />
                <span className="text-rv-red">nuestra propuesta.</span>
              </h2>
              <p className="rv-muted mt-4 text-sm leading-relaxed">
                Si cuenta con el listado de equipos, enviamos precio y disponibilidad a la brevedad.
                Si el requerimiento todavía no está definido, el departamento técnico lo elabora a
                partir del escenario a cubrir, sin cargo adicional.
              </p>
            </div>

            <dl className="mt-8 flex flex-col gap-3">
              {DATOS.map((dato) => (
                <div
                  key={dato.titulo}
                  className="rounded-2xl px-4 py-3"
                  style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
                >
                  <dt
                    className="font-display text-[10px] font-semibold uppercase tracking-[0.2em]"
                    style={{ color: 'var(--rv-ink)' }}
                  >
                    {dato.titulo}
                  </dt>
                  <dd className="mt-2">
                    {dato.tipo === 'icono' ? (
                      <a
                        href={dato.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 rounded-pill py-1.5 pl-1.5 pr-4 transition-transform duration-200 ease-apple hover:scale-[1.03]"
                        style={{ background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }}
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rv-red text-white">
                          <dato.Icono className="h-5 w-5" />
                        </span>
                        <span className="text-onglass font-display text-sm font-semibold">{dato.etiqueta}</span>
                      </a>
                    ) : (
                      <a
                        href={dato.href}
                        target={dato.href.startsWith('http') ? '_blank' : undefined}
                        rel={dato.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="rv-link break-words font-display text-base font-medium"
                      >
                        {dato.valor}
                      </a>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </GlassPanel>

          {/* ---------------- Formulario ---------------- */}
          <GlassPanel className="p-6 sm:p-8 md:col-span-6 lg:col-span-7">
            {enviado ? (
              <div role="status" className="flex h-full flex-col items-center justify-center py-14 text-center">
                <span className="mb-5 inline-flex h-16 w-16 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8" aria-hidden="true">
                    <path d="m4 12 5 5L20 6" />
                  </svg>
                </span>
                <h3 className="text-onglass font-display text-xl font-semibold">Consulta registrada</h3>
                <p className="rv-muted mt-2 text-sm">
                  Un asesor técnico responde dentro de las próximas 24 horas hábiles.
                </p>
                <button type="button" onClick={() => setEnviado(false)} className="rv-btn-glass mt-7">
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                <h3 className="text-onglass font-display text-xl font-semibold">Solicitar cotización</h3>
                <p className="rv-muted mt-1 text-sm">Los campos marcados con asterisco son obligatorios.</p>

                {/* Honeypot: invisible y no alcanzable con teclado, para que
                    solo lo complete un bot. Un humano nunca lo ve ni lo llena. */}
                <input
                  type="text"
                  name="_hp"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="sr-only"
                />

                {/* Tipo de consulta */}
                <fieldset className="mt-6">
                  <legend className="text-onglass mb-3 font-display text-sm font-medium">
                    Tipo de consulta
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {TIPOS.map((t) => {
                      const esActivo = t.id === tipo
                      return (
                        <label
                          key={t.id}
                          className={`cursor-pointer rounded-pill px-4 py-2.5 font-display text-xs font-semibold
                                      transition-all duration-300 ease-apple
                                      ${esActivo ? 'text-white' : 'text-black/75 hover:text-rv-red dark:text-white/75 dark:hover:text-rv-red'}`}
                          style={
                            esActivo
                              ? { background: '#D61922', boxShadow: '0 10px 26px -14px rgba(214,25,34,0.95)' }
                              : { background: 'var(--glass-bg-thin)', border: '1px solid var(--glass-border)' }
                          }
                        >
                          <input
                            type="radio"
                            name="tipo"
                            value={t.id}
                            checked={esActivo}
                            onChange={() => setTipo(t.id)}
                            className="sr-only"
                          />
                          {t.label}
                        </label>
                      )
                    })}
                  </div>
                  <p className="rv-muted mt-2.5 text-xs">{tipoActivo.ayuda}</p>
                </fieldset>

                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {CAMPOS.map((campo) => (
                    <div key={campo.id}>
                      <label htmlFor={campo.id} className="text-onglass block font-display text-sm font-medium">
                        {campo.label}
                        {campo.required && <span className="text-rv-red"> *</span>}
                      </label>
                      <input
                        id={campo.id}
                        name={campo.id}
                        type={campo.type}
                        autoComplete={campo.autoComplete}
                        aria-invalid={Boolean(errores[campo.id])}
                        aria-describedby={errores[campo.id] ? `${campo.id}-error` : undefined}
                        className="rv-field mt-2"
                        style={errores[campo.id] ? { borderColor: '#D61922' } : undefined}
                      />
                      {errores[campo.id] && (
                        <p id={`${campo.id}-error`} className="mt-2 text-sm font-medium text-rv-red">
                          {errores[campo.id]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="sm:col-span-2">
                    <label htmlFor="mensaje" className="text-onglass block font-display text-sm font-medium">
                      Detalle del requerimiento
                    </label>
                    <textarea
                      id="mensaje"
                      name="mensaje"
                      rows={4}
                      className="rv-field mt-2"
                      placeholder={
                        tipo === 'compra'
                          ? 'Listado de equipos, o el escenario a cubrir: superficie, accesos e infraestructura existente.'
                          : tipo === 'capacitacion'
                            ? 'Experiencia previa del equipo y temas de mayor interés.'
                            : 'Tipo de sitio, superficie, cantidad de accesos y turnos de operación.'
                      }
                    />
                    <p className="rv-muted mt-2 text-xs">
                      A mayor detalle del escenario, más precisa resulta la propuesta.
                    </p>
                  </div>
                </div>

                {errorEnvio && (
                  <p role="alert" className="mt-5 text-sm font-medium text-rv-red">
                    {errorEnvio}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  className="rv-btn-primary mt-7 w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-10"
                >
                  {enviando ? 'Enviando…' : 'Enviar consulta'}
                </button>
              </form>
            )}
          </GlassPanel>

          {/* ---------------- Ubicacion y opiniones ---------------- */}
          <TileMapa className="md:col-span-6 lg:col-span-7" />
          <TileResenas className="md:col-span-6 lg:col-span-5" />
        </div>
      </div>
    </section>
  )
}
