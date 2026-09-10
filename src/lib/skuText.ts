import { CATEGORIES, findCategory, findOption, maxQtyFor } from '@/data/products'
import type { CartItem } from '@/data/products'

/**
 * A cart encoded as one line of text: `SKU-001-0007*4 SKU-002-0001*2`.
 *
 * This is the bridge that makes split results usable — each proposed order is
 * printed as one of these, and pasting it into a fresh tab rebuilds that order
 * in the normal cart UI, reusing every existing component.
 */

const SKU_TO_CATEGORY = new Map<string, string>(
  CATEGORIES.flatMap((c) => [
    ...c.variants.map((v) => [v.sku, c.id] as [string, string]),
    ...(c.options ?? []).map((o) => [o.sku, c.id] as [string, string]),
  ]),
)

// Blind-draw lineup entries exist only to be looked at; they never sell.
const SELLABLE_SKUS = new Set<string>(
  CATEGORIES.flatMap((c) => [
    ...(c.selectable === false ? [] : c.variants.map((v) => v.sku)),
    ...(c.options ?? []).map((o) => o.sku),
  ]),
)

export function formatSkuText(items: CartItem[]): string {
  return items
    .slice()
    .sort((a, b) => a.variantId.localeCompare(b.variantId))
    .map((i) => (i.qty > 1 ? `${i.variantId}*${i.qty}` : i.variantId))
    .join(' ')
}

export type ParsedSkuText = {
  items: CartItem[]
  errors: string[]
  notes: string[]
}

// Accepts `*`, `x`, `X` or `×` as the multiplier and any mix of spaces,
// commas, semicolons and newlines as separators, so a pasted plan or a
// hand-typed list both work.
const TOKEN_PATTERN = /^(SKU-\d{3}-\d{4})(?:[*xX×](\d+))?$/

export function parseSkuText(text: string): ParsedSkuText {
  const errors: string[] = []
  const notes: string[] = []
  const merged = new Map<string, CartItem>()

  const tokens = text
    .replace(/[，、]/g, ',')
    // Pull the multiplier back onto its SKU before splitting, so `SKU-… x2`
    // survives the tokeniser the same way `SKU-…*2` does.
    .replace(/\s*([*xX×])\s*/g, '$1')
    .split(/[\s,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)

  for (const token of tokens) {
    const match = TOKEN_PATTERN.exec(token)
    if (!match) {
      errors.push(`無法解析：${token}`)
      continue
    }

    const sku = match[1]
    const categoryId = SKU_TO_CATEGORY.get(sku)
    if (!categoryId) {
      errors.push(`查無此 SKU：${sku}`)
      continue
    }
    if (!SELLABLE_SKUS.has(sku)) {
      errors.push(`${sku} 是盲抽陣容展示款，無法直接購買`)
      continue
    }

    const qty = match[2] ? parseInt(match[2], 10) : 1
    if (qty <= 0) {
      errors.push(`${sku} 數量必須大於 0`)
      continue
    }

    const existing = merged.get(sku)
    if (existing) existing.qty += qty
    else merged.set(sku, { categoryId, variantId: sku, qty })
  }

  // Per-person caps are a real-world limit, not a per-order one — a pasted
  // plan must not be able to slip past them.
  for (const item of merged.values()) {
    const cap = maxQtyFor(item.categoryId, item.variantId)
    if (cap != null && item.qty > cap) {
      notes.push(`${item.variantId} 每人限購 ${cap}，已從 ${item.qty} 調整`)
      item.qty = cap
    }
  }

  // Drop add-on options whose base item is missing, mirroring the cart rules.
  for (const item of [...merged.values()]) {
    const option = findOption(findCategory(item.categoryId), item.variantId)
    if (!option?.requiresBase) continue
    const hasBase = [...merged.values()].some(
      (other) =>
        other.categoryId === item.categoryId &&
        other.variantId !== item.variantId &&
        other.qty > 0,
    )
    if (!hasBase) {
      notes.push(`${item.variantId} 需先加入同類主商品，已略過`)
      merged.delete(item.variantId)
    }
  }

  return { items: [...merged.values()], errors, notes }
}
