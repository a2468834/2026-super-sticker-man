'use client'

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
  const bulkPricing =
    category.pricing.type === 'bulk' ? category.pricing : null

  // For bulk categories, compute total non-addon qty to determine effective price
  const bulkTotalQty = bulkPricing
    ? cart
        .filter((i) => i.categoryId === category.id && i.variantId !== category.addon?.id)
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
    ? getCartQty(cart, category.id, category.addon.id)
    : 0
  const stickerBookQty = cart
    .filter((i) => i.categoryId === category.id && i.variantId !== category.addon?.id)
    .reduce((s, i) => s + i.qty, 0)
  const canAddAddon = stickerBookQty > 0

  return (
    <section>
      {/* Category header */}
      <div className="mb-3 flex items-baseline gap-3">
        <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
        {bulkPricing && (
          <span className="text-xs text-gray-500">
            NT$ {bulkPricing.normalPrice}
            {bulkTotalQty >= bulkPricing.minQty ? (
              <span className="ml-1 font-semibold text-red-600">
                → NT$ {bulkPricing.discountPrice}（已達折扣）
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
      </div>

      {/* Variant grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
        {category.variants.map((variant) => {
          const qty = getCartQty(cart, category.id, variant.id)
          return (
            <ProductCard
              key={variant.id}
              categoryId={category.id}
              variantId={variant.id}
              variantName={variant.name}
              image={variant.image}
              unitPrice={effectivePrice}
              normalPrice={normalPriceForCard}
              cartQty={qty}
              onAdd={() => onAdd(category.id, variant.id)}
              onUpdate={(q) => onUpdate(category.id, variant.id, q)}
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
              onClick={() => canAddAddon && onAdd(category.id, category.addon!.id)}
              disabled={!canAddAddon}
              className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              加購
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdate(category.id, category.addon!.id, addonQty - 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-semibold text-gray-800">{addonQty}</span>
              <button
                onClick={() => onUpdate(category.id, category.addon!.id, addonQty + 1)}
                className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
