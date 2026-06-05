'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import MemeCanvas from '@/components/MemeCanvas'
import CharacterPanel from '@/components/CharacterPanel'
import TemplatePanel from '@/components/TemplatePanel'
import AICaption from '@/components/AICaption'
import TrendingPanel from '@/components/TrendingPanel'
import { memeTemplates } from '@/data/templates'
import { characters } from '@/data/characters'
import type { StickerElement, TrendingTopic, TrendingTopicContext } from '@/types/meme'

export default function Home() {
  const [selectedTemplate, setSelectedTemplate] = useState(memeTemplates[0])
  const [stickers, setStickers] = useState<StickerElement[]>([])
  const [topCaption, setTopCaption] = useState('WHEN THE GOVERNMENT SAYS')
  const [bottomCaption, setBottomCaption] = useState('"ACHHE DIN" INCOMING...')
  const [activeTab, setActiveTab] = useState<'characters' | 'templates' | 'ai'>('characters')
  const [topic, setTopic] = useState('')
  const [trendingContext, setTrendingContext] = useState<TrendingTopicContext | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const canvasRef = useRef<{ download: () => void; copyToClipboard: () => Promise<boolean> }>(null)
  const [copied, setCopied] = useState(false)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  // History stored in refs to avoid re-render cost on every push
  type HistoryEntry = { stickers: StickerElement[]; topCaption: string; bottomCaption: string }
  const historyRef = useRef<HistoryEntry[]>([{ stickers: [], topCaption: 'WHEN THE GOVERNMENT SAYS', bottomCaption: '"ACHHE DIN" INCOMING...' }])
  const historyIndexRef = useRef(0)
  // Current live values via refs so debounced callbacks stay fresh
  const stickersRef = useRef(stickers)
  const topCaptionRef = useRef(topCaption)
  const bottomCaptionRef = useRef(bottomCaption)
  useEffect(() => { stickersRef.current = stickers }, [stickers])
  useEffect(() => { topCaptionRef.current = topCaption }, [topCaption])
  useEffect(() => { bottomCaptionRef.current = bottomCaption }, [bottomCaption])

  const captionDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const syncHistoryState = () => {
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }

  const pushHistory = useCallback((entry: HistoryEntry) => {
    const sliced = historyRef.current.slice(0, historyIndexRef.current + 1)
    historyRef.current = [...sliced, entry].slice(-50)
    historyIndexRef.current = historyRef.current.length - 1
    syncHistoryState()
  }, [])

  const undo = useCallback(() => {
    if (captionDebounceRef.current) clearTimeout(captionDebounceRef.current)
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current--
    const e = historyRef.current[historyIndexRef.current]
    setStickers(e.stickers)
    setTopCaption(e.topCaption)
    setBottomCaption(e.bottomCaption)
    syncHistoryState()
  }, [])

  const redo = useCallback(() => {
    if (captionDebounceRef.current) clearTimeout(captionDebounceRef.current)
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current++
    const e = historyRef.current[historyIndexRef.current]
    setStickers(e.stickers)
    setTopCaption(e.topCaption)
    setBottomCaption(e.bottomCaption)
    syncHistoryState()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo])

  const handleCopy = async () => {
    const ok = await canvasRef.current?.copyToClipboard()
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleTopCaptionChange = (value: string) => {
    setTopCaption(value)
    if (captionDebounceRef.current) clearTimeout(captionDebounceRef.current)
    captionDebounceRef.current = setTimeout(() => {
      pushHistory({ stickers: stickersRef.current, topCaption: value, bottomCaption: bottomCaptionRef.current })
    }, 600)
  }

  const handleBottomCaptionChange = (value: string) => {
    setBottomCaption(value)
    if (captionDebounceRef.current) clearTimeout(captionDebounceRef.current)
    captionDebounceRef.current = setTimeout(() => {
      pushHistory({ stickers: stickersRef.current, topCaption: topCaptionRef.current, bottomCaption: value })
    }, 600)
  }

  const addSticker = (characterId: string) => {
    const isSpeechTemplate = selectedTemplate.layout === 'speech'
    const newSticker: StickerElement = {
      id: `sticker-${Date.now()}`,
      characterId,
      x: 150 + Math.random() * 300,
      y: isSpeechTemplate ? 330 + Math.random() * 100 : 80 + Math.random() * 200,
      size: 100,
      flipX: false,
    }
    const next = [...stickersRef.current, newSticker]
    setStickers(next)
    pushHistory({ stickers: next, topCaption: topCaptionRef.current, bottomCaption: bottomCaptionRef.current })
  }

  const removeSticker = (id: string) => {
    const next = stickersRef.current.filter((s) => s.id !== id)
    setStickers(next)
    pushHistory({ stickers: next, topCaption: topCaptionRef.current, bottomCaption: bottomCaptionRef.current })
  }

  const applyCaption = (top: string, bottom: string) => {
    setTopCaption(top)
    setBottomCaption(bottom)
    pushHistory({ stickers: stickersRef.current, topCaption: top, bottomCaption: bottom })
  }

  const handleStickerActionComplete = (finalStickers: StickerElement[]) => {
    pushHistory({ stickers: finalStickers, topCaption: topCaptionRef.current, bottomCaption: bottomCaptionRef.current })
  }

  const handleSelectTrend = (trend: TrendingTopic) => {
    setTopic(trend.title)
    setTrendingContext({
      title: trend.title,
      summary: trend.summary,
      satiricalAngle: trend.satiricalAngle,
      tags: trend.tags,
      publishedAt: trend.publishedAt,
    })
    setActiveTab('ai')
    if (stickers.length === 0 && trend.characters.length > 0) {
      addSticker(trend.characters[0])
    }
  }

  const selectedCharacterIds = Array.from(new Set(stickers.map((s) => s.characterId)))
  const isSpeech = selectedTemplate.layout === 'speech'

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between bg-black/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold shrink-0">M</div>
          <div>
            <h1 className="text-lg font-bold text-white">Meme Creater</h1>
            <p className="hidden sm:block text-xs text-gray-400">Tamil Political Satire Studio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">SATIRE</span>
            <span className="px-2 py-1 bg-white/5 rounded border border-white/10">POLITICAL COMMENTARY</span>
          </div>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-gray-300 hover:text-white transition-colors"
          >
            {sidebarOpen ? '✕ Close' : '☰ Panels'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar — drawer on mobile, static on desktop */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-72 shrink-0 flex flex-col bg-[#0d0d0d] border-r border-white/10
          transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:z-auto md:bg-black/20
        `}>
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
                topic={topic}
                onTopicChange={setTopic}
                trendingContext={trendingContext}
              />
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6 bg-[#0a0a0a] min-w-0 overflow-y-auto">
          <div className="mb-3 sm:mb-4 w-full max-w-2xl">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">
                  {isSpeech ? 'SPEECH TEXT' : 'TOP CAPTION'}
                </label>
                <input
                  type="text"
                  value={topCaption}
                  onChange={(e) => handleTopCaptionChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-bold uppercase"
                  placeholder={isSpeech ? 'What are they saying?' : 'TOP TEXT'}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">
                  {isSpeech ? 'SUBTEXT / REACTION' : 'BOTTOM CAPTION'}
                </label>
                <input
                  type="text"
                  value={bottomCaption}
                  onChange={(e) => handleBottomCaptionChange(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500 font-bold uppercase"
                  placeholder={isSpeech ? 'Reaction or context...' : 'BOTTOM TEXT'}
                />
              </div>
            </div>
          </div>

          <MemeCanvas
            ref={canvasRef}
            template={selectedTemplate}
            stickers={stickers}
            onUpdateStickers={setStickers}
            onStickerActionComplete={handleStickerActionComplete}
            topCaption={topCaption}
            bottomCaption={bottomCaption}
          />

          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
            <button
              onClick={() => canvasRef.current?.download()}
              className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all text-sm"
            >
              ⬇ <span className="hidden sm:inline">Download </span>Meme
            </button>
            <button
              onClick={handleCopy}
              className={`px-3 sm:px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
            <button
              onClick={undo}
              disabled={!canUndo}
              title="Undo (⌘Z)"
              className="px-3 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↩ Undo
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              title="Redo (⌘Y)"
              className="px-3 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              ↪ Redo
            </button>
            <button
              onClick={() => {
                const entry = { stickers: [], topCaption: '', bottomCaption: '' }
                setStickers([])
                setTopCaption('')
                setBottomCaption('')
                pushHistory(entry)
              }}
              className="px-3 sm:px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-colors"
            >
              🗑 Clear
            </button>
            <span className="text-xs text-gray-600 w-full sm:w-auto text-center sm:text-left">
              {stickers.length} character{stickers.length !== 1 ? 's' : ''} on canvas
            </span>
          </div>
        </div>
        {/* Right Sidebar — Trending Panel */}
        <div className="hidden xl:flex w-60 border-l border-white/10 flex-col bg-black/20 shrink-0">
          <TrendingPanel onSelectTopic={handleSelectTrend} />
        </div>
      </div>

      <footer className="border-t border-white/5 px-6 py-2 text-center text-xs text-gray-600">
        ⚠️ This is a political satire tool. All content is fictional exaggeration for comedic commentary. Not meant to incite hatred or violence.
      </footer>
    </div>
  )
}
