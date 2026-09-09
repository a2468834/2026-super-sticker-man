'use client'

import GiftBadge from './GiftBadge'
import type { Gift } from '@/lib/pricing'
import { GIFT_MILESTONES } from '@/lib/pricing'

interface Props {
  total: number
  gifts: Gift[]
}

const ALL_GIFTS_AT: { milestone: number; id: string; name: string; image?: string }[] = [
  { milestone: 1200, id: 'flight-permit', name: '飛行許可證＋紀念章', image: '/images/飛行許可證.png' },
  { milestone: 2000, id: 'ufo-file', name: '不明飛行物 file', image: '/images/不明飛行物 file.png' },
  { milestone: 3200, id: 'mission-mug', name: '任務杯', image: '/images/任務杯.jpg' },
]

const THRESHOLD_LABELS: Record<number, string> = Object.fromEntries(
  ALL_GIFTS_AT.map((g) => [g.milestone, `滿 ${g.milestone}｜${g.name}`]),
)

export default function CartSummary({ total, gifts }: Props) {
  const earnedIds = new Set(gifts.map((g) => g.id))

  // Progress bar: find next unmet milestone
  const milestones = [...GIFT_MILESTONES]
  const nextMilestone = milestones.find((m) => total < m)
  const prevMilestone = nextMilestone
    ? milestones[milestones.indexOf(nextMilestone) - 1] ?? 0
    : milestones[milestones.length - 1]
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
          {ALL_GIFTS_AT.map((g) => (
            <GiftBadge
              key={g.id}
              gift={{ id: g.id, name: g.name, image: g.image, note: gifts.find((x) => x.id === g.id)?.note }}
              earned={earnedIds.has(g.id)}
            />
          ))}
        </div>
      </div>

      {/* Activity gifts — anything not tied to a spending milestone */}
      {(() => {
        const milestoneIds = new Set(ALL_GIFTS_AT.map((g) => g.id))
        const activityGifts = gifts.filter((g) => !milestoneIds.has(g.id))
        if (activityGifts.length === 0) return null
        return (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              活動贈品
            </p>
            <div className="space-y-1.5">
              {activityGifts.map((g) => (
                <GiftBadge key={g.id} gift={g} earned={true} />
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
