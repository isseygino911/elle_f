import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { translations } from './translations.js'

const LANGUAGE_STORAGE_KEY = 'language'
const DEFAULT_LANGUAGE = 'en'

// Same private-browsing-safe try/catch read/write pattern as
// readStoredCollapsed/persistCollapsed in AppShell.jsx.
function readStoredLanguage() {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return stored === 'zh' ? 'zh' : DEFAULT_LANGUAGE
  } catch {
    // Private browsing / storage disabled — default to English.
    return DEFAULT_LANGUAGE
  }
}

function persistLanguage(language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Ignore storage errors; the toggle still works for this session.
  }
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(readStoredLanguage)

  const setLanguage = useCallback((next) => {
    setLanguageState(next)
    persistLanguage(next)
  }, [])

  // Resolves a dot-path key (e.g. "nav.dashboard") against the active
  // language's dictionary, falling back to the key itself if missing so a
  // typo shows up as an obviously-wrong string instead of a crash.
  const t = useCallback(
    (key) => {
      const dict = translations[language] || translations[DEFAULT_LANGUAGE]
      const value = key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), dict)
      return typeof value === 'string' ? value : key
    },
    [language]
  )

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return ctx
}
