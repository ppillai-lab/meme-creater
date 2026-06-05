'use client'

import type { MemeTemplate } from '@/types/meme'

interface TemplatePanelProps {
  templates: MemeTemplate[]
  selectedTemplate: MemeTemplate
  onSelectTemplate: (template: MemeTemplate) => void
}

const layoutLabels: Record<string, string> = {
  'default': 'Standard',
  'breaking-news': 'Breaking News',
  'two-panel': 'Two Panel',
  'compare': 'Compare',
  'speech-bubble': 'Speech',
  'blank': 'Blank',
}

export default function TemplatePanel({
  templates,
  selectedTemplate,
  onSelectTemplate,
}: TemplatePanelProps) {
  return (
    <div className="p-3">
      <p className="text-xs text-gray-500 mb-3">
        Choose a background style for your meme.
      </p>
      <div className="grid grid-cols-2 gap-2">
        {templates.map((template) => {
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
              {/* Preview swatch */}
              <div
                className="w-full h-16 flex items-center justify-center text-3xl"
                style={
                  template.bgGradient
                    ? { background: template.bgGradient }
                    : { background: template.bgColor }
                }
              >
                {template.previewEmoji}
              </div>

              {/* Label */}
              <div
                className="px-2 py-1.5"
                style={{ background: template.bgColor + 'dd' }}
              >
                <div className="text-xs font-medium text-white truncate">
                  {template.name}
                </div>
                <div className="text-xs text-gray-400">
                  {layoutLabels[template.layout] ?? template.layout}
                </div>
              </div>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
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
