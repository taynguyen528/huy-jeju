export type ContentStatus = 'draft' | 'review' | 'published' | 'archived'

export type ContentItem = {
  id: string; title: string; slug: string; excerpt: string; body: string
  topic: string; status: ContentStatus; author: string; coverImageUrl: string; updatedAt: string
}

export type ContentInput = {
  title: string; slug: string; excerpt: string; body: string; topic: string
  status: ContentStatus; author: string; coverImageUrl?: string
}
