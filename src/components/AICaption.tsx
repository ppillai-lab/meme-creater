'use client'

import { useState } from 'react'
import { characters } from '@/data/characters'

interface AICaptionProps {
  characterIds: string[]
  onApplyCaption: (top: string, bottom: string) => void
}

interface CaptionOption {
  top: string
  bottom: string
  theme: string
}

const HUMOR_STYLES = ['sarcastic', 'absurd', 'savage', 'pun-based'] as const
const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'tanglish', label: 'Tanglish' },
  { value: 'tamil', label: 'தமிழ்' },
] as const

export default function AICaption({ characterIds, onApplyCaption }: AICaptionProps) {
  const [topic, setTopic] = useState('')
  const [language, setLanguage] = useState<'english' | 'tanglish' | 'tamil'>('english')
  const [style, setStyle] = useState<string>('sarcastic')
  const [loading, setLoading] = useState(false)
  const [captions, setCaptions] = useState<CaptionOption[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedCharIds, setSelectedCharIds] = useState<string[]>(characterIds)

  const allPoliticians = characters.filter((c) => c.category === 'politician')

  const toggleCharacter = (id: string) => {
    setSelectedCharIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const generate = async () => {
    if (selectedCharIds.length === 0) {
      setError('Select at least one character.')
      return
    }
    setLoading(true)
    setError(null)
    setCaptions([])
    try {
      const res = await fetch('/api/caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterIds: selectedCharIds,
          topic,
          language,
          style,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        setError(data.error || 'Failed to generate captions.')
      } else {
        setCaptions(data.captions)
      }
    } catch {
      setError('Network error. Check your API key and connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3">
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        AI generates satirical captions based on real political events.
      </p>

      {/* Character selection */}
      <div className="mb-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
          Target Characters
        </label>
        <div className="flex flex-wrap gap-1.5">
          {allPoliticians.map((char) => {
            const isOn = selectedCharIds.includes(char.id)
            return (
              <button
                key={char.id}
                onClick={() => toggleCharacter(char.id)}
                className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
                  isOn
                    ? 'text-white border'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                }`}
                style={isOn ? { background: char.partyColor + '33', borderColor: char.partyColor } : {}}
              >
                <span>{char.emoji}</span>
                <span>{char.displayName}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Topic */}
      <div className="mb-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
          Topic / Angle (optional)
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Electoral Bonds, NEET, Price rise..."
          className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 placeholder:text-gray-600"
        />
      </div>

      {/* Language */}
      <div className="mb-3">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
          Language
        </label>
        <div className="flex gap-1.5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value as typeof language)}
              className={`flex-1 py-1.5 rounded text-xs transition-all ${
                language === lang.value
                  ? 'bg-orange-500 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div className="mb-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1.5">
          Humor Style
        </label>
        <div className="grid grid-cols-2 gap-1">
          {HUMOR_STYLES.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`py-1.5 rounded text-xs capitalize transition-all ${
                style === s
                  ? 'bg-orange-500/20 border border-orange-500 text-orange-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate}
        disabled={loading}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
          loading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
        }`}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="ai-loading inline-block w-3 h-3 rounded-full border-2 border-white/30 border-t-white" />
            Generating satire...
          </span>
        ) : (
          '🤖 Generate Captions'
        )}
      </button>

      {error && (
        <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Caption results */}
      {captions.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Caption Options
          </h3>
          <div className="space-y-2">
            {captions.map((cap, i) => (
              <div
                key={i}
                className="rounded-lg border border-white/10 bg-white/5 p-3 cursor-pointer hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
                onClick={() => onApplyCaption(cap.top, cap.bottom)}
              >
                <div className="text-xs font-bold text-orange-400 mb-1.5">
                  Option {i + 1} — {cap.theme}
                </div>
                <div className="text-xs text-white font-bold uppercase mb-0.5">
                  TOP: {cap.top}
                </div>
                <div className="text-xs text-gray-300 uppercase">
                  BOT: {cap.bottom}
                </div>
                <div className="mt-2 text-xs text-gray-600 group-hover:text-orange-400 transition-colors">
                  Click to apply →
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!process.env.NEXT_PUBLIC_HAS_API_KEY && captions.length === 0 && !loading && (
        <p className="mt-3 text-xs text-gray-600 text-center">
          Requires ANTHROPIC_API_KEY in .env.local
        </p>
      )}
    </div>
  )
}
