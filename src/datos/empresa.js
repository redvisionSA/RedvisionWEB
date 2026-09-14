/**
 * empresa.js
 * -----------------------------------------------------------------------
 * Fuente unica de verdad de los datos de contacto de REDVISION.
 * Si cambia un telefono o una direccion, se cambia aca y se propaga a la
 * barra, al footer, al formulario, al mapa y al JSON-LD.
 *
 * OJO: `direccion` y `redes` se tomaron del sitio actual redvision.com.ar.
 * Confirmalos antes de publicar. El telefono y el correo si fueron provistos
 * directamente por la empresa.
 */

export const EMPRESA = {
  nombre: 'REDVISION',
  lema: 'Tecnología sin límites',

  telefono: {
    display: '+54 9 11 2531-6650',
    tel: '+5491125316650',
    whatsapp: 'https://wa.me/5491125316650',
  },

  email: 'ecommerce2.redvision@gmail.com',

  direccion: {
    calle: 'Virrey Cevallos 784',
    localidad: 'Ciudad Autónoma de Buenos Aires',
    codigoPostal: 'C1077',
    pais: 'Argentina',
    completa: 'Virrey Cevallos 784, C1077 CABA, Argentina',
    /* Consulta por direccion: no necesita clave de API. */
    embed:
      'https://www.google.com/maps?q=Virrey+Cevallos+784,+C1077+Ciudad+Autonoma+de+Buenos+Aires,+Argentina&hl=es&z=17&output=embed',
    comoLlegar:
      'https://www.google.com/maps/dir/?api=1&destination=Virrey+Cevallos+784%2C+C1077+Ciudad+Aut%C3%B3noma+de+Buenos+Aires%2C+Argentina',
    ficha:
      'https://www.google.com/maps/search/?api=1&query=REDVISION+Virrey+Cevallos+784+CABA',
  },

  horarios: [
    { dias: 'Lunes a viernes', horas: '09:00 a 18:00' },
    { dias: 'Sábados', horas: '09:00 a 13:00' },
  ],

  /* Destino del codigo QR del escudo del robot.
     OJO: este valor debe coincidir con lo que codifica la textura del GLB.
     La textura actual, decodificada del escudo fisico, apunta aca. Si se
     cambia esta URL sin regenerar la textura en Blender, el click y el
     escaneo llevan a lugares distintos, que es peor que no tener link. */
  qrEscudo: 'https://app.dahuasecurity.com/download.html',

  redes: {
    instagram: 'https://www.instagram.com/redvision.tech/',
    facebook: 'https://www.facebook.com/CCTVRedvision',
    tienda: 'https://redvision.mercadoshops.com.ar/',
  },
}

export default EMPRESA
