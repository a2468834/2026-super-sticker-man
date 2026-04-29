'use client'

interface Props {
  categoryId: string
  variantId: string
  variantName: string
  unitPrice: number
  normalPrice?: number
  cartQty: number
  onAdd: () => void
  onUpdate: (qty: number) => void
}

export default function ProductCard({
  variantName,
  unitPrice,
  normalPrice,
  cartQty,
  onAdd,
  onUpdate,
}: Props) {
  const isDiscounted = normalPrice != null && unitPrice < normalPrice

  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Placeholder image */}
      <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
        <span className="text-xs text-gray-400">{variantName}</span>
      </div>

      <div className="flex flex-col gap-2 p-3">
        <p className="text-sm font-medium text-gray-800 truncate">{variantName}</p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5">
          <span className={`text-sm font-bold ${isDiscounted ? 'text-red-600' : 'text-gray-900'}`}>
            NT$ {unitPrice}
          </span>
          {isDiscounted && (
            <span className="text-xs text-gray-400 line-through">NT$ {normalPrice}</span>
          )}
        </div>

        {/* Cart control */}
        {cartQty === 0 ? (
          <button
            onClick={onAdd}
            className="mt-1 w-full rounded-lg bg-gray-900 py-1.5 text-xs font-semibold text-white hover:bg-gray-700 transition-colors"
          >
            加入購物車
          </button>
        ) : (
          <div className="mt-1 flex items-center justify-between rounded-lg border border-gray-300 px-2 py-1">
            <button
              onClick={() => onUpdate(cartQty - 1)}
              className="w-6 text-center text-base font-bold text-gray-600 hover:text-gray-900"
              aria-label="減少數量"
            >
              −
            </button>
            <span className="text-sm font-semibold text-gray-800">{cartQty}</span>
            <button
              onClick={() => onUpdate(cartQty + 1)}
              className="w-6 text-center text-base font-bold text-gray-600 hover:text-gray-900"
              aria-label="增加數量"
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
