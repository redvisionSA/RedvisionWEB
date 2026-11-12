/* Iconos de linea de la tienda. Mismo trazo que el resto del sitio. */
const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

export const IconoCarrito = (p) => (
  <svg {...base} {...p}>
    <path d="M3 4h2l2.2 10.4a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6" />
    <circle cx="10" cy="20" r="1.3" />
    <circle cx="17" cy="20" r="1.3" />
  </svg>
)

export const IconoBuscar = (p) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
)

export const IconoCorazon = ({ lleno, ...p }) => (
  <svg {...base} fill={lleno ? 'currentColor' : 'none'} {...p}>
    <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" />
  </svg>
)

export const IconoCheck = (p) => (
  <svg {...base} strokeWidth="2.4" {...p}>
    <path d="m4 12 5 5L20 6" />
  </svg>
)

export const IconoCamion = (p) => (
  <svg {...base} {...p}>
    <path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7" />
    <circle cx="6.5" cy="17.5" r="1.7" />
    <circle cx="17" cy="17.5" r="1.7" />
  </svg>
)

export const IconoEscudo = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3 4.5 6v5.5c0 4.4 3.1 8 7.5 9.5 4.4-1.5 7.5-5.1 7.5-9.5V6Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

export const IconoTecnico = (p) => (
  <svg {...base} {...p}>
    <path d="M4 18v-1a5 5 0 0 1 5-5h2" />
    <circle cx="10" cy="6.5" r="3.5" />
    <path d="m16.5 14 1.5 1.5 3-3M15 19.5h6" />
  </svg>
)

export const IconoLocal = (p) => (
  <svg {...base} {...p}>
    <path d="M4 10v10h16V10M3 10l2-6h14l2 6Z" />
    <path d="M9.5 20v-5h5v5" />
  </svg>
)

export const IconoMas = (p) => (
  <svg {...base} strokeWidth="2.2" {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconoMenos = (p) => (
  <svg {...base} strokeWidth="2.2" {...p}>
    <path d="M5 12h14" />
  </svg>
)

export const IconoBasura = (p) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" />
  </svg>
)

export const IconoCerrar = (p) => (
  <svg {...base} strokeWidth="2" {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconoFlecha = (p) => (
  <svg {...base} strokeWidth="2" {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
)

export const IconoEstrella = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
  </svg>
)

export const IconoWhatsapp = (p) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.74.46 3.44 1.32 4.94L2 22l5.35-1.4a9.8 9.8 0 0 0 4.69 1.2h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.09.81.83-3.02-.2-.31a8.14 8.14 0 0 1-1.25-4.3c0-4.5 3.67-8.17 8.18-8.17a8.17 8.17 0 0 1 8.17 8.18c0 4.5-3.67 8.13-8.17 8.13Zm4.49-6.09c-.25-.12-1.46-.72-1.68-.8-.23-.09-.39-.13-.55.12s-.64.8-.78.97c-.14.16-.29.18-.53.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.46-1.37-1.71-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.44.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.55-1.34-.76-1.83-.2-.48-.4-.41-.55-.42h-.47c-.16 0-.43.06-.65.31-.23.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.64 4.19 3.7.58.26 1.04.41 1.4.52.59.19 1.12.16 1.55.1.47-.07 1.46-.6 1.66-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.16-.47-.28Z" />
  </svg>
)
