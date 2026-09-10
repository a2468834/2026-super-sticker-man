'use client'

import Image from 'next/image'

interface Props {
  variantName: string
  image?: string
  unitPrice?: number
  // Original price, shown struck through when unitPrice is a discount.
  normalPrice?: number
  cartQty?: number
  maxQty?: number
  // 盲抽 lineup: show the artwork only, buying happens through the option rows.
  displayOnly?: boolean
  onAdd?: () => void
}

export default function ProductCard({
  variantName,
  image,
  unitPrice,
  normalPrice,
  cartQty = 0,
  maxQty,
  displayOnly = false,
  onAdd,
}: Props) {
  const inCart = !displayOnly && cartQty > 0
  const discounted = normalPrice != null && unitPrice != null && unitPrice < normalPrice
  const atCap = maxQty != null && cartQty >= maxQty

  return (
    <div className={`flex flex-col rounded-xl border shadow-sm overflow-hidden transition-colors duration-300 ${inCart ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200 bg-white'}`}>
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

        {!displayOnly && (
          <>
            {/* Price + in-cart indicator on the same line */}
            <div className="flex items-baseline justify-between gap-1.5">
              <div className="flex items-baseline gap-1.5">
                <span className={`text-sm font-bold ${discounted ? 'text-red-600' : 'text-gray-900'}`}>
                  NT$ {unitPrice}
                </span>
                {discounted && (
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
              disabled={atCap}
              className="mt-1 w-full rounded-lg bg-gray-900 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {atCap ? `已達限購 ${maxQty} 件` : '加入購物車'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
