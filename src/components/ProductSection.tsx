'use client'

import { useState } from 'react'
import ProductCard from './ProductCard'
import type { Category, CartItem } from '@/data/products'

interface Props {
  category: Category
  cart: CartItem[]
  onAdd: (categoryId: string, variantId: string) => void
  onUpdate: (categoryId: string, variantId: string, qty: number) => void
}

function getCartQty(cart: CartItem[], categoryId: string, variantId: string): number {
  return cart.find((i) => i.categoryId === categoryId && i.variantId === variantId)?.qty ?? 0
}

export default function ProductSection({ category, cart, onAdd, onUpdate }: Props) {
  const [isOpen, setIsOpen] = useState(true)
  const bulkPricing =
    category.pricing.type === 'bulk' ? category.pricing : null

  // For bulk categories, compute total non-addon qty to determine effective price
  const bulkTotalQty = bulkPricing
    ? cart
        .filter((i) => i.categoryId === category.id && i.variantId !== category.addon?.sku)
        .reduce((s, i) => s + i.qty, 0)
    : 0

  const effectivePrice = bulkPricing
    ? bulkTotalQty >= bulkPricing.minQty
      ? bulkPricing.discountPrice
      : bulkPricing.normalPrice
    : category.pricing.type === 'fixed'
    ? category.pricing.price
    : 0

  const normalPriceForCard =
    bulkPricing && bulkTotalQty >= bulkPricing.minQty
      ? bulkPricing.normalPrice
      : undefined

  // Addon state
  const addonQty = category.addon
    ? getCartQty(cart, category.id, category.addon.sku)
    : 0
  const stickerBookQty = cart
    .filter((i) => i.categoryId === category.id && i.variantId !== category.addon?.sku)
    .reduce((s, i) => s + i.qty, 0)
  const canAddAddon = stickerBookQty > 0

  return (
    <section>
      {/* Category header — acts as accordion toggle */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`mb-3 flex w-full items-baseline gap-3 rounded-xl px-4 py-2 text-left transition-colors duration-300 ${!isOpen ? 'bg-gray-200' : ''}`}
      >
        <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
        {bulkPricing && (
          <span className="text-xs text-gray-500">
            NT$ {bulkPricing.normalPrice}
            {bulkTotalQty >= bulkPricing.minQty ? (
              <span className="ml-1 font-semibold text-red-600">
                → NT$ {bulkPricing.discountPrice}（多件享折扣）
              </span>
            ) : (
              <span className="ml-1 text-gray-400">
                （購買 ≥{bulkPricing.minQty} 件享 NT$ {bulkPricing.discountPrice}）
              </span>
            )}
          </span>
        )}
        {!bulkPricing && (
          <span className="text-xs text-gray-400">NT$ {effectivePrice} / 件</span>
        )}
        {category.description && (
          <span className="text-xs text-gray-400">（{category.description}）</span>
        )}
        <svg
          className={`ml-auto h-4 w-4 shrink-0 self-center text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Collapsible content */}
      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          {/* Variant grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {category.variants.map((variant) => {
              const qty = getCartQty(cart, category.id, variant.sku)
              return (
                <ProductCard
                  key={variant.sku}
                  variantName={variant.name}
                  image={variant.image}
                  unitPrice={effectivePrice}
                  normalPrice={normalPriceForCard}
                  cartQty={qty}
                  onAdd={() => onAdd(category.id, variant.sku)}
                />
              )
            })}
          </div>

          {/* Addon row */}
          {category.addon && (
            <div className={`mt-3 flex items-center justify-between rounded-lg border px-4 py-3 ${
              canAddAddon ? 'border-gray-200 bg-gray-50' : 'border-gray-100 bg-gray-50 opacity-50'
            }`}>
              <div>
                <p className="text-sm font-medium text-gray-800">{category.addon.name}</p>
                <p className="text-xs text-gray-500">
                  NT$ {category.addon.price} /個
                  {!canAddAddon && '（需先加入貼紙簿）'}
                </p>
              </div>
              {addonQty === 0 ? (
                <button
                  onClick={() => canAddAddon && onAdd(category.id, category.addon!.sku)}
                  disabled={!canAddAddon}
                  className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  加購
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdate(category.id, category.addon!.sku, addonQty - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    −
                  </button>
                  <span className="w-5 text-center text-sm font-semibold text-gray-800">{addonQty}</span>
                  <button
                    onClick={() => onUpdate(category.id, category.addon!.sku, addonQty + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
