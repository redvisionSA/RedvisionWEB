import { createContext, useContext } from 'react'

/**
 * Estado global de la interfaz.
 *
 * theme      'light' | 'dark'
 * isDark     atajo booleano
 * toggleTheme
 * lens       modo vigilancia: lente circular que revela el video sin velo
 * toggleLens
 * canHover   false en dispositivos tactiles (desactiva efectos de cursor)
 */
export const SiteContext = createContext({
  theme: 'light',
  isDark: false,
  toggleTheme: () => {},
  lens: false,
  toggleLens: () => {},
  canHover: true,
})

export function useSite() {
  return useContext(SiteContext)
}

/** Alias retrocompatible: algunos componentes solo necesitan el tema. */
export function useTheme() {
  const { theme, isDark, toggleTheme } = useContext(SiteContext)
  return { theme, isDark, toggleTheme }
}
