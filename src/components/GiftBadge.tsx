import Image from 'next/image'
import type { Gift } from '@/lib/pricing'

interface Props {
  gift: Gift
  earned: boolean
}

export default function GiftBadge({ gift, earned }: Props) {
  return (
    <div
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
        earned ? 'bg-green-50 text-green-800' : 'bg-gray-100 text-gray-400'
      }`}
    >
      <span className="mt-0.5 font-bold">{earned ? '✓' : '○'}</span>
      {gift.image && (
        <div
          className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-white transition-all ${
            earned ? '' : 'opacity-50 grayscale'
          }`}
        >
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${gift.image}`}
            alt={gift.name}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      )}
      <div className="min-w-0">
        <p className="font-medium">
          {gift.name}
          {gift.qty && gift.qty > 1 ? (
            <span className="ml-1 font-bold">×{gift.qty}</span>
          ) : null}
        </p>
        {gift.note && earned && (
          <p className="mt-0.5 text-xs leading-snug text-green-700">{gift.note}</p>
        )}
      </div>
    </div>
  )
}
