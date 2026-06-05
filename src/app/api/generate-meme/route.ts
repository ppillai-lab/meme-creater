import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { characters } from '@/data/characters'
import { memeTemplates } from '@/data/templates'
import type { TrendingTopicContext } from '@/types/meme'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { trendingContext, topic, language = 'english' } = await req.json() as {
      trendingContext?: TrendingTopicContext
      topic?: string
      language?: string
    }

    const templateList = memeTemplates
      .map((t) => `${t.id}: ${t.name} — ${t.description}`)
      .join('\n')

    const characterList = characters
      .map((c) => `${c.id}: ${c.displayName} (${c.party}) — ${c.persona.slice(0, 100)}`)
      .join('\n')

    const topicText = trendingContext
      ? `Title: ${trendingContext.title}\nSummary: ${trendingContext.summary}\n${trendingContext.satiricalAngle ? `Satirical angle: ${trendingContext.satiricalAngle}` : ''}\nTags: ${trendingContext.tags.join(', ')}`
      : topic || 'General Tamil political satire'

    const systemPrompt = `You are a Tamil political meme creator AI. Given a trending topic, you pick the BEST meme template, the BEST 1-2 characters, and write sharp satirical captions. You know Indian/Tamil internet humor deeply. Return only valid JSON.`

    const userPrompt = `Create a complete meme recipe for this topic:

${topicText}

AVAILABLE TEMPLATES:
${templateList}

AVAILABLE CHARACTERS:
${characterList}

LANGUAGE STYLE: ${language} (${language === 'tanglish' ? 'Mix Tamil + English like Tamil Twitter' : language === 'tamil' ? 'Pure Tamil' : 'English with Tamil political flavor'})

Choose the template and characters that best fit the topic's satirical angle.
- For "X vs Y" comparisons → drake, buff-doge-cheems, distracted-bf
- For shocked reactions → surprised-pikachu, monkey-puppet
- For government claims vs reality → grus-plan, this-is-fine, waiting-skeleton
- For "two sides agree" → epic-handshake
- For deals/trade → trade-offer
- Vadivelu for shocked public reaction, politicians for direct satire

Return ONLY this JSON (no markdown, no explanation):
{
  "template_id": "one of the template ids above",
  "character_ids": ["at most 2 character ids from above"],
  "top_caption": "top caption text, punchy, max 12 words",
  "bottom_caption": "bottom caption text, punchline, max 12 words",
  "explanation": "one sentence why this combo works"
}`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 512,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = response.content.find((b) => b.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON')
    }

    const recipe = JSON.parse(jsonMatch[0])

    // Validate template_id exists
    const template = memeTemplates.find((t) => t.id === recipe.template_id)
    if (!template) recipe.template_id = 'drake' // safe fallback

    // Validate character_ids exist
    recipe.character_ids = (recipe.character_ids as string[]).filter((id) =>
      characters.some((c) => c.id === id)
    )

    return NextResponse.json({ ...recipe, success: true })
  } catch (error) {
    console.error('Generate meme error:', error)
    return NextResponse.json(
      { error: 'Failed to generate meme recipe', success: false },
      { status: 500 }
    )
  }
}
