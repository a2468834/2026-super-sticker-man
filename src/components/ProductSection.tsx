'use client'

import Image from 'next/image'
import ProductCard from './ProductCard'
import type { Category, CartItem } from '@/data/products'

interface Props {
  category: Category
  cart: CartItem[]
  // Open state is owned by the page so one control can fold every section.
  isOpen: boolean
  onToggle: () => void
  onAdd: (categoryId: string, variantId: string) => void
  onUpdate: (categoryId: string, variantId: string, qty: number) => void
}

function getCartQty(cart: CartItem[], categoryId: string, variantId: string): number {
  return cart.find((i) => i.categoryId === categoryId && i.variantId === variantId)?.qty ?? 0
}

export default function ProductSection({ category, cart, isOpen, onToggle, onAdd, onUpdate }: Props) {
  const selectable = category.selectable !== false
  const options = category.options ?? []

  const fixedPrice = category.pricing?.type === 'fixed' ? category.pricing.price : undefined

  const priceHint = category.pricing
    ? category.pricing.type === 'fixed'
      ? `NT$ ${category.pricing.price} / 件`
      : `NT$ ${category.pricing.soloPrice} / 件（加價購 NT$ ${category.pricing.companionPrice}）`
    : options.length > 0
      ? `NT$ ${Math.min(...options.map((o) => o.price))} 起`
      : null

  // An option marked requiresBase needs at least one ordinary item from the
  // same category already in the cart.
  const requiresBaseSkus = new Set(options.filter((o) => o.requiresBase).map((o) => o.sku))
  const baseQty = cart
    .filter((i) => i.categoryId === category.id && !requiresBaseSkus.has(i.variantId))
    .reduce((s, i) => s + i.qty, 0)

  return (
    <section>
      {/* Category header — acts as accordion toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={`mb-3 flex w-full items-baseline gap-3 rounded-xl px-4 py-2 text-left transition-colors duration-300 ${!isOpen ? 'bg-gray-200' : ''}`}
      >
        <h2 className="text-lg font-bold text-gray-900">{category.name}</h2>
        {priceHint && <span className="text-xs text-gray-400">{priceHint}</span>}
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
          {!selectable && (
            <p className="mb-2 text-xs text-gray-400">陣容一覽（盲抽，無法指定款式）</p>
          )}

          {category.lineupImage ? (
            /* One shared photo stands in for the whole lineup */
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
              <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${category.lineupImage}`}
                  alt={category.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 384px"
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {category.variants.map((variant) => (
                  <span
                    key={variant.sku}
                    className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700"
                  >
                    {variant.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {category.variants.map((variant) => {
                const qty = getCartQty(cart, category.id, variant.sku)
                return (
                  <ProductCard
                    key={variant.sku}
                    variantName={variant.name}
                    image={variant.image}
                    unitPrice={fixedPrice}
                    cartQty={qty}
                    maxQty={variant.maxQty}
                    displayOnly={!selectable}
                    onAdd={selectable ? () => onAdd(category.id, variant.sku) : undefined}
                  />
                )
              })}
            </div>
          )}

          {/* Purchase / add-on option rows */}
          {options.map((option) => {
            const optionQty = getCartQty(cart, category.id, option.sku)
            const locked = option.requiresBase === true && baseQty === 0
            const atCap = option.maxQty != null && optionQty >= option.maxQty
            return (
              <div
                key={option.sku}
                className={`mt-3 flex items-center justify-between rounded-lg border px-4 py-3 ${
                  locked ? 'border-gray-100 bg-gray-50 opacity-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{option.name}</p>
                  <p className="text-xs text-gray-500">
                    NT$ {option.price}
                    {option.note && `（${option.note}）`}
                    {locked && `（需先加入${category.name}）`}
                  </p>
                </div>
                {optionQty === 0 ? (
                  <button
                    onClick={() => !locked && onAdd(category.id, option.sku)}
                    disabled={locked}
                    className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {option.requiresBase ? '加購' : '加入'}
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdate(category.id, option.sku, optionQty - 1)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100"
                      aria-label="減少數量"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold text-gray-800">{optionQty}</span>
                    <button
                      onClick={() => onUpdate(category.id, option.sku, optionQty + 1)}
                      disabled={atCap}
                      className="flex h-7 w-7 items-center justify-center rounded border border-gray-300 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-300"
                      aria-label="增加數量"
                    >
                      ＋
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
