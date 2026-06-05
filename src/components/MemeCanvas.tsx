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
  onStickerActionComplete?: (stickers: StickerElement[]) => void
  topCaption: string
  bottomCaption: string
}

const CANVAS_W = 700
const CANVAS_H = 500

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line)
      line = word
      if (lines.length >= maxLines) break
    } else {
      line = test
    }
  }
  if (line && lines.length < maxLines) lines.push(line)
  return lines.slice(0, maxLines)
}

function drawSpeechBubble(
  ctx: CanvasRenderingContext2D,
  topText: string,
  bottomText: string,
  w: number,
  h: number,
  firstSticker?: StickerElement
) {
  const bx = 30
  const by = 20
  const bw = w - 60
  const bh = 210
  const br = 24

  const speakerX = firstSticker ? firstSticker.x : w / 4
  const speakerY = firstSticker
    ? firstSticker.y - firstSticker.size / 2 - 10
    : h - 100
  const tailBaseX = Math.max(bx + br + 30, Math.min(bx + bw - br - 30, speakerX))
  const tailBaseY = by + bh

  // Shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.18)'
  ctx.shadowBlur = 18
  ctx.shadowOffsetY = 5
  ctx.fillStyle = '#ffffff'
  roundedRect(ctx, bx, by, bw, bh, br)
  ctx.fill()
  ctx.restore()

  // Border
  ctx.strokeStyle = '#2c2c2c'
  ctx.lineWidth = 3
  roundedRect(ctx, bx, by, bw, bh, br)
  ctx.stroke()

  // Tail fill (covers bubble border at base)
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.moveTo(tailBaseX - 22, tailBaseY - 2)
  ctx.lineTo(tailBaseX + 22, tailBaseY - 2)
  ctx.lineTo(speakerX, speakerY)
  ctx.closePath()
  ctx.fill()

  // Tail border lines (left and right sides only)
  ctx.strokeStyle = '#2c2c2c'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(tailBaseX - 22, tailBaseY)
  ctx.lineTo(speakerX, speakerY)
  ctx.moveTo(tailBaseX + 22, tailBaseY)
  ctx.lineTo(speakerX, speakerY)
  ctx.stroke()

  // Text inside bubble
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const textX = w / 2
  const midY = by + bh / 2

  if (!topText && !bottomText) {
    ctx.font = 'italic 18px Arial, sans-serif'
    ctx.fillStyle = 'rgba(0,0,0,0.2)'
    ctx.fillText('Type caption above to fill bubble...', textX, midY)
    return
  }

  if (topText && bottomText) {
    ctx.font = 'bold 30px Impact, Arial Black, sans-serif'
    ctx.fillStyle = '#1a1a1a'
    const topLines = wrapTextLines(ctx, topText.toUpperCase(), bw - 60, 2)
    const topTotalH = (topLines.length - 1) * 36
    const topStartY = midY - 34 - topTotalH / 2
    topLines.forEach((l, i) => ctx.fillText(l, textX, topStartY + i * 36))

    ctx.font = 'bold 22px Impact, Arial Black, sans-serif'
    ctx.fillStyle = '#555555'
    const botLines = wrapTextLines(ctx, bottomText.toUpperCase(), bw - 60, 2)
    const botTotalH = (botLines.length - 1) * 28
    const botStartY = midY + 50 - botTotalH / 2
    botLines.forEach((l, i) => ctx.fillText(l, textX, botStartY + i * 28))
  } else {
    const text = topText || bottomText
    ctx.font = 'bold 32px Impact, Arial Black, sans-serif'
    ctx.fillStyle = '#1a1a1a'
    const lines = wrapTextLines(ctx, text.toUpperCase(), bw - 60, 3)
    const totalH = (lines.length - 1) * 40
    const startY = midY - totalH / 2
    lines.forEach((l, i) => ctx.fillText(l, textX, startY + i * 40))
  }
}

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
  isSelected: boolean,
  photoCache: Map<string, HTMLImageElement | null>
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

  const photo = char.photoUrl ? (photoCache.get(sticker.characterId) ?? null) : null

  if (photo) {
    // Circular photo crop
    ctx.save()
    ctx.beginPath()
    ctx.arc(x, y, halfSize, 0, Math.PI * 2)
    ctx.clip()

    // Cover-fit: crop photo to square from center
    const natW = photo.naturalWidth
    const natH = photo.naturalHeight
    let sx = 0, sy = 0, sw = natW, sh = natH
    if (natW > natH) { sw = natH; sx = (natW - natH) / 2 }
    else { sh = natW; sy = (natH - natW) / 2 }
    ctx.drawImage(photo, sx, sy, sw, sh, x - halfSize, y - halfSize, size, size)
    ctx.restore()

    // Colored party ring
    ctx.beginPath()
    ctx.arc(x, y, halfSize, 0, Math.PI * 2)
    ctx.strokeStyle = char.partyColor
    ctx.lineWidth = 4
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y, halfSize - 4, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  } else {
    // Fallback: emoji circle
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, halfSize)
    gradient.addColorStop(0, char.partyColor)
    gradient.addColorStop(1, char.partyColor + 'aa')
    ctx.beginPath()
    ctx.arc(x, y, halfSize, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
    ctx.strokeStyle = 'rgba(255,255,255,0.3)'
    ctx.lineWidth = 2
    ctx.stroke()
    ctx.font = `${size * 0.5}px serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(char.emoji, x, y - size * 0.05)
  }

  // Name label
  const labelFontSize = Math.max(10, size * 0.13)
  ctx.font = `bold ${labelFontSize}px Arial, sans-serif`
  ctx.textBaseline = 'alphabetic'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#ffffff'
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.strokeText(char.displayName.toUpperCase(), x, y + halfSize + size * 0.15)
  ctx.fillText(char.displayName.toUpperCase(), x, y + halfSize + size * 0.15)

  // Party badge
  ctx.font = `bold ${Math.max(8, size * 0.1)}px Arial, sans-serif`
  ctx.fillStyle = char.partyColor
  ctx.strokeStyle = '#000'
  ctx.lineWidth = 1.5
  ctx.strokeText(char.party, x, y + halfSize + size * 0.28)
  ctx.fillText(char.party, x, y + halfSize + size * 0.28)

  ctx.restore()

  // Selection indicator (outside flipX transform)
  if (isSelected) {
    ctx.save()
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#fbbf24'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, halfSize + 6, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    ctx.fillStyle = '#fbbf24'
    ctx.beginPath()
    ctx.arc(x + halfSize, y - halfSize, 6, 0, Math.PI * 2)
    ctx.fill()
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
      grad.addColorStop(0, parts[0] ?? template.bgColor)
      grad.addColorStop(1, parts[1] ?? template.bgColor)
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
  function MemeCanvas({ template, stickers, onUpdateStickers, onStickerActionComplete, topCaption, bottomCaption }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
    const [resizing, setResizing] = useState<{ id: string; startSize: number; startDist: number } | null>(null)
    const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null)
    const photoCacheRef = useRef<Map<string, HTMLImageElement | null>>(new Map())
    const [photoVersion, setPhotoVersion] = useState(0)

    useEffect(() => {
      if (!template.imageUrl) { setBgImage(null); return }
      const img = new Image()
      img.onload = () => setBgImage(img)
      img.onerror = () => setBgImage(null)
      img.src = template.imageUrl
    }, [template.imageUrl])

    // Load character photos into cache as stickers are added
    useEffect(() => {
      stickers.forEach((sticker) => {
        const char = getCharacterById(sticker.characterId)
        if (!char?.photoUrl) return
        if (photoCacheRef.current.has(sticker.characterId)) return
        photoCacheRef.current.set(sticker.characterId, null) // loading sentinel
        const img = new Image()
        img.onload = () => {
          photoCacheRef.current.set(sticker.characterId, img)
          setPhotoVersion((v) => v + 1)
        }
        img.onerror = () => photoCacheRef.current.delete(sticker.characterId)
        img.src = char.photoUrl
      })
    }, [stickers])

    const render = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H)

      if (template.imageUrl && bgImage) {
        // Cover-fit: fill canvas, crop center
        const ia = bgImage.naturalWidth / bgImage.naturalHeight
        const ca = CANVAS_W / CANVAS_H
        let sx = 0, sy = 0, sw = bgImage.naturalWidth, sh = bgImage.naturalHeight
        if (ia > ca) { sw = sh * ca; sx = (bgImage.naturalWidth - sw) / 2 }
        else { sh = sw / ca; sy = (bgImage.naturalHeight - sh) / 2 }
        ctx.drawImage(bgImage, sx, sy, sw, sh, 0, 0, CANVAS_W, CANVAS_H)
      } else if (template.imageUrl && !bgImage) {
        // Image still loading — draw placeholder
        ctx.fillStyle = template.bgColor
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)
        ctx.fillStyle = 'rgba(255,255,255,0.2)'
        ctx.font = '16px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('Loading image…', CANVAS_W / 2, CANVAS_H / 2)
      } else {
        drawTemplate(ctx, template, CANVAS_W, CANVAS_H)
      }

      // Draw stickers (bottom-most first)
      stickers.forEach((sticker) => {
        drawCharacterSticker(ctx, sticker, sticker.id === selectedId, photoCacheRef.current)
      })

      // Draw captions
      if (template.layout === 'speech') {
        if (stickers.length === 0) {
          const gx = CANVAS_W / 2
          const gy = CANVAS_H - 90
          ctx.save()
          ctx.setLineDash([8, 6])
          ctx.strokeStyle = 'rgba(0,0,0,0.18)'
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.arc(gx, gy, 60, 0, Math.PI * 2)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.fillStyle = 'rgba(0,0,0,0.18)'
          ctx.font = 'bold 11px Arial, sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText('ADD CHARACTER', gx, gy - 7)
          ctx.fillText('FROM LEFT PANEL', gx, gy + 9)
          ctx.restore()
        }
        drawSpeechBubble(ctx, topCaption, bottomCaption, CANVAS_W, CANVAS_H, stickers[0])
      } else {
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
      }
    }, [template, stickers, selectedId, topCaption, bottomCaption, bgImage, photoVersion])

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
          const filtered = stickers.filter((s) => s.id !== selectedId)
          onUpdateStickers(filtered)
          onStickerActionComplete?.(filtered)
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
      if (dragging || resizing) {
        onStickerActionComplete?.(stickers)
      }
      setDragging(null)
      setResizing(null)
    }

    const handleDoubleClick = (e: React.MouseEvent) => {
      const pos = getCanvasPos(e)
      const hitId = hitTestSticker(pos.x, pos.y)
      if (hitId) {
        const mapped = stickers.map((s) => s.id === hitId ? { ...s, flipX: !s.flipX } : s)
        onUpdateStickers(mapped)
        onStickerActionComplete?.(mapped)
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
      copyToClipboard(): Promise<boolean> {
        const canvas = canvasRef.current
        if (!canvas) return Promise.resolve(false)
        const prevSelected = selectedId
        setSelectedId(null)
        return new Promise((resolve) => {
          setTimeout(() => {
            canvas.toBlob(async (blob) => {
              if (!blob) { setSelectedId(prevSelected); resolve(false); return }
              try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                resolve(true)
              } catch {
                resolve(false)
              } finally {
                setSelectedId(prevSelected)
              }
            }, 'image/png', 1.0)
          }, 50)
        })
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
