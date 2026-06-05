import Anthropic from '@anthropic-ai/sdk'
import type { ScoredRssItem } from './trending-scorer'
import type { TrendingTopic } from '@/types/meme'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const VALID_CHARACTER_IDS = [
  'modi', 'stalin', 'udhayanidhi', 'vijay', 'edappadi',
  'kamal', 'rajini', 'vadivelu', 'goundamani', 'senthil',
]

const CHARACTER_NAMES = `
- modi: Narendra Modi, BJP, Prime Minister
- stalin: MK Stalin, DMK, Tamil Nadu CM
- udhayanidhi: Udhayanidhi Stalin, DMK, Deputy CM
- vijay: Vijay/Thalapathy, TVK, actor-politician
- edappadi: Edappadi Palaniswami, AIADMK
- kamal: Kamal Haasan, MNM, actor-politician
- rajini: Rajinikanth, Superstar, actor
- vadivelu: Vadivelu, Tamil comedian, Nesamani meme god
- goundamani: Goundamani, Tamil comedian
- senthil: Senthil, Tamil comedian, Goundamani's partner
`.trim()

interface EnrichmentResult {
  characters: string[]
  tags: string[]
  relevanceScore: number
  satiricalAngle: string
}

function buildPrompt(items: ScoredRssItem[]): string {
  const numbered = items
    .map((item, i) => `${i + 1}. TITLE: ${item.title}\n   SUMMARY: ${item.description || 'N/A'}`)
    .join('\n\n')

  return `You are a Tamil political satire analyst. Analyze these Indian/Tamil news headlines and for each one return enrichment data for a meme-making app.

KNOWN CHARACTERS (use ONLY these IDs):
${CHARACTER_NAMES}

NEWS ITEMS:
${numbered}

For each item return a JSON array with exactly ${items.length} objects in the same order:
[
  {
    "characters": ["character_id_1"],
    "tags": ["tag1", "tag2", "tag3"],
    "relevanceScore": 85,
    "satiricalAngle": "One punchy satirical framing sentence in English (max 15 words)"
  }
]

Rules:
- characters: only IDs from the list above that are directly relevant; empty array [] if none
- tags: 3-5 short English keywords
- relevanceScore: 0-100 (how meme-worthy is this for Tamil political satire)
- satiricalAngle: sharp, sarcastic one-liner — think Tamil internet humor
- Return ONLY the JSON array, no other text`
}

export async function enrichWithClaude(items: ScoredRssItem[]): Promise<TrendingTopic[]> {
  if (items.length === 0) return []

  let enrichmentResults: EnrichmentResult[] = []

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: buildPrompt(items) }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (textBlock && textBlock.type === 'text') {
      const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed)) enrichmentResults = parsed
      }
    }
  } catch {
    // Claude call failed — fall through to unenriched fallback
  }

  return items.map((item, i): TrendingTopic => {
    const enriched = enrichmentResults[i]

    const validChars = enriched?.characters
      ? enriched.characters.filter((id: string) => VALID_CHARACTER_IDS.includes(id))
      : []

    return {
      id: item.id,
      title: item.title,
      summary: item.description,
      source: item.source,
      sourceUrl: item.link,
      publishedAt: new Date(item.pubDate).toISOString(),
      tags: enriched?.tags || [],
      characters: validChars,
      relevanceScore: enriched?.relevanceScore ?? item.relevanceScore,
      satiricalAngle: enriched?.satiricalAngle,
      language: item.language,
      isEnriched: !!enriched,
    }
  })
}
