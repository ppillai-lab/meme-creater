import { NextRequest, NextResponse } from 'next/server'
import { fetchPoliticalRssFeeds } from '@/lib/rss-fetcher'
import { scoreAndFilter } from '@/lib/trending-scorer'
import { enrichWithClaude } from '@/lib/trending-enricher'
import type { TrendingResponse } from '@/types/meme'

const CACHE_TTL_MS = Number(process.env.TRENDING_CACHE_TTL_SECONDS || 1800) * 1000
const MIN_SCORE = Number(process.env.TRENDING_MIN_RELEVANCE_SCORE || 20)
const MAX_CLAUDE_ITEMS = Number(process.env.TRENDING_MAX_CLAUDE_ITEMS || 20)

interface CacheEntry {
  data: TrendingResponse
  expiresAt: number
}

// Module-level cache — persists across requests within the same Node process
const cache = new Map<string, CacheEntry>()
const CACHE_KEY = 'trending-v1'

async function buildTrendingResponse(): Promise<TrendingResponse> {
  const now = new Date()

  const { items, sources, failedSources } = await fetchPoliticalRssFeeds()
  const scored = scoreAndFilter(items, MIN_SCORE, MAX_CLAUDE_ITEMS)
  const topics = await enrichWithClaude(scored)

  // Sort by relevanceScore desc, then by publishedAt desc
  topics.sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) return b.relevanceScore - a.relevanceScore
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  })

  return {
    topics,
    fetchedAt: now.toISOString(),
    nextRefreshAt: new Date(now.getTime() + CACHE_TTL_MS).toISOString(),
    sources,
    failedSources,
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<TrendingResponse | { error: string }>> {
  const forceRefresh =
    process.env.NODE_ENV === 'development' &&
    req.nextUrl.searchParams.get('refresh') === '1'

  const cached = cache.get(CACHE_KEY)
  if (cached && !forceRefresh && Date.now() < cached.expiresAt) {
    return NextResponse.json(cached.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'X-Cache': 'HIT',
      },
    })
  }

  try {
    const data = await buildTrendingResponse()
    cache.set(CACHE_KEY, { data, expiresAt: Date.now() + CACHE_TTL_MS })

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
        'X-Cache': 'MISS',
      },
    })
  } catch (error) {
    console.error('Trending fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch trending topics' } as never,
      { status: 500 },
    )
  }
}
