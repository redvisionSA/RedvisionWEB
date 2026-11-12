const ARS_ENTERO = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const ARS_CENTAVOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Precio para mostrar. El calculo real lo hace siempre el servidor. */
export function formatoPrecio(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return null
  return Number.isInteger(valor) ? ARS_ENTERO.format(valor) : ARS_CENTAVOS.format(valor)
}

/** Texto plano para buscar: sin mayusculas ni tildes. */
export function normalizarTexto(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

export function slugify(texto = '') {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
