import { findCategory, findOption } from '@/data/products'
import type { CartItem } from '@/data/products'

export type Gift = {
  id: string
  name: string
  qty?: number
  note?: string
  image?: string
}

export type LineItem = {
  categoryId: string
  variantId: string
  categoryName: string
  variantName: string
  unitPrice: number
  qty: number
  subtotal: number
  kind: 'product' | 'option' | 'discount'
}

export const GIFT_MILESTONES = [1200, 2000, 3200] as const

// 盲抽扭蛋印章 — the 特典貼紙 tier depends on how many stamps the cart holds.
const STAMP_SINGLE_SKU = 'SKU-001-0007'
const STAMP_SET_SKU = 'SKU-001-0008'
const STAMP_SET_COUNT = 6

// Cross-category bundles, priced below the sum of their parts.
const MAT_SKU = 'SKU-009-0001'
const BAG_SKU = 'SKU-011-0001'

const BUNDLES = [
  {
    id: 'bundle-mat-bag',
    label: '套組優惠',
    detail: '任務號地墊 ＋ 購物袋',
    skus: [MAT_SKU, BAG_SKU],
    price: 900,
  },
]

function qtyOfSku(items: CartItem[], sku: string): number {
  return items.reduce((s, i) => (i.variantId === sku ? s + i.qty : s), 0)
}

function resolveUnitPrice(item: CartItem, items: CartItem[]): number {
  const cat = findCategory(item.categoryId)
  if (!cat) return 0

  const option = findOption(cat, item.variantId)
  if (option) return option.price

  if (!cat.pricing) return 0
  if (cat.pricing.type === 'fixed') return cat.pricing.price

  // companion: discounted as long as the cart carries something from elsewhere.
  const hasCompanion = items.some((i) => i.categoryId !== item.categoryId && i.qty > 0)
  return hasCompanion ? cat.pricing.companionPrice : cat.pricing.soloPrice
}

export function buildLineItems(items: CartItem[]): LineItem[] {
  const lines = items
    .flatMap((item): LineItem[] => {
      const cat = findCategory(item.categoryId)
      if (!cat) return []
      const option = findOption(cat, item.variantId)
      const variantName = option
        ? option.name
        : (cat.variants.find((v) => v.sku === item.variantId)?.name ?? item.variantId)
      const unitPrice = resolveUnitPrice(item, items)
      return [{
        categoryId: item.categoryId,
        variantId: item.variantId,
        categoryName: cat.name,
        variantName,
        unitPrice,
        qty: item.qty,
        subtotal: unitPrice * item.qty,
        kind: option ? 'option' : 'product',
      }]
    })
    .sort((a, b) => a.variantId.localeCompare(b.variantId))

  // Bundle savings ride along as their own negative lines, so every product
  // keeps its own honest unit price in the cart.
  const priceBySku = new Map(lines.map((l) => [l.variantId, l.unitPrice]))
  for (const bundle of BUNDLES) {
    const pairs = Math.min(...bundle.skus.map((sku) => qtyOfSku(items, sku)))
    if (pairs <= 0) continue
    const partsTotal = bundle.skus.reduce((s, sku) => s + (priceBySku.get(sku) ?? 0), 0)
    const saving = partsTotal - bundle.price
    if (saving <= 0) continue
    lines.push({
      categoryId: bundle.id,
      variantId: bundle.id,
      categoryName: bundle.label,
      variantName: bundle.detail,
      unitPrice: -saving,
      qty: pairs,
      subtotal: -saving * pairs,
      kind: 'discount',
    })
  }

  return lines
}

export type GiftFlags = {
  knowsTicket: boolean
  knowsQueueGift: boolean
}

export function getEarnedGifts(total: number, flags: GiftFlags, items: CartItem[]): Gift[] {
  const gifts: Gift[] = []

  if (flags.knowsQueueGift) {
    gifts.push({ id: 'ribbon', name: '銀色刺繡絲帶', note: '排隊禮，記得先領' })
  }

  const stampQty =
    qtyOfSku(items, STAMP_SINGLE_SKU) + qtyOfSku(items, STAMP_SET_SKU) * STAMP_SET_COUNT
  if (stampQty > 0) {
    const qty = stampQty > 3 ? 2 : 1
    gifts.push({
      id: 'bonus-sticker',
      name: '特典貼紙',
      qty,
      note: `盲抽扭蛋印章 ${stampQty} 顆`,
      image: qty === 2 ? '/images/特典貼紙x2.png' : '/images/特典貼紙x1.png',
    })
  }

  if (total >= 1200) {
    gifts.push({ id: 'flight-permit', name: '飛行許可證＋紀念章', image: '/images/飛行許可證.png' })
  }

  if (total >= 2000) {
    gifts.push({ id: 'ufo-file', name: '不明飛行物 file', image: '/images/不明飛行物 file.png' })
  }

  if (total >= 3200) {
    gifts.push({ id: 'mission-mug', name: '任務杯', image: '/images/任務杯.jpg' })
  }

  return gifts
}
