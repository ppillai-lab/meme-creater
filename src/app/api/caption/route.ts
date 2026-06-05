import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import { characters } from '@/data/characters'
import { currentEvents, getEventsByCharacters } from '@/data/events'
import type { TrendingTopicContext } from '@/types/meme'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { characterIds, topic, language = 'english', style = 'sarcastic', trendingContext } = await req.json() as {
      characterIds: string[]
      topic?: string
      language?: string
      style?: string
      trendingContext?: TrendingTopicContext
    }

    const selectedChars = characters.filter((c) => characterIds.includes(c.id))
    const relevantEvents = getEventsByCharacters(characterIds)

    const charContext = selectedChars
      .map((c) => `${c.displayName} (${c.party}): ${c.persona}`)
      .join('\n')

    const eventContext = relevantEvents
      .slice(0, 5)
      .map((e) => `- ${e.title}: ${e.summary}`)
      .join('\n')

    const allEvents = currentEvents
      .slice(0, 8)
      .map((e) => `- ${e.title} (${e.date}): ${e.summary}`)
      .join('\n')

    const systemPrompt = `You are a sharp Tamil political satirist specializing in creating meme captions that critique Indian and Tamil Nadu politics.
You create satirical, witty content that exposes political hypocrisy, corruption, and failures.
Your captions are clever, punchy, and rooted in real political events.
You write in the style of Tamil internet humor - a mix of English, Tamil words, and cultural references.
Keep captions SHORT (under 20 words each). Always write SATIRE - clearly fictional exaggeration.
Never incite violence. Focus on policy criticism and political hypocrisy.`

    const userPrompt = `Create satirical meme captions about these political figures for a meme.

CHARACTERS IN THIS MEME:
${charContext}

RECENT POLITICAL EVENTS/CONTROVERSIES TO REFERENCE:
${eventContext}

OTHER RELEVANT CONTEXT:
${allEvents.slice(0, 3)}

USER'S TOPIC/IDEA: ${topic || 'General political satire'}
${trendingContext ? `
LIVE TRENDING NEWS (make captions feel like breaking news responses):
Title: ${trendingContext.title}
Summary: ${trendingContext.summary}
${trendingContext.satiricalAngle ? `Suggested satirical angle: ${trendingContext.satiricalAngle}` : ''}
Tags: ${trendingContext.tags.join(', ')}
Published: ${trendingContext.publishedAt}
Incorporate this live context — make the meme feel topical and current.` : ''}

LANGUAGE STYLE: ${language} (${language === 'tanglish' ? 'Mix Tamil and English like Tamil internet users do' : language === 'tamil' ? 'Pure Tamil script' : 'English with Tamil political context'})

HUMOR STYLE: ${style}

Generate exactly 4 different caption options. Each option should have:
1. TOP_TEXT: (caption for top of meme, max 10 words)
2. BOTTOM_TEXT: (caption for bottom of meme, max 10 words)
3. THEME: (what political issue this targets)

Format your response as JSON array:
[
  {"top": "TOP TEXT HERE", "bottom": "BOTTOM TEXT HERE", "theme": "Issue name"},
  ...4 options total
]

Make them progressively more creative. Reference specific real scandals, quotes, and events.
IMPORTANT: This is SATIRE for educational/comedic purposes. Be creative but responsible.`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const textContent = response.content.find((b) => b.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from AI')
    }

    const jsonMatch = textContent.text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Could not parse AI response as JSON')
    }

    const captions = JSON.parse(jsonMatch[0])

    return NextResponse.json({ captions, success: true })
  } catch (error) {
    console.error('Caption generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate captions', success: false },
      { status: 500 }
    )
  }
}
