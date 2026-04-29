'use client'

import type { LineItem } from '@/lib/pricing'

interface Props {
  lineItems: LineItem[]
  onUpdate: (categoryId: string, variantId: string, qty: number) => void
  onRemove: (categoryId: string, variantId: string) => void
}

export default function Cart({ lineItems, onUpdate, onRemove }: Props) {
  if (lineItems.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-gray-400">購物車是空的</p>
    )
  }

  return (
    <ul className="divide-y divide-gray-100">
      {lineItems.map((item) => (
        <li
          key={`${item.categoryId}-${item.variantId}`}
          className="flex items-start gap-3 py-3"
        >
          {/* Name */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-800">
              {item.categoryName}
            </p>
            <p className="truncate text-xs text-gray-500">
              {item.isAddon ? '加價購附件' : item.variantName}
            </p>
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
              className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm leading-none hover:bg-gray-100"
              aria-label="減少數量"
            >
              −
            </button>
            <span className="w-6 text-center text-sm font-medium">{item.qty}</span>
            <button
              onClick={() => onUpdate(item.categoryId, item.variantId, item.qty + 1)}
              className="flex h-6 w-6 items-center justify-center rounded border border-gray-300 text-sm leading-none hover:bg-gray-100"
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
      ))}
    </ul>
  )
}
