/**
 * demo.js — SOLO DESARROLLO.
 * -----------------------------------------------------------------------
 * Catalogo de demostracion con la forma exacta del contrato del ERP
 * (docs/CATALOGO_API.md). Sirve para maquetar y probar la tienda sin el
 * endpoint real. Nombres genericos, precios ficticios: la interfaz muestra
 * una franja "Datos de demostración" mientras se usa.
 *
 * Se importa con import() detras de `import.meta.env.DEV`, por lo que Vite
 * lo elimina del build de produccion.
 */

const P = (id, name, brand, category, price, availability, extra = {}) => ({
  id: `demo-${id}`,
  slug: `demo-${id}`,
  sku: `DEMO-${String(id).padStart(4, '0')}`,
  name,
  description: extra.description || '',
  brand,
  category,
  imageUrl: null,
  price: price === null ? null : String(price),
  availability,
  featured: Boolean(extra.featured),
})

export default {
  company: 'RV',
  currency: 'ARS',
  updatedAt: new Date().toISOString(),
  brands: [
    { slug: 'dahua', name: 'Dahua Technology' },
    { slug: 'hikvision', name: 'Hikvision' },
    { slug: 'imou', name: 'Imou' },
    { slug: 'tp-link', name: 'TP-Link' },
    { slug: 'generico', name: 'Genérico' },
  ],
  categories: [
    { slug: 'camaras-ip', name: 'Cámaras IP', parent: null },
    { slug: 'camaras-hdcvi', name: 'Cámaras HDCVI', parent: null },
    { slug: 'grabadores', name: 'Grabadores NVR y XVR', parent: null },
    { slug: 'discos', name: 'Discos de vigilancia', parent: null },
    { slug: 'control-acceso', name: 'Control de acceso', parent: null },
    { slug: 'alarmas', name: 'Alarmas y sensores', parent: null },
    { slug: 'switches', name: 'Switches PoE', parent: null },
    { slug: 'cableado', name: 'Cable UTP y fibra', parent: null },
    { slug: 'fuentes', name: 'Fuentes y UPS', parent: null },
    { slug: 'soportes', name: 'Soportes y cajas', parent: null },
  ],
  products: [
    P(1, 'Cámara IP bullet 4 MP Full-Color con micrófono', 'dahua', 'camaras-ip', 98500, 'disponible', {
      featured: true,
      description: 'Imagen color de noche con luz cálida, compresión H.265+, alimentación PoE y protección IP67.',
    }),
    P(2, 'Cámara IP domo 4 MP WizSense con detección de personas', 'dahua', 'camaras-ip', 112300, 'ultimas', {
      featured: true,
      description: 'Clasificación de personas y vehículos para reducir falsas alarmas. Lente 2,8 mm.',
    }),
    P(3, 'Cámara HDCVI bullet 2 MP con infrarrojo 30 m', 'dahua', 'camaras-hdcvi', 31900, 'disponible'),
    P(4, 'Cámara HDCVI domo 5 MP lente 2,8 mm', 'dahua', 'camaras-hdcvi', 42700, 'disponible'),
    P(5, 'Cámara Wi-Fi interior motorizada 360°', 'imou', 'camaras-ip', 54900, 'disponible', { featured: true }),
    P(6, 'Grabador NVR 8 canales PoE 4K', 'dahua', 'grabadores', 289000, 'disponible', {
      featured: true,
      description: 'Ocho puertos PoE integrados, un disco de hasta 16 TB, búsqueda inteligente por personas.',
    }),
    P(7, 'Grabador XVR 4 canales 1080p Lite', 'dahua', 'grabadores', 78400, 'ultimas'),
    P(8, 'Disco rígido de vigilancia 2 TB', 'generico', 'discos', 96200, 'disponible'),
    P(9, 'Disco rígido de vigilancia 4 TB', 'generico', 'discos', 158000, 'a_pedido'),
    P(10, 'Lector de reconocimiento facial con control de presentismo', 'dahua', 'control-acceso', 465000, 'a_pedido', {
      featured: true,
    }),
    P(11, 'Cerradura electromagnética 280 kg', 'generico', 'control-acceso', 38500, 'disponible'),
    P(12, 'Kit de alarma inalámbrica con panel y 3 sensores', 'dahua', 'alarmas', 239000, 'disponible', {
      featured: true,
    }),
    P(13, 'Sensor infrarrojo pasivo inalámbrico', 'dahua', 'alarmas', 27800, 'sin_stock'),
    P(14, 'Switch PoE 8 puertos + 2 uplink', 'tp-link', 'switches', 134000, 'disponible', { featured: true }),
    P(15, 'Bobina de cable UTP Cat6 exterior 305 m', 'generico', 'cableado', 189000, 'disponible'),
    P(16, 'Fuente switching 12 V 10 A', 'generico', 'fuentes', 24600, 'disponible'),
    P(17, 'UPS interactiva 1200 VA', 'generico', 'fuentes', 172000, 'ultimas'),
    P(18, 'Caja de conexión estanca para cámara', 'dahua', 'soportes', 9800, 'disponible'),
    P(19, 'Soporte de pared para domo', 'dahua', 'soportes', 12400, 'disponible'),
    P(20, 'Cámara PTZ 4 MP zoom óptico 25x', 'dahua', 'camaras-ip', null, 'a_pedido', {
      description: 'Precio según proyecto: consulte disponibilidad y condiciones.',
    }),
    P(21, 'Cámara IP turret 4 MP ColorVu lente 2,8 mm', 'hikvision', 'camaras-ip', 104900, 'disponible', { featured: true }),
    P(22, 'Cámara IP domo 4 MP AcuSense con IR 30 m', 'hikvision', 'camaras-ip', 96400, 'ultimas'),
    P(23, 'Grabador NVR 16 canales PoE 4K', 'hikvision', 'grabadores', 412000, 'a_pedido'),
  ],
}
