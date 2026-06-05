import Parser from 'rss-parser'

export interface RawRssItem {
  title: string
  description: string
  link: string
  pubDate: string
  source: string
  language: 'english' | 'tamil'
}

interface FeedConfig {
  url: string
  name: string
  language: 'english' | 'tamil'
}

const FEEDS: FeedConfig[] = [
  {
    url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    name: 'The Hindu',
    language: 'english',
  },
  {
    url: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss',
    name: 'The Hindu (TN)',
    language: 'english',
  },
  {
    url: 'https://feeds.feedburner.com/ndtvnews-politics-news',
    name: 'NDTV Politics',
    language: 'english',
  },
  {
    url: 'https://timesofindia.indiatimes.com/rss/4719148.cms',
    name: 'Times of India',
    language: 'english',
  },
  {
    url: 'https://www.indiatoday.in/rss/1206513',
    name: 'India Today',
    language: 'english',
  },
  {
    url: 'https://www.dinamalar.com/rss/tamilnadu_news.xml',
    name: 'Dinamalar',
    language: 'tamil',
  },
]

const parser = new Parser({
  timeout: 5000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; MemeBot/1.0)',
    'Accept': 'application/rss+xml, application/xml, text/xml',
  },
})

async function fetchFeed(feed: FeedConfig): Promise<RawRssItem[]> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 5000)

  try {
    const result = await parser.parseURL(feed.url)
    clearTimeout(timer)

    return (result.items || []).slice(0, 10).map((item) => ({
      title: (item.title || '').trim(),
      description: ((item.contentSnippet || item.content || item.summary || '')).slice(0, 300).trim(),
      link: item.link || item.guid || '',
      pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
      source: feed.name,
      language: feed.language,
    }))
  } catch {
    clearTimeout(timer)
    return []
  }
}

export interface FetchResult {
  items: RawRssItem[]
  sources: string[]
  failedSources: string[]
}

export async function fetchPoliticalRssFeeds(): Promise<FetchResult> {
  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)))

  const items: RawRssItem[] = []
  const sources: string[] = []
  const failedSources: string[] = []

  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value.length > 0) {
      items.push(...result.value)
      sources.push(FEEDS[i].name)
    } else {
      failedSources.push(FEEDS[i].name)
    }
  })

  return { items, sources, failedSources }
}
