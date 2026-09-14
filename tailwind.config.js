/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // Paleta ESTRICTA de marca REDVISION: blanco puro, negro solido, rojo #D61922.
    // El efecto Liquid Glass se construye con OPACIDAD sobre estos tres colores,
    // nunca con grises ni azules nuevos.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#FFFFFF',
      black: '#000000',
      rv: {
        red: '#D61922',
        'red-press': '#B31219',
        'red-glow': '#FF2A35',
      },
    },
    extend: {
      screens: {
        /* Telefonos angostos: por debajo de 400 px hay que acortar textos */
        xs: '400px',
      },
      fontFamily: {
        display: ['Lexend', 'system-ui', 'sans-serif'],
        sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        glass: '28px',
        'glass-lg': '38px',
        pill: '999px',
      },
      backdropBlur: {
        glass: '28px',
        'glass-xl': '44px',
      },
      transitionTimingFunction: {
        apple: 'cubic-bezier(0.22, 1, 0.36, 1)',
        'apple-in': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        400: '400ms',
      },
      keyframes: {
        'rv-scan': {
          '0%': { transform: 'translateY(-120%)', opacity: '0' },
          '45%': { opacity: '1' },
          '100%': { transform: 'translateY(120%)', opacity: '0' },
        },
        'rv-pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(214,25,34,0.45)' },
          '70%': { boxShadow: '0 0 0 16px rgba(214,25,34,0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(214,25,34,0)' },
        },
        'rv-rise': {
          '0%': { opacity: '0', transform: 'translateY(22px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'rv-breathe': {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        'rv-marquee': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        /* Cinta vertical para las resenas: la lista se duplica y se desplaza
           media altura, asi el bucle no tiene costura. */
        'rv-marquee-y': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-50%)' },
        },
      },
      animation: {
        'rv-scan': 'rv-scan 4.5s linear infinite',
        'rv-pulse-ring': 'rv-pulse-ring 2.6s ease-out infinite',
        'rv-rise': 'rv-rise 0.6s cubic-bezier(0.22,1,0.36,1) both',
        'rv-breathe': 'rv-breathe 2.4s ease-in-out infinite',
        'rv-marquee': 'rv-marquee 34s linear infinite',
        'rv-marquee-y': 'rv-marquee-y 46s linear infinite',
      },
    },
  },
  plugins: [],
}
