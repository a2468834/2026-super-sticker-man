'use client'

import { useState } from 'react'
import type { CartItem } from '@/data/products'
import { parseSkuText, formatSkuText } from '@/lib/skuText'

interface Props {
  label?: string
  rows?: number
  // The cart-panel copy only appears on an empty cart, where "add" is exact.
  applyLabel?: string
  cart: CartItem[]
  onApply: (items: CartItem[]) => void
}

/**
 * The cart and this box are two views of the same thing: the text mirrors the
 * cart until you type, and applying it makes the cart match the text. That
 * round trip is why applying replaces rather than appends — appending would
 * double every quantity already shown.
 */
export default function SkuInput({
  label,
  rows = 3,
  applyLabel = '套用至購物車',
  cart,
  onApply,
}: Props) {
  // null means "follow the cart"; a string means the user is editing.
  const [draft, setDraft] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ errors: string[]; notes: string[] } | null>(null)

  const cartText = formatSkuText(cart)
  const value = draft ?? cartText

  function handleApply() {
    const parsed = parseSkuText(value)
    setFeedback({ errors: parsed.errors, notes: parsed.notes })
    if (parsed.errors.length > 0) return
    onApply(parsed.items)
    setDraft(null)
  }

  return (
    <div>
      {label && (
        <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      )}
      <textarea
        rows={rows}
        spellCheck={false}
        value={value}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="SKU-001-0007*4 SKU-002-0001*2"
        className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-800 placeholder:text-gray-400 focus:border-gray-400 focus:bg-white focus:outline-none"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="button"
          onClick={handleApply}
          disabled={value.trim() === '' && cart.length === 0}
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {applyLabel}
        </button>
        {cart.length > 0 && draft !== null && draft !== cartText && (
          <button
            type="button"
            onClick={() => {
              setDraft(null)
              setFeedback(null)
            }}
            className="text-xs text-gray-400 underline hover:text-gray-600"
          >
            還原成目前購物車
          </button>
        )}
      </div>
      {feedback?.errors.map((e) => (
        <p key={e} className="mt-1 text-xs text-red-500">{e}</p>
      ))}
      {feedback?.notes.map((n) => (
        <p key={n} className="mt-1 text-xs text-amber-600">{n}</p>
      ))}
    </div>
  )
}
