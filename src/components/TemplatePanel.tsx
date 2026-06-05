'use client'

import Image from 'next/image'
import type { MemeTemplate } from '@/types/meme'

interface TemplatePanelProps {
  templates: MemeTemplate[]
  selectedTemplate: MemeTemplate
  onSelectTemplate: (template: MemeTemplate) => void
}

export default function TemplatePanel({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplatePanelProps) {
  const imageTemplates = templates.filter((t) => t.imageUrl)
  const styledTemplates = templates.filter((t) => !t.imageUrl)

  return (
    <div className="p-3">
      {/* Image-based templates */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        📸 Meme Templates
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {imageTemplates.map((template) => {
          const isSelected = template.id === selectedTemplate.id
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all text-left group ${
                isSelected
                  ? 'border-orange-500 ring-1 ring-orange-500/50'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="relative w-full h-20 bg-black">
                <Image
                  src={template.imageUrl!}
                  alt={template.name}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  sizes="128px"
                />
              </div>
              <div className="px-2 py-1.5 bg-black/80">
                <div className="text-xs font-medium text-white truncate">{template.name}</div>
              </div>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs leading-none">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Styled canvas templates */}
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
        🎨 Styled Layouts
      </p>
      <div className="grid grid-cols-2 gap-2">
        {styledTemplates.map((template) => {
          const isSelected = template.id === selectedTemplate.id
          return (
            <button
              key={template.id}
              onClick={() => onSelectTemplate(template)}
              className={`relative rounded-lg overflow-hidden border-2 transition-all text-left group ${
                isSelected
                  ? 'border-orange-500 ring-1 ring-orange-500/50'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div
                className="w-full h-14 flex items-center justify-center text-2xl"
                style={
                  template.bgGradient
                    ? { background: template.bgGradient }
                    : { background: template.bgColor }
                }
              >
                {template.previewEmoji}
              </div>
              <div className="px-2 py-1.5 bg-black/80">
                <div className="text-xs font-medium text-white truncate">{template.name}</div>
              </div>
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs leading-none">✓</span>
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
