export type ChatRole = 'user' | 'assistant'

export type ItineraryDay = {
  day: number
  title: string
  places: ItineraryPlace[]
}

export type ItineraryPlace = {
  order: number
  name: string
  latitude: number | null
  longitude: number | null
  address: string | null
  source: 'database' | 'geoapify' | 'nominatim' | 'unresolved'
}

export type ChatMessage = {
  id: string
  role: ChatRole
  content: string
  days?: ItineraryDay[]
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
}

export type ContentInput = Pick<ContentItem, 'title' | 'slug' | 'excerpt' | 'body' | 'topic' | 'status' | 'author' | 'coverImageUrl'>

export type Destination = {
  id: string; slug: string; name: string; description: string
  category: string; region: string; address: string; latitude: number | null; longitude: number | null
  image_key: string; source_url: string; featured: number
}
