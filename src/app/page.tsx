'use client'

import { useState, useRef } from 'react'
import MemeCanvas from '@/components/MemeCanvas'
import CharacterPanel from '@/components/CharacterPanel'
import TemplatePanel from '@/components/TemplatePanel'
import AICaption from '@/components/AICaption'
import { memeTemplates } from '@/data/templates'
import { characters } from '@/data/characters'
import type { StickerElement } from '@/types/meme'

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState(memeTemplates[0])
  const [stickers, setStickers] = useState<StickerElement[]>([])
  const [topCaption, setTopCaption] = useState('WHEN THE GOVERNMENT SAYS')
  const [bottomCaption, setBottomCaption] = useState('"ACHHE DIN" INCOMING...')
  const [activeTab, setActiveTab] = useState<'characters' | 'templates' | 'ai'>('characters')
  const canvasRef = useRef<{ download: () => void }>(null)

  const addSticker = (characterId: string) => {
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      characterId,
      x: 100 + Math.random() * 300,
      y: 80 + Math.random() * 200,
      size: 100,
      flipX: false,
    }
    setStickers((prev) => [...prev, newSticker])
  }

  const removeSticker = (id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id))
  }

  const applyCaption = (top: string, bottom: string) => {
    setTopCaption(top)
    setBottomCaption(bottom)
  }

  const selectedCharacterIds = [...new Set(stickers.map((s) => s.characterId))]

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-3 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold">M</div>
          <div>
            <h1 className="text-lg font-bold text-white">Meme Creater</h1>
            <p className="text-xs text-gray-400">Tamil Political Satire Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="px-2 py-1 bg-white/5 rounded border border-white/10">SATIRE</span>
          <span className="px-2 py-1 bg-white/5 rounded border border-white/10">POLITICAL COMMENTARY</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-72 border-r border-white/10 flex flex-col bg-black/20">
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {(['characters', 'templates', 'ai'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-orange-400 border-b-2 border-orange-400 bg-orange-400/5'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'ai' ? '🤖 AI' : tab === 'characters' ? '👥 Cast' : '🖼️ Templates'}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto panel-scrollbar">
            {activeTab === 'characters' && (
              <CharacterPanel
                characters={characters}
                onAddSticker={addSticker}
                activeStickers={stickers}
                onRemoveSticker={removeSticker}
              />
            )}
            {activeTab === 'templates' && (
              <TemplatePanel
                templates={memeTemplates}
                selectedTemplate={selectedTemplate}
                onSelectTemplate={setSelectedTemplate}
              />
            )}
            {activeTab === 'ai' && (
              <AICaption
                characterIds={selectedCharacterIds}
                onApplyCaption={applyCaption}
              />
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0a0a0a]">
          <div className="mb-4 w-full max-w-2xl">
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">TOP CAPTION</label>
                <input
                  type="text"
                  value={topCaption}
                  onChange={(e) => setTopCaption(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-bold uppercase"
                  placeholder="TOP TEXT"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">BOTTOM CAPTION</label>
                <input
                  type="text"
                  value={bottomCaption}
                  onChange={(e) => setBottomCaption(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-bold uppercase"
                  placeholder="BOTTOM TEXT"
                />
              </div>
            </div>
          </div>

          <MemeCanvas
            ref={canvasRef}
            template={selectedTemplate}
            stickers={stickers}
            onUpdateStickers={setStickers}
            topCaption={topCaption}
            bottomCaption={bottomCaption}
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => canvasRef.current?.download()}
              className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all text-sm"
            >
              ⬇ Download Meme
            </button>
            <button
              onClick={() => {
                setStickers([])
                setTopCaption('')
                setBottomCaption('')
              }}
              className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              🗑 Clear
            </button>
            <span className="text-xs text-gray-600">
              {stickers.length} character{stickers.length !== 1 ? 's' : ''} on canvas
            </span>
          </div>
        </div>
      </div>

      <footer className="border-t border-white/5 px-6 py-2 text-center text-xs text-gray-600">
        ⚠️ This is a political satire tool. All content is fictional exaggeration for comedic commentary. Not meant to incite hatred or violence.
      </footer>
    </div>
  )
}
