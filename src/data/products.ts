export type PricingRule =
  | { type: 'fixed'; price: number }
  | { type: 'bulk'; normalPrice: number; discountPrice: number; minQty: number }

export type Variant = {
  id: string
  name: string
}

export type Addon = {
  id: string
  name: string
  price: number
}

export type Category = {
  id: string
  name: string
  pricing: PricingRule
  variants: Variant[]
  addon?: Addon
}

export type CartItem = {
  categoryId: string
  variantId: string
  qty: number
}

const v = (suffix: string, names: string[]): Variant[] =>
  names.map((name, i) => ({ id: `${suffix}-${String.fromCharCode(97 + i)}`, name }))

export const CATEGORIES: Category[] = [
  {
    id: 'embroidery-patch',
    name: '刺繡布貼',
    pricing: { type: 'fixed', price: 170 },
    variants: v('embroidery', ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F']),
  },
  {
    id: 'gym-stamp',
    name: '重訓印章',
    pricing: { type: 'fixed', price: 150 },
    variants: v('stamp', ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F']),
  },
  {
    id: 'sticker-book',
    name: '貼紙簿',
    pricing: { type: 'fixed', price: 180 },
    variants: v('sticker-book', ['款式 A', '款式 B']),
    addon: { id: 'sticker-book-addon', name: '加價購附件', price: 30 },
  },
  {
    id: 'collab-house',
    name: '聯名貼紙房子',
    pricing: { type: 'bulk', normalPrice: 230, discountPrice: 200, minQty: 4 },
    variants: v('house', ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F', '款式 G', '款式 H', '款式 I']),
  },
  {
    id: 'memo-set',
    name: 'MEMO 紙套組',
    pricing: { type: 'fixed', price: 200 },
    variants: v('memo', ['款式 A']),
  },
  {
    id: 'die-cut-roll',
    name: '造型割型貼紙捲',
    pricing: { type: 'fixed', price: 360 },
    variants: v('roll', ['款式 A']),
  },
  {
    id: 'magnet-badge',
    name: '磁鐵徽章',
    pricing: { type: 'fixed', price: 260 },
    variants: v('magnet', ['款式 A', '款式 B']),
  },
  {
    id: 'sticker-stand',
    name: '可撕式貼紙架',
    pricing: { type: 'fixed', price: 260 },
    variants: v('stand', ['款式 A']),
  },
  {
    id: 'direction-sticker',
    name: '奇的方向貼紙',
    pricing: { type: 'fixed', price: 100 },
    variants: v('direction', ['款式 A']),
  },
  {
    id: 'hand-towel',
    name: '擦手巾',
    pricing: { type: 'fixed', price: 390 },
    variants: v('towel', ['款式 A']),
  },
  {
    id: 'carbon-copy',
    name: '複寫本',
    pricing: { type: 'fixed', price: 200 },
    variants: v('carbon', ['款式 A']),
  },
  {
    id: 'fortune-slip',
    name: '花朵運勢籤',
    pricing: { type: 'bulk', normalPrice: 40, discountPrice: 30, minQty: 4 },
    variants: v('fortune', ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F']),
  },
]
