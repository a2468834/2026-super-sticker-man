import { CATEGORIES } from '@/data/products'
import type { CartItem } from '@/data/products'

export type Gift = {
  id: string
  name: string
  qty?: number
  note?: string
}

export type LineItem = {
  categoryId: string
  variantId: string
  categoryName: string
  variantName: string
  unitPrice: number
  qty: number
  subtotal: number
  isAddon: boolean
}

export const GIFT_MILESTONES = [1500, 2000, 2500, 3000] as const

function isAddonItem(categoryId: string, variantId: string): boolean {
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  return cat?.addon?.id === variantId
}

// Pre-compute total non-addon qty per bulk category in one pass — O(N).
function computeBulkTotals(items: CartItem[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const item of items) {
    const cat = CATEGORIES.find((c) => c.id === item.categoryId)
    if (!cat || cat.pricing.type !== 'bulk') continue
    if (isAddonItem(item.categoryId, item.variantId)) continue
    totals.set(item.categoryId, (totals.get(item.categoryId) ?? 0) + item.qty)
  }
  return totals
}

// Private resolver that accepts pre-computed bulk totals to avoid O(N²).
function resolveUnitPrice(item: CartItem, bulkTotals: Map<string, number>): number {
  const cat = CATEGORIES.find((c) => c.id === item.categoryId)
  if (!cat) return 0

  if (isAddonItem(item.categoryId, item.variantId)) {
    return cat.addon!.price
  }

  if (cat.pricing.type === 'fixed') {
    return cat.pricing.price
  }

  const totalQty = bulkTotals.get(item.categoryId) ?? 0
  return totalQty >= cat.pricing.minQty ? cat.pricing.discountPrice : cat.pricing.normalPrice
}

export function calcCartTotal(items: CartItem[]): number {
  const bulkTotals = computeBulkTotals(items)
  return items.reduce((sum, item) => sum + resolveUnitPrice(item, bulkTotals) * item.qty, 0)
}

export function buildLineItems(items: CartItem[]): LineItem[] {
  const bulkTotals = computeBulkTotals(items)
  return items.flatMap((item) => {
    const cat = CATEGORIES.find((c) => c.id === item.categoryId)
    if (!cat) return []
    const isAddon = isAddonItem(item.categoryId, item.variantId)
    const variantName = isAddon
      ? (cat.addon?.name ?? item.variantId)
      : (cat.variants.find((v) => v.id === item.variantId)?.name ?? item.variantId)
    const unitPrice = resolveUnitPrice(item, bulkTotals)
    return [{
      categoryId: item.categoryId,
      variantId: item.variantId,
      categoryName: cat.name,
      variantName,
      unitPrice,
      qty: item.qty,
      subtotal: unitPrice * item.qty,
      isAddon,
    }]
  })
}

export function getEarnedGifts(
  total: number,
  hasReservation: boolean,
  isMember: boolean,
): Gift[] {
  const gifts: Gift[] = []

  if (hasReservation) {
    gifts.push({ id: 'light-stick', name: '應援手燈' })
  }

  if (total >= 1500) {
    const qty = Math.min(Math.floor(total / 1500), 2)
    gifts.push({ id: 'golden-words', name: '金玉良言貼紙', qty })
  }

  if (total >= 2000) {
    const note = isMember
      ? '隨機附贈兩款照片背景卡之一＋不良製作委員會專屬加贈卡一張'
      : '隨機附贈兩款照片背景卡之一'
    gifts.push({ id: 'idol-card', name: 'IDOL卡套', note })
  }

  if (total >= 2500) {
    gifts.push({ id: 'notebook-set', name: '白手帳套組' })
  }

  return gifts
}
