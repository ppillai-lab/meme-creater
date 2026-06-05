'use client'

import { useState, useEffect, useCallback } from 'react'
import type { TrendingTopic, TrendingResponse } from '@/types/meme'
import { characters } from '@/data/characters'

interface TrendingPanelProps {
  onSelectTopic: (topic: TrendingTopic) => void
}

const SOURCE_COLORS: Record<string, string> = {
  'The Hindu': '#E53E3E',
  'The Hindu (TN)': '#E53E3E',
  'NDTV Politics': '#F6802A',
  'Times of India': '#3182CE',
  'India Today': '#38A169',
  'Dinamalar': '#805AD5',
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function updatedAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  return `${Math.floor(mins / 60)}h ago`
}

function SkeletonCard() {
  return (
    <div className="p-3 rounded-lg border border-white/5 bg-white/3 animate-pulse">
      <div className="flex items-center gap-1.5 mb-2">
        <div className="w-2 h-2 rounded-full bg-white/10" />
        <div className="h-2.5 w-16 rounded bg-white/10" />
        <div className="ml-auto h-2 w-8 rounded bg-white/10" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-4/5 rounded bg-white/10" />
      </div>
      <div className="mt-2 h-2.5 w-3/4 rounded bg-white/5" />
    </div>
  )
}

export default function TrendingPanel({ onSelectTopic }: TrendingPanelProps) {
  const [data, setData] = useState<TrendingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const fetchTopics = useCallback(async (refresh = false) => {
    setLoading(true)
    setError(null)
    try {
      const url = refresh ? '/api/trending?refresh=1' : '/api/trending'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`${res.status}`)
      const json: TrendingResponse = await res.json()
      setData(json)
    } catch {
      setError('Could not load trending topics.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTopics()
  }, [fetchTopics])

  const handleClick = (topic: TrendingTopic) => {
    setSelectedId(topic.id)
    onSelectTopic(topic)
  }

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="text-orange-400 text-sm">📡</span>
          <span className="text-xs font-bold text-white uppercase tracking-wider">Trending</span>
          {data && !loading && (
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" title="Live" />
          )}
        </div>
        <button
          onClick={() => fetchTopics(true)}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-orange-400 transition-colors disabled:opacity-40 px-1"
          title="Refresh"
        >
          ↻
        </button>
      </div>

      {/* Updated timestamp */}
      {data && !loading && (
        <div className="px-3 py-1.5 border-b border-white/5 shrink-0">
          <p className="text-[10px] text-gray-600">
            Updated {updatedAgo(data.fetchedAt)}
            {data.failedSources.length > 0 && (
              <span className="text-yellow-700 ml-1">· {data.failedSources.length} source{data.failedSources.length > 1 ? 's' : ''} offline</span>
            )}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto panel-scrollbar p-2 space-y-2">
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </>
        )}

        {error && !loading && (
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 text-xs text-red-400 text-center">
            <p>{error}</p>
            <button
              onClick={() => fetchTopics()}
              className="mt-2 text-orange-400 hover:text-orange-300 underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && data?.topics.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">No trending topics found.</p>
        )}

        {!loading && data?.topics.map((topic) => {
          const isSelected = selectedId === topic.id
          const dotColor = SOURCE_COLORS[topic.source] || '#6B7280'
          const topicChars = topic.characters
            .map((id) => characters.find((c) => c.id === id))
            .filter(Boolean)

          return (
            <button
              key={topic.id}
              onClick={() => handleClick(topic)}
              className={`w-full text-left p-3 rounded-lg border transition-all group ${
                isSelected
                  ? 'border-orange-500/60 bg-orange-500/8'
                  : 'border-white/8 bg-white/3 hover:border-orange-500/40 hover:bg-orange-500/5'
              }`}
            >
              {/* Source + time */}
              <div className="flex items-center gap-1.5 mb-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: dotColor }}
                />
                <span className="text-[10px] text-gray-500 truncate flex-1">{topic.source}</span>
                <span className="text-[10px] text-gray-600 shrink-0">{timeAgo(topic.publishedAt)}</span>
              </div>

              {/* Headline */}
              <p className={`text-xs leading-snug line-clamp-2 mb-1.5 ${
                isSelected ? 'text-orange-100' : 'text-gray-200 group-hover:text-white'
              }`}>
                {topic.title}
              </p>

              {/* Satirical angle */}
              {topic.satiricalAngle && (
                <p className="text-[10px] italic text-gray-500 group-hover:text-gray-400 line-clamp-1 mb-1.5">
                  "{topic.satiricalAngle}"
                </p>
              )}

              {/* Character chips + score */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1 flex-wrap">
                  {topicChars.map((char) => char && (
                    <span
                      key={char.id}
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{ background: char.partyColor + '22', color: char.partyColor }}
                    >
                      {char.emoji} {char.displayName}
                    </span>
                  ))}
                </div>
                {isSelected && (
                  <span className="text-[10px] text-orange-400 shrink-0">✓ selected</span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-white/5 shrink-0">
        <p className="text-[10px] text-gray-700 text-center">
          Click a topic to inject into AI caption
        </p>
      </div>
    </div>
  )
}
