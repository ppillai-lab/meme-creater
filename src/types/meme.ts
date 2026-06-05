export interface Character {
  id: string
  name: string
  displayName: string
  emoji: string
  partyColor: string
  party: string
  persona: string
  catchphrases: string[]
  bgGradient: string
  textColor: string
  category: 'politician' | 'comedian' | 'celebrity'
}

export interface MemeTemplate {
  id: string
  name: string
  description: string
  bgColor: string
  bgGradient?: string
  textColor: string
  layout: 'classic' | 'two-panel' | 'breaking-news' | 'blank' | 'compare' | 'speech'
  previewEmoji: string
}

export interface TextElement {
  id: string
  type: 'top' | 'bottom' | 'caption' | 'speech'
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  strokeColor: string
  bold: boolean
  align: 'left' | 'center' | 'right'
  maxWidth: number
  rotation: number
}

export interface StickerElement {
  id: string
  characterId: string
  x: number
  y: number
  size: number
  flipX: boolean
  label?: string
}

export interface MemeState {
  templateId: string
  stickers: StickerElement[]
  texts: TextElement[]
  topCaption: string
  bottomCaption: string
  canvasWidth: number
  canvasHeight: number
}

export interface TrendingTopic {
  id: string
  title: string
  summary: string
  source: string
  sourceUrl: string
  publishedAt: string
  tags: string[]
  characters: string[]
  relevanceScore: number
  satiricalAngle?: string
  language: 'english' | 'tamil'
  isEnriched: boolean
}

export interface TrendingResponse {
  topics: TrendingTopic[]
  fetchedAt: string
  nextRefreshAt: string
  sources: string[]
  failedSources: string[]
}

export interface TrendingTopicContext {
  title: string
  summary: string
  satiricalAngle?: string
  tags: string[]
  publishedAt: string
}
