'use client'

import GiftBadge from './GiftBadge'
import type { Gift } from '@/lib/pricing'
import { GIFT_MILESTONES } from '@/lib/pricing'

interface Props {
  total: number
  gifts: Gift[]
}

const THRESHOLD_LABELS: Record<number, string> = {
  1500: '滿 1500｜金玉良言貼紙',
  2000: '滿 2000｜IDOL卡套',
  2500: '滿 2500｜白手帳套組',
  3000: '滿 3000｜金玉良言貼紙 ×2',
}

const ALL_GIFTS_AT: { milestone: number; id: string; name: string; qty?: number }[] = [
  { milestone: 1500, id: 'golden-words', name: '金玉良言貼紙', qty: 1 },
  { milestone: 2000, id: 'idol-card', name: 'IDOL卡套' },
  { milestone: 2500, id: 'notebook-set', name: '白手帳套組' },
  { milestone: 3000, id: 'golden-words-2', name: '金玉良言貼紙', qty: 2 },
]

export default function CartSummary({ total, gifts }: Props) {
  const earnedIds = new Set(gifts.map((g) => g.id))

  // Progress bar: find next unmet milestone
  const nextMilestone = GIFT_MILESTONES.find((m) => total < m)
  const prevMilestone = nextMilestone
    ? GIFT_MILESTONES[GIFT_MILESTONES.indexOf(nextMilestone) - 1] ?? 0
    : GIFT_MILESTONES[GIFT_MILESTONES.length - 1]
  const progressPct =
    nextMilestone != null
      ? Math.min(((total - prevMilestone) / (nextMilestone - prevMilestone)) * 100, 100)
      : 100

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="flex items-baseline justify-between border-t pt-3">
        <span className="text-base font-semibold text-gray-700">訂單總金額</span>
        <span className="text-2xl font-bold text-gray-900">NT$ {total.toLocaleString()}</span>
      </div>

      {/* Progress bar */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-gray-500">
          <span>NT$ {total.toLocaleString()}</span>
          {nextMilestone != null ? (
            <span>距滿額贈品還差 NT$ {(nextMilestone - total).toLocaleString()}</span>
          ) : (
            <span className="text-green-600 font-medium">已達最高滿額門檻</span>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextMilestone != null && (
          <p className="mt-1 text-xs text-gray-400">{THRESHOLD_LABELS[nextMilestone]}</p>
        )}
      </div>

      {/* Gift list */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          滿額贈品
        </p>
        <div className="space-y-1.5">
          {ALL_GIFTS_AT.map((g) => {
            const earned = g.milestone === 3000
              ? (earnedIds.has('golden-words') && gifts.find((x) => x.id === 'golden-words')?.qty === 2)
              : earnedIds.has(g.id)
            const matchedGift = gifts.find((x) => x.id === g.id) ?? { id: g.id, name: g.name, qty: g.qty }
            return (
              <GiftBadge key={`${g.id}-${g.milestone}`} gift={matchedGift} earned={!!earned} />
            )
          })}
        </div>
      </div>

      {/* Identity-based gifts */}
      {gifts.some((g) => g.id === 'light-stick') && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            活動贈品
          </p>
          <GiftBadge
            gift={{ id: 'light-stick', name: '應援手燈' }}
            earned={true}
          />
        </div>
      )}
    </div>
  )
}
