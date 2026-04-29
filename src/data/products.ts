export type PricingRule =
  | { type: 'fixed'; price: number }
  | { type: 'bulk'; normalPrice: number; discountPrice: number; minQty: number }

export type Variant = {
  id: string
  name: string
  image?: string
}

export type Addon = {
  id: string
  name: string
  price: number
}

export type Category = {
  id: string
  name: string
  description?: string
  pricing: PricingRule
  variants: Variant[]
  addon?: Addon
}

export type CartItem = {
  categoryId: string
  variantId: string
  qty: number
}

const v = (suffix: string, names: string[], images?: string[]): Variant[] => {
  if (images && images.length !== names.length) {
    console.error(`products: v('${suffix}') images.length ${images.length} !== names.length ${names.length}`)
  }
  return names.map((name, i) => ({
    id: `${suffix}-${String.fromCharCode(97 + i)}`,
    name,
    image: images?.[i],
  }))
}

export const CATEGORIES: Category[] = [
  {
    id: 'embroidery-patch',
    name: '刺繡布貼',
    pricing: { type: 'fixed', price: 170 },
    variants: v(
      'embroidery',
      ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F'],
      [
        '/images/刺繡布貼-款式 A.png',
        '/images/刺繡布貼-款式 B.png',
        '/images/刺繡布貼-款式 C.png',
        '/images/刺繡布貼-款式 D.png',
        '/images/刺繡布貼-款式 E.png',
        '/images/刺繡布貼-款式 F.png',
      ],
    ),
  },
  {
    id: 'gym-stamp',
    name: '重訓印章',
    pricing: { type: 'fixed', price: 150 },
    variants: v(
      'stamp',
      ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F'],
      [
        '/images/重訓印章-款式 A.png',
        '/images/重訓印章-款式 B.png',
        '/images/重訓印章-款式 C.png',
        '/images/重訓印章-款式 D.png',
        '/images/重訓印章-款式 E.png',
        '/images/重訓印章-款式 F.png',
      ],
    ),
  },
  {
    id: 'sticker-book',
    name: '貼紙簿',
    description: '每本附贈一頁共兩面的隨選貼',
    pricing: { type: 'fixed', price: 180 },
    variants: v(
      'sticker-book',
      ['款式 A', '款式 B'],
      ['/images/貼紙簿-款式 A.jpg', '/images/貼紙簿-款式 B.jpg'],
    ),
    addon: { id: 'sticker-book-addon', name: '加購多一面隨選貼', price: 30 },
  },
  {
    id: 'collab-house',
    name: '聯名貼紙房子',
    pricing: { type: 'bulk', normalPrice: 230, discountPrice: 200, minQty: 4 },
    variants: v(
      'house',
      ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F', '款式 G', '款式 H', '款式 I'],
      [
        '/images/聯名貼紙房子-款式 A.jpg',
        '/images/聯名貼紙房子-款式 B.jpg',
        '/images/聯名貼紙房子-款式 C.jpg',
        '/images/聯名貼紙房子-款式 D.jpg',
        '/images/聯名貼紙房子-款式 E.jpg',
        '/images/聯名貼紙房子-款式 F.jpg',
        '/images/聯名貼紙房子-款式 G.jpg',
        '/images/聯名貼紙房子-款式 H.jpg',
        '/images/聯名貼紙房子-款式 I.jpg',
      ],
    ),
  },
  {
    id: 'memo-set',
    name: 'MEMO 紙套組',
    pricing: { type: 'fixed', price: 200 },
    variants: v('memo', ['全一款'], ['/images/MEMO 紙套組.jpg']),
  },
  {
    id: 'die-cut-roll',
    name: '造型割型貼紙捲',
    pricing: { type: 'fixed', price: 360 },
    variants: v('roll', ['全一款'], ['/images/造型割型貼紙捲.jpg']),
  },
  {
    id: 'magnet-badge',
    name: '磁鐵徽章',
    pricing: { type: 'fixed', price: 260 },
    variants: v(
      'magnet',
      ['款式 A', '款式 B'],
      ['/images/磁鐵徽章-款式 A.jpg', '/images/磁鐵徽章-款式 B.jpg'],
    ),
  },
  {
    id: 'sticker-stand',
    name: '可撕式貼紙架',
    pricing: { type: 'fixed', price: 260 },
    variants: v('stand', ['全一款'], ['/images/可撕式貼紙架.jpg']),
  },
  {
    id: 'direction-sticker',
    name: '奇的方向貼紙',
    pricing: { type: 'fixed', price: 100 },
    variants: v('direction', ['全一款'], ['/images/奇的方向貼紙.jpg']),
  },
  {
    id: 'hand-towel',
    name: '擦手巾',
    pricing: { type: 'fixed', price: 390 },
    variants: v('towel', ['全一款'], ['/images/擦手巾.jpg']),
  },
  {
    id: 'carbon-copy',
    name: '複寫本',
    pricing: { type: 'fixed', price: 200 },
    variants: v('carbon', ['全一款']),
  },
  {
    id: 'fortune-slip',
    name: '花朵運勢籤',
    pricing: { type: 'bulk', normalPrice: 40, discountPrice: 30, minQty: 4 },
    variants: v('fortune', ['款式 A', '款式 B', '款式 C', '款式 D', '款式 E', '款式 F']),
  },
]
