'use client'

import { useState } from 'react'
import type { CartItem } from '@/data/products'
import SkuInput from './SkuInput'
import { formatSkuText } from '@/lib/skuText'
import { findBestSplit } from '@/lib/split'
import type { SplitResult, SplitPlan } from '@/lib/split'

interface Props {
  cart: CartItem[]
  onApplySkus: (items: CartItem[]) => void
}

function SkuLine({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard can be blocked; the field is selectable as a fallback.
    }
  }

  return (
    <div className="mt-2 flex items-center gap-2">
      <input
        readOnly
        value={text}
        onFocus={(e) => e.currentTarget.select()}
        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-2 py-1 font-mono text-xs text-gray-700"
      />
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
      >
        {copied ? '已複製' : '複製'}
      </button>
    </div>
  )
}

function PlanDetail({ plan }: { plan: SplitPlan }) {
  return (
    <div className="mt-3 space-y-3">
      {plan.orders.map((order, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800">訂單 {i + 1}</span>
            <span className="text-sm font-bold text-gray-900">
              NT$ {order.subtotal.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-700">
            {order.gifts.length > 0
              ? order.gifts
                  .map((g) => g.name + (g.qty && g.qty > 1 ? ` ×${g.qty}` : ''))
                  .join('、')
              : '（此筆無贈品）'}
          </p>
          <SkuLine text={formatSkuText(order.items)} />
        </div>
      ))}
    </div>
  )
}

export default function CartTools({ cart, onApplySkus }: Props) {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<SplitResult | null>(null)
  const [shownCount, setShownCount] = useState<number | null>(null)
  const [groupSameCategory, setGroupSameCategory] = useState(true)
  const [coverageFirst, setCoverageFirst] = useState(false)

  // Any setting change invalidates the plan on screen.
  function clearPlan() {
    setResult(null)
    setShownCount(null)
  }

  async function handleSplit() {
    setBusy(true)
    setProgress(0)
    setResult(null)
    setShownCount(null)
    // Let the spinner paint before the search seizes the thread.
    await new Promise((r) => setTimeout(r, 0))
    const found = await findBestSplit(cart, {
      cohesion: groupSameCategory ? 'group' : 'spread',
      coverageFirst,
      onProgress: setProgress,
    })
    setResult(found)
    setShownCount(found?.best.orders.length ?? null)
    setBusy(false)
  }

  const shownPlan =
    result && shownCount != null ? result.byOrderCount[shownCount] ?? result.best : null

  return (
    <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-5 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">批次輸入 ∕ 拆單試算</span>
        <span className="text-xs text-gray-400">貼上 SKU 字串直接加車，然後試算怎麼拆單最划算</span>
        <svg
          className={`ml-auto h-4 w-4 shrink-0 text-gray-400 transition-transform duration-300 ${open ? 'rotate-0' : '-rotate-90'}`}
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="space-y-5 border-t border-gray-100 px-5 py-4">
            {/* Bulk SKU entry */}
            <SkuInput cart={cart} onApply={onApplySkus} />

            {/* Split calculator */}
            <div className="border-t border-gray-100 pt-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSplit}
                  disabled={busy || cart.length === 0}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  {busy && (
                    <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  )}
                  {busy ? `試算中 ${Math.round(progress * 100)}%` : '試算拆單'}
                </button>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={groupSameCategory}
                    onChange={(e) => {
                      setGroupSameCategory(e.target.checked)
                      clearPlan()
                    }}
                    className="h-4 w-4 rounded accent-gray-900"
                  />
                  <span>集中下單同類品項</span>
                </label>
                <span className="text-xs text-gray-400">
                  取消勾選則盡量分散，盲抽可分批開獎
                </span>

                <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={coverageFirst}
                    onChange={(e) => {
                      setCoverageFirst(e.target.checked)
                      clearPlan()
                    }}
                    className="h-4 w-4 rounded accent-gray-900"
                  />
                  <span>每種贈品至少一個</span>
                </label>
                <span className="text-xs text-gray-400">
                  避免只拿便宜贈品、最貴的那件反而掛零
                </span>
              </div>

              {result && shownPlan && (
                <div className="mt-4">
                  <p className="text-sm text-gray-700">
                    不拆單：贈品{' '}
                    <span className="font-semibold">{result.baseline.giftCount}</span> 件、NT${' '}
                    {result.baseline.totalCost.toLocaleString()}
                    {'　→　'}
                    最佳：
                    <span className="font-semibold text-emerald-700">
                      {result.best.orders.length} 筆、贈品 {result.best.giftCount} 件
                    </span>
                    、NT$ {result.best.totalCost.toLocaleString()}
                    {result.best.totalCost !== result.baseline.totalCost && (
                      <span className="text-red-600">
                        （多付 NT${' '}
                        {(result.best.totalCost - result.baseline.totalCost).toLocaleString()}）
                      </span>
                    )}
                  </p>

                  {/* Pick how many trips you are willing to make */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {result.byOrderCount.map((plan, count) =>
                      plan ? (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setShownCount(count)}
                          className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                            shownCount === count
                              ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                              : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <span className="font-semibold">{count} 筆</span>
                          <span className="ml-1.5">贈品 {plan.giftCount} 件</span>
                          <span className="ml-1.5 text-gray-400">
                            NT$ {plan.totalCost.toLocaleString()}
                          </span>
                        </button>
                      ) : null,
                    )}
                  </div>

                  <PlanDetail plan={shownPlan} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
