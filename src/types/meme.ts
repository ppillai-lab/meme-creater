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
