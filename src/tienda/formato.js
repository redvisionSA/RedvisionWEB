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

/**
 * Precio que se muestra y con el que se filtra y ordena: el sin IVA que manda
 * el ERP (`netPrice`) y, si no vino, el final con IVA (respaldo honesto). El
 * navegador nunca calcula IVA: las alicuotas varian (10,5 % y 21 %).
 */
export function precioVisible(producto) {
  return producto?.precioSinIva ?? producto?.precio ?? null
}

/** Importe a centavos enteros, para sumar sin errores de coma flotante. */
export const aCentavos = (valor) => Math.round(valor * 100)

/**
 * Precio partido para mostrar los centavos chicos y arriba ($ 81.405⁷⁹):
 * { texto, entero, centavos }. `texto` es el precio completo, para lectores
 * de pantalla. null sin valor.
 */
export function partesPrecio(valor) {
  const texto = formatoPrecio(valor)
  if (!texto) return null
  if (Number.isInteger(valor)) return { texto, entero: texto, centavos: null }
  const partes = ARS_CENTAVOS.formatToParts(valor)
  const i = partes.findIndex((x) => x.type === 'decimal')
  if (i < 0) return { texto, entero: texto, centavos: null }
  return {
    texto,
    entero: partes.slice(0, i).map((x) => x.value).join(''),
    centavos: partes.slice(i + 1).map((x) => x.value).join(''),
  }
}
