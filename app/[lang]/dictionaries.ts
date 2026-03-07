import 'server-only'

const dictionaries = {
  'en-US': () => import('./dictionaries/en.json').then((m) => m.default),
  'es-ES': () => import('./dictionaries/es.json').then((m) => m.default),
}

export type Locale = keyof typeof dictionaries

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries

export const getDictionary = async (locale: Locale) => dictionaries[locale]()