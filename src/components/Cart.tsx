'use client'

import { useState } from 'react'
import SkuInput from './SkuInput'
import { maxQtyFor } from '@/data/products'
import type { CartItem } from '@/data/products'
import type { LineItem } from '@/lib/pricing'

interface Props {
  lineItems: LineItem[]
  onAddSkus: (items: CartItem[]) => void
  onUpdate: (categoryId: string, variantId: string, qty: number) => void
  onRemove: (categoryId: string, variantId: string) => void
}

export default function Cart({ lineItems, onAddSkus, onUpdate, onRemove }: Props) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  // An empty cart is the natural place to offer the bulk paste, which is how
  // a split plan gets previewed in a fresh tab.
  if (lineItems.length === 0) {
    return (
      <div className="py-2">
        <SkuInput label="貼上 SKU 直接加入購物車" rows={3} onAddSkus={onAddSkus} />
      </div>
    )
  }

  function itemKey(item: LineItem) {
    return `${item.categoryId}-${item.variantId}`
  }

  function commitDraft(item: LineItem) {
    const k = itemKey(item)
    const raw = drafts[k]
    if (raw !== undefined) {
      const parsed = parseInt(raw, 10)
      if (Number.isInteger(parsed) && parsed > 0) {
        onUpdate(item.categoryId, item.variantId, parsed)
      }
      setDrafts((prev) => {
        const next = { ...prev }
        delete next[k]
        return next
      })
    }
  }

  return (
    <ul className="divide-y divide-gray-100">
      {lineItems.map((item) => {
        const k = itemKey(item)

        // Bundle savings are derived, not something the shopper edits directly.
        if (item.kind === 'discount') {
          return (
            <li key={k} className="flex items-start gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-emerald-700">
                  {item.categoryName}
                </p>
                <p className="truncate text-xs text-gray-500">{item.variantName}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  −NT$ {Math.abs(item.unitPrice)} × {item.qty} ={' '}
                  <span className="font-semibold text-emerald-600">
                    −NT$ {Math.abs(item.subtotal).toLocaleString()}
                  </span>
                </p>
              </div>
            </li>
          )
        }

        const displayValue = drafts[k] ?? String(item.qty)
        const maxQty = maxQtyFor(item.categoryId, item.variantId)
        const atCap = maxQty != null && item.qty >= maxQty

        return (
          <li key={k} className="flex items-start gap-3 py-3">
            {/* Name */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-800">
                {item.categoryName}
              </p>
              <p className="truncate text-xs text-gray-500">{item.variantName}</p>
              <p className="mt-0.5 text-xs text-gray-400">
                NT$ {item.unitPrice} × {item.qty} ={' '}
                <span className="font-semibold text-gray-700">
                  NT$ {item.subtotal.toLocaleString()}
                </span>
              </p>
            </div>

            {/* Qty stepper */}
            <div className="flex shrink-0 items-center gap-1">
              <button
                onClick={() => onUpdate(item.categoryId, item.variantId, item.qty - 1)}
                className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm leading-none text-gray-700 hover:bg-gray-100"
                aria-label="減少數量"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [k]: e.target.value }))
                }
                onBlur={() => commitDraft(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
                className="w-8 rounded border border-gray-200 text-center text-sm font-medium text-gray-800 outline-none focus:border-gray-400"
                aria-label="數量"
              />
              <button
                onClick={() => onUpdate(item.categoryId, item.variantId, item.qty + 1)}
                disabled={atCap}
                className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm leading-none text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
                aria-label="增加數量"
              >
                +
              </button>
              <button
                onClick={() => onRemove(item.categoryId, item.variantId)}
                className="ml-1 text-gray-300 hover:text-red-400"
                aria-label="移除商品"
              >
                ✕
              </button>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
