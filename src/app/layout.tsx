import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Meme Creater - Tamil Political Satire Studio',
  description: 'Create political satire memes about Indian and Tamil Nadu politics. Featuring Modi, Stalin, Udhayanidhi, Vijay, Vadivelu and more cartoon characters.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f]">{children}</body>
    </html>
  )
}
