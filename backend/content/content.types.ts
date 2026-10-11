export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'
export type ContentLocale = 'vi' | 'en' | 'ko'
export type TranslationStatus = 'draft' | 'reviewed'
export type ContentTranslation = { title: string; excerpt: string; body: string; translationStatus: TranslationStatus }

export type ContentItem = {
  id: string
  title: string
  slug: string
  excerpt: string
  body: string
  topic: string
  status: ContentStatus
  author: string
  coverImageUrl: string
  updatedAt: string
  locale: ContentLocale
  requestedLocale: ContentLocale
  translationFallback: boolean
  translations?: Partial<Record<ContentLocale, ContentTranslation>>
}

export type ContentInput = {
  slug: string; topic: string; status: ContentStatus; author: string; coverImageUrl?: string
  translations: Partial<Record<ContentLocale, ContentTranslation>>
}
