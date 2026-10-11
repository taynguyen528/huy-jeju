export type ChatRole = 'user' | 'assistant'

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
}

export type TripDraft = {
  destination: string
  startDate: string
  endDate: string
  travelers: string
  interests: string[]
  pace: string
  transport: string
  budget: string
}

export type SavedItinerary = {
  id: string
  title: string
  destination: string
  startDate: string | null
  endDate: string | null
  travelers: number
  interests: string[]
  pace: string | null
  transport: string | null
  budgetAmount: number | null
  budgetCurrency: string
  aiContent: string
  status: 'DRAFT' | 'COMPLETED' | 'ARCHIVED'
  createdAt: string
  updatedAt: string
}

export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'
export type ContentLocale = 'vi' | 'en' | 'ko'
export type ContentTranslation = { title: string; excerpt: string; body: string; translationStatus: 'draft' | 'reviewed' }

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

export type ContentInput = Pick<ContentItem, 'slug' | 'topic' | 'status' | 'author' | 'coverImageUrl'> & { translations: Partial<Record<ContentLocale, ContentTranslation>> }

export type Destination = {
  id: string; slug: string; name_vi: string; name_en: string; name_ko: string
  description_vi: string; description_en: string; description_ko: string
  category: string; region: string; address: string; latitude: number | null; longitude: number | null
  image_key: string; source_url: string; featured: number
}
