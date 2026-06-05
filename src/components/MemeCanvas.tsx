'use client'

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
  useState,
  useCallback,
} from 'react'
import type { StickerElement, MemeTemplate } from '@/types/meme'
import { getCharacterById } from '@/data/characters'

interface MemeCanvasProps {
  template: MemeTemplate
  stickers: StickerElement[]
  onUpdateStickers: (stickers: StickerElement[]) => void
  topCaption: string
  bottomCaption: string
}

const CANVAS_W = 700
const CANVAS_H = 500

function drawImpactText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  color: string = '#ffffff'
) {
  if (!text) return
  ctx.font = 'bold 36px Impact, Arial Black, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = color
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 5
  ctx.strokeText(text.toUpperCase(), x, y, maxWidth)
  ctx.fillText(text.toUpperCase(), x, y, maxWidth)
}

function drawCharacterSticker(
  ctx: CanvasRenderingContext2D,
  sticker: StickerElement,
  isSelected: boolean
) {
  const char = getCharacterById(sticker.characterId)
  if (!char) return

  const { x, y, size } = sticker
  const halfSize = size / 2

  ctx.save()

  if (sticker.flipX) {
    ctx.translate(x, y)
    ctx.scale(-1, 1)
    ctx.translate(-x, -y)
  }

  // Draw background circle
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, halfSize)
  const [c1, c2] = char.bgGradient.includes('#')
    ? [char.partyColor, char.partyColor + 'aa']
    : [char.partyColor, char.partyColor + 'aa']
  gradient.addColorStop(0, c1)
  gradient.addColorStop(1, c2)

  ctx.beginPath()
  ctx.arc(x, y, halfSize, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.strokeStyle = 'rgba(255,255,255,0.3)'
  ctx.lineWidth = 2
  ctx.stroke()

  // Draw emoji
  ctx.font = `${size * 0.5}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(char.emoji, x, y - size * 0.05)

  // Draw name label
  ctx.font = `bold ${size * 0.13}px Arial, sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.textAlign = 'center'
  ctx.strokeText(char.displayName.toUpperCase(), x, y + halfSize + size * 0.15)
  ctx.fillText(char.displayName.toUpperCase(), x, y + halfSize + size * 0.15)

  // Party badge
  ctx.font = `${size * 0.1}px Arial, sans-serif`
  ctx.fillStyle = char.partyColor
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1.5
  ctx.strokeText(char.party, x, y + halfSize + size * 0.28)
  ctx.fillText(char.party, x, y + halfSize + size * 0.28)

  ctx.restore()

  // Selection indicator
  if (isSelected) {
    ctx.save()
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, halfSize + 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    // Resize handle
    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(x + halfSize, y - halfSize, 6, 0, Math.PI * 2)
    ctx.fill()
    // Delete handle
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(x - halfSize, y - halfSize, 6, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = '8px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('×', x - halfSize, y - halfSize)
  }
}

function drawTemplate(
  ctx: CanvasRenderingContext2D,
  template: MemeTemplate,
  w: number,
  h: number
) {
  if (template.bgGradient) {
    const parts = template.bgGradient.match(/#[a-fA-F0-9]{6}/g) || []
    if (parts.length >= 2) {
      const grad = ctx.createLinearGradient(0, 0, w, h)
      grad.addColorStop(0, parts[0])
      grad.addColorStop(1, parts[1])
      ctx.fillStyle = grad
    } else {
      ctx.fillStyle = template.bgColor
    }
  } else {
    ctx.fillStyle = template.bgColor
  }
  ctx.fillRect(0, 0, w, h)

  if (template.layout === 'breaking-news') {
    // Red breaking news bar at bottom
    ctx.fillStyle = '#CC0000'
    ctx.fillRect(0, h - 70, w, 70)
    ctx.fillStyle = '#FFD700'
    ctx.fillRect(0, h - 75, w, 5)
    ctx.font = 'bold 14px Arial'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'center'
    ctx.fillText('BREAKING NEWS | LIVE UPDATE', w / 2, h - 48)

    // Channel logo area
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.fillRect(10, 10, 120, 40)
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = '#FFD700'
    ctx.textAlign = 'center'
    ctx.fillText('SATIRE NEWS 24/7', 70, 35)
  }

  if (template.layout === 'two-panel') {
    // Divider line
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()

    // Labels
    ctx.font = 'bold 14px Arial'
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText('PROMISE', w / 4, 25)
    ctx.fillText('REALITY', (3 * w) / 4, 25)
  }

  if (template.layout === 'compare') {
    // Top half (reject) in red tint
    ctx.fillStyle = 'rgba(200,0,0,0.15)'
    ctx.fillRect(0, 0, w, h / 2)
    // Bottom half (approve) in green tint
    ctx.fillStyle = 'rgba(0,200,0,0.1)'
    ctx.fillRect(0, h / 2, w, h / 2)

    // Labels
    ctx.font = 'bold 16px Arial'
    ctx.fillStyle = 'rgba(255,100,100,0.8)'
    ctx.textAlign = 'left'
    ctx.fillText('👎 REJECT', 20, 30)
    ctx.fillStyle = 'rgba(100,255,100,0.8)'
    ctx.fillText('👍 APPROVE', 20, h / 2 + 30)
  }
}

export default forwardRef<{ download: () => void }, MemeCanvasProps>(
  function MemeCanvas({ template, stickers, onUpdateStickers, topCaption, bottomCaption }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
    const [resizing, setResizing] = useState<{ id: string; startSize: number; startDist: number } | null>(null)

    const render = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)
      drawTemplate(ctx, template, CANVAS_W, CANVAS_H)

      // Draw stickers (bottom-most first)
      stickers.forEach((sticker) => {
        drawCharacterSticker(ctx, sticker, sticker.id === selectedId)
      })

      // Draw captions
      if (topCaption) {
        drawImpactText(ctx, topCaption, CANVAS_W / 2, 45, CANVAS_W - 40, template.textColor)
      }
      if (bottomCaption) {
        if (template.layout === 'breaking-news') {
          drawImpactText(ctx, bottomCaption, CANVAS_W / 2, CANVAS_H - 82, CANVAS_W - 40, '#FFD700')
        } else {
          drawImpactText(ctx, bottomCaption, CANVAS_W / 2, CANVAS_H - 20, CANVAS_W - 40, template.textColor)
        }
      }
    }, [template, stickers, selectedId, topCaption, bottomCaption])

    useEffect(() => {
      render()
    }, [render])

    const getCanvasPos = (e: React.MouseEvent) => {
      const canvas = canvasRef.current!
      const rect = canvas.getBoundingClientRect()
      const scaleX = CANVAS_W / rect.width
      const scaleY = CANVAS_H / rect.height
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      }
    }

    const hitTestSticker = (x: number, y: number): string | null => {
      // Test in reverse order (top sticker first)
      for (let i = stickers.length - 1; i >= 0; i--) {
        const s = stickers[i]
        const dist = Math.hypot(x - s.x, y - s.y)
        if (dist <= s.size / 2 + 10) return s.id
      }
      return null
    }

    const hitTestResizeHandle = (x: number, y: number, sticker: StickerElement): boolean => {
      const hx = sticker.x + sticker.size / 2
      const hy = sticker.y - sticker.size / 2
      return Math.hypot(x - hx, y - hy) <= 8
    }

    const hitTestDeleteHandle = (x: number, y: number, sticker: StickerElement): boolean => {
      const dx = sticker.x - sticker.size / 2
      const dy = sticker.y - sticker.size / 2
      return Math.hypot(x - dx, y - dy) <= 8
    }

    const handleMouseDown = (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)

      // Check delete handles
      if (selectedId) {
        const sel = stickers.find((s) => s.id === selectedId)
        if (sel && hitTestDeleteHandle(pos.x, pos.y, sel)) {
          onUpdateStickers(stickers.filter((s) => s.id !== selectedId))
          setSelectedId(null)
          return
        }
        if (sel && hitTestResizeHandle(pos.x, pos.y, sel)) {
          const dist = Math.hypot(pos.x - sel.x, pos.y - sel.y)
          setResizing({ id: sel.id, startSize: sel.size, startDist: dist })
          return
        }
      }

      const hitId = hitTestSticker(pos.x, pos.y)
      setSelectedId(hitId)

      if (hitId) {
        const sticker = stickers.find((s) => s.id === hitId)!
        setDragging({ id: hitId, offsetX: pos.x - sticker.x, offsetY: pos.y - sticker.y })
      }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)

      if (resizing) {
        const sticker = stickers.find((s) => s.id === resizing.id)
        if (sticker) {
          const dist = Math.hypot(pos.x - sticker.x, pos.y - sticker.y)
          const newSize = Math.max(40, Math.min(200, resizing.startSize * (dist / resizing.startDist)))
          onUpdateStickers(stickers.map((s) => s.id === resizing.id ? { ...s, size: newSize } : s))
        }
        return
      }

      if (dragging) {
        onUpdateStickers(
          stickers.map((s) =>
            s.id === dragging.id
              ? {
                  ...s,
                  x: Math.max(30, Math.min(CANVAS_W - 30, pos.x - dragging.offsetX)),
                  y: Math.max(30, Math.min(CANVAS_H - 30, pos.y - dragging.offsetY)),
                }
              : s
          )
        )
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      setResizing(null)
    }

    const handleDoubleClick = (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)
      const hitId = hitTestSticker(pos.x, pos.y)
      if (hitId) {
        onUpdateStickers(stickers.map((s) => s.id === hitId ? { ...s, flipX: !s.flipX } : s))
      }
    }

    useImperativeHandle(ref, () => ({
      download() {
        const canvas = canvasRef.current
        if (!canvas) return
        const prevSelected = selectedId
        setSelectedId(null)
        // Give time to re-render without selection handles
        setTimeout(() => {
          const link = document.createElement('a')
          link.download = `meme-satire-${Date.now()}.png`
          link.href = canvas.toDataURL('image/png', 1.0)
          link.click()
          setSelectedId(prevSelected)
        }, 50)
      },
    }))

    return (
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-lg border border-white/10 cursor-pointer shadow-2xl"
          style={{ maxWidth: '100%', height: 'auto' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick}
        />
        <div className="mt-2 text-xs text-gray-500 text-center">
          Click to select • Drag to move • Double-click to flip • Handles: resize (yellow) | delete (red)
        </div>
      </div>
    )
  }
)
