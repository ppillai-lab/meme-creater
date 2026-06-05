import type { RawRssItem } from './rss-fetcher'

export interface ScoredRssItem extends RawRssItem {
  relevanceScore: number
  id: string
}

const POLITICAL_KEYWORDS: string[] = [
  // Characters / parties
  'modi', 'narendra', 'bjp', 'amit shah', 'amit',
  'stalin', 'dmk', 'udhayanidhi', 'kalaignar',
  'vijay', 'tvk', 'tamilaga vettri',
  'edappadi', 'eps', 'aiadmk', 'palaniswami',
  'kamal', 'mnm', 'makkal needhi',
  'rajini', 'rajinikanth',
  'congress', 'rahul', 'kharge',
  'pmk', 'anbumani', 'seeman', 'naam tamilar',
  // Institutions
  'parliament', 'lok sabha', 'rajya sabha', 'supreme court',
  'election commission', 'ed ', ' cbi', 'income tax',
  'governor', 'chief minister', ' cm ', 'minister',
  'high court', 'madras high court',
  // Tamil Nadu / India issues
  'tamil', 'tamil nadu', 'tamilnadu', 'chennai', 'coimbatore', 'madurai',
  'india', 'indian', 'delhi',
  'corruption', 'scam', 'scandal', 'controversy', 'fraud',
  'neet', 'reservation', 'cauvery', 'hindi imposition',
  'election', 'vote', 'poll', 'seat', 'constituency',
  'protest', 'strike', 'hartaal', 'bandh', 'agitation',
  'arrest', 'raid', 'chargesheet', 'bail',
  'inflation', 'price rise', 'petrol', 'diesel', 'lpg',
  'education', 'school', 'university', 'college',
  'farmers', 'agriculture', 'msp', 'floods', 'cyclone',
  'budget', 'tax', 'gst', 'economy',
  'sanatan', 'religion', 'temple', 'mosque',
  'film', 'actor', 'cinema', 'kollywood',
]

export function scoreRelevance(item: RawRssItem): number {
  const text = `${item.title} ${item.description}`.toLowerCase()
  let score = 0
  for (const keyword of POLITICAL_KEYWORDS) {
    if (text.includes(keyword)) score += 10
  }
  // Bonus for Tamil-language sources — highly relevant by default
  if (item.language === 'tamil') score += 20
  return Math.min(score, 100)
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60)
    .replace(/-$/, '')
}

export function scoreAndFilter(
  items: RawRssItem[],
  minScore: number = 20,
  maxItems: number = 20,
): ScoredRssItem[] {
  return items
    .map((item) => ({
      ...item,
      relevanceScore: scoreRelevance(item),
      id: slugify(item.title),
    }))
    .filter((item) => item.relevanceScore >= minScore && item.title.length > 5)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, maxItems)
}
