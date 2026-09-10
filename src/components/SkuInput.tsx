'use client'

import { useState } from 'react'
import type { CartItem } from '@/data/products'
import { parseSkuText } from '@/lib/skuText'

interface Props {
  label: string
  rows?: number
  onAddSkus: (items: CartItem[]) => void
}

export default function SkuInput({ label, rows = 3, onAddSkus }: Props) {
  const [text, setText] = useState('')
  const [feedback, setFeedback] = useState<{ errors: string[]; notes: string[] } | null>(null)

  function handleAdd() {
    const parsed = parseSkuText(text)
    setFeedback({ errors: parsed.errors, notes: parsed.notes })
    if (parsed.items.length > 0) {
      onAddSkus(parsed.items)
      setText('')
    }
  }

  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <textarea
        rows={rows}
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="SKU-001-0007*4 SKU-002-0001*2"
        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
      />
      <button
        type="button"
        onClick={handleAdd}
        disabled={text.trim() === ''}
        className="mt-2 rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        加入購物車
      </button>
      {feedback?.errors.map((e) => (
        <p key={e} className="mt-1 text-xs text-red-500">{e}</p>
      ))}
      {feedback?.notes.map((n) => (
        <p key={n} className="mt-1 text-xs text-amber-600">{n}</p>
      ))}
    </div>
  )
}
