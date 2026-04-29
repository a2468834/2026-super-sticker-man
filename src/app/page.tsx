'use client'

import { useState, useMemo } from 'react'
import { CATEGORIES } from '@/data/products'
import type { CartItem } from '@/data/products'
import { buildLineItems, getEarnedGifts } from '@/lib/pricing'
import ProductSection from '@/components/ProductSection'
import Cart from '@/components/Cart'
import CartSummary from '@/components/CartSummary'

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [hasReservation, setHasReservation] = useState(false)
  const [isMember, setIsMember] = useState(false)

  const lineItems = useMemo(() => buildLineItems(cart), [cart])
  const total = useMemo(() => lineItems.reduce((s, l) => s + l.subtotal, 0), [lineItems])
  const gifts = useMemo(
    () => getEarnedGifts(total, hasReservation, isMember),
    [total, hasReservation, isMember],
  )

  function addToCart(categoryId: string, variantId: string) {
    setCart((prev) => {
      const existing = prev.find(
        (i) => i.categoryId === categoryId && i.variantId === variantId,
      )
      if (existing) {
        return prev.map((i) =>
          i.categoryId === categoryId && i.variantId === variantId
            ? { ...i, qty: i.qty + 1 }
            : i,
        )
      }
      return [...prev, { categoryId, variantId, qty: 1 }]
    })
  }

  function updateCartQty(categoryId: string, variantId: string, qty: number) {
    if (qty <= 0) {
      removeFromCart(categoryId, variantId)
      return
    }
    setCart((prev) =>
      prev.map((i) =>
        i.categoryId === categoryId && i.variantId === variantId ? { ...i, qty } : i,
      ),
    )
  }

  function removeFromCart(categoryId: string, variantId: string) {
    setCart((prev) => {
      let next = prev.filter(
        (i) => !(i.categoryId === categoryId && i.variantId === variantId),
      )
      // Strip addons for any category whose base variants have dropped to 0.
      for (const cat of CATEGORIES) {
        if (!cat.addon) continue
        const baseQty = next
          .filter((i) => i.categoryId === cat.id && i.variantId !== cat.addon!.id)
          .reduce((s, i) => s + i.qty, 0)
        if (baseQty === 0) {
          next = next.filter(
            (i) => !(i.categoryId === cat.id && i.variantId === cat.addon!.id),
          )
        }
      }
      return next
    })
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight text-gray-900">
            2026 Super Sticker Man
          </h1>
          <span className="text-sm text-gray-500">
            {totalItems > 0 ? `購物車 ${totalItems} 件` : '購物車是空的'}
          </span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        {/* Identity checkboxes */}
        <div className="mb-6 flex flex-wrap gap-6 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={hasReservation}
              onChange={(e) => setHasReservation(e.target.checked)}
              className="h-4 w-4 rounded accent-gray-900"
            />
            <span>線上預約活動並實際入場</span>
            <span className="text-xs text-gray-400">（贈 應援手燈）</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={isMember}
              onChange={(e) => setIsMember(e.target.checked)}
              className="h-4 w-4 rounded accent-gray-900"
            />
            <span>不良製作委員會身份</span>
            <span className="text-xs text-gray-400">（IDOL卡套加贈專屬卡）</span>
          </label>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* Product list */}
          <div className="min-w-0 flex-1 space-y-10">
            {CATEGORIES.map((cat) => (
              <ProductSection
                key={cat.id}
                category={cat}
                cart={cart}
                onAdd={addToCart}
                onUpdate={updateCartQty}
              />
            ))}
          </div>

          {/* Cart panel */}
          <aside className="w-full lg:sticky lg:top-20 lg:w-80 xl:w-96">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-base font-bold text-gray-900">購物車</h2>
              <Cart
                lineItems={lineItems}
                onUpdate={updateCartQty}
                onRemove={removeFromCart}
              />
              {lineItems.length > 0 && (
                <div className="mt-4">
                  <CartSummary total={total} gifts={gifts} />
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
