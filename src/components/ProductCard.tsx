'use client'

import Image from 'next/image'

interface Props {
  categoryId: string
  variantId: string
  variantName: string
  image?: string
  unitPrice: number
  normalPrice?: number
  cartQty: number
  onAdd: () => void
}

export default function ProductCard({
  variantName,
  image,
  unitPrice,
  normalPrice,
  cartQty,
  onAdd,
}: Props) {
  const isDiscounted = normalPrice != null && unitPrice < normalPrice

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Product image */}
      <div className="relative aspect-square w-full bg-gray-100">
        {image ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${image}`}
            alt={variantName}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <a
            href="https://www.instagram.com/donot_like_sunday/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-full w-full items-center justify-center"
          >
            <span className="text-xs text-gray-400">{variantName}</span>
          </a>
        )}
      </div>

      <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-medium text-gray-800 truncate">{variantName}</p>

        {/* Price + in-cart indicator on the same line */}
        <div className="flex items-baseline justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className={`text-sm font-bold ${isDiscounted ? 'text-red-600' : 'text-gray-900'}`}>
              NT$ {unitPrice}
            </span>
            {isDiscounted && (
              <span className="text-xs text-gray-400 line-through">NT$ {normalPrice}</span>
            )}
          </div>
          {cartQty > 0 && (
            <span className="shrink-0 text-xs text-gray-400">已加入 {cartQty} 件</span>
          )}
        </div>

        {/* Cart control */}
        <button
          onClick={onAdd}
          className="mt-1 w-full rounded-lg bg-gray-900 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
        >
          加入購物車
        </button>
      </div>
    </div>
  )
}
