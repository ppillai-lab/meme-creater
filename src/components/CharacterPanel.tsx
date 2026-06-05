'use client'

import type { Character, StickerElement } from '@/types/meme'

interface CharacterPanelProps {
  characters: Character[]
  onAddSticker: (characterId: string) => void
  activeStickers: StickerElement[]
  onRemoveSticker: (id: string) => void
}

const categoryLabels: Record<string, string> = {
  politician: '🏛️ Politicians',
  comedian: '😂 Comedians',
  celebrity: '⭐ Celebrities',
}

export default function CharacterPanel({
  characters,
  onAddSticker,
  activeStickers,
  onRemoveSticker,
}: CharacterPanelProps) {
  const categories = ['politician', 'comedian', 'celebrity'] as const
  const activeCharIds = new Set(activeStickers.map((s) => s.characterId))

  return (
    <div className="p-3">
      <p className="text-xs text-gray-500 mb-3 leading-relaxed">
        Click characters to add them to the meme canvas. You can add multiples.
      </p>

      {categories.map((cat) => {
        const chars = characters.filter((c) => c.category === cat)
        if (!chars.length) return null
        return (
          <div key={cat} className="mb-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              {categoryLabels[cat]}
            </h3>
            <div className="space-y-1.5">
              {chars.map((char) => {
                const isActive = activeCharIds.has(char.id)
                const activeCount = activeStickers.filter((s) => s.characterId === char.id).length
                return (
                  <div key={char.id} className="group">
                    <button
                      onClick={() => onAddSticker(char.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center gap-3 ${
                        isActive
                          ? 'bg-white/10 border border-white/20'
                          : 'bg-white/5 border border-transparent hover:bg-white/8 hover:border-white/10'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                        style={{ background: char.partyColor + '33', border: `1px solid ${char.partyColor}55` }}
                      >
                        {char.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white truncate">{char.displayName}</span>
                          {activeCount > 0 && (
                            <span
                              className="text-xs px-1.5 py-0.5 rounded-full text-white font-bold flex-shrink-0"
                              style={{ background: char.partyColor }}
                            >
                              {activeCount}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className="text-xs px-1.5 py-0.5 rounded text-white font-medium"
                            style={{ background: char.partyColor + '88' }}
                          >
                            {char.party}
                          </span>
                          <span className="text-xs text-gray-500 truncate">{char.name}</span>
                        </div>
                      </div>
                      <span className="text-gray-600 group-hover:text-white text-lg">+</span>
                    </button>

                    {/* Catchphrases tooltip */}
                    <div className="hidden group-hover:block px-3 py-2 bg-black/60 border border-white/5 rounded-b-lg -mt-1 text-xs text-gray-400 italic">
                      &ldquo;{char.catchphrases[0]}&rdquo;
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Active stickers list */}
      {activeStickers.length > 0 && (
        <div className="mt-4 pt-3 border-t border-white/10">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            On Canvas ({activeStickers.length})
          </h3>
          <div className="space-y-1">
            {activeStickers.map((s) => {
              const char = characters.find((c) => c.id === s.characterId)
              if (!char) return null
              return (
                <div
                  key={s.id}
                  className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded text-xs"
                >
                  <span>{char.emoji}</span>
                  <span className="flex-1 text-gray-300">{char.displayName}</span>
                  <button
                    onClick={() => onRemoveSticker(s.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
