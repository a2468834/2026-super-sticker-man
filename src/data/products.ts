export type PricingRule =
  | { type: 'fixed'; price: number }
  | { type: 'bulk'; normalPrice: number; discountPrice: number; minQty: number }

export type Variant = {
  sku: string
  name: string
  image?: string
}

export type Addon = {
  sku: string
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

const v = (suffix: string, names: string[], images: string[] | undefined, skus: string[]): Variant[] => {
  if (images && images.length !== names.length) {
    console.error(`products: v('${suffix}') images.length ${images.length} !== names.length ${names.length}`)
  }
  return names.map((name, i) => ({
    sku: skus[i],
    name,
    image: images?.[i],
  }))
}

export const CATEGORIES: Category[] = [
  {
    id: 'embroidery-patch',
    name: '刺繡布貼（含背膠） — 抽選',
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
      ['SKU-001-0001', 'SKU-001-0002', 'SKU-001-0003', 'SKU-001-0004', 'SKU-001-0005', 'SKU-001-0006'],
    ),
  },
  {
    id: 'gym-stamp',
    name: '重訓印章 — 抽選 ∕ 全套',
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
      ['SKU-002-0001', 'SKU-002-0002', 'SKU-002-0003', 'SKU-002-0004', 'SKU-002-0005', 'SKU-002-0006'],
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
      ['SKU-003-0001', 'SKU-003-0002'],
    ),
    addon: { sku: 'SKU-003-0003', name: '加價購 — 單面隨選貼', price: 30 },
  },
  {
    id: 'collab-house',
    name: '愛貼 99 聯名貼紙包',
    pricing: { type: 'bulk', normalPrice: 230, discountPrice: 200, minQty: 4 },
    variants: v(
      'house',
      ['什物 a kind of café', '茄子先生', '寫情書的人', 'Emily Liu', 'OURS 森林好朋友', '小虎 day', '仰角 35 度', '包大山', '（超厲害的）S'],
      [
        '/images/愛貼 99 聯名貼紙包-什物 a kind of café.jpg',
        '/images/愛貼 99 聯名貼紙包-茄子先生.jpg',
        '/images/愛貼 99 聯名貼紙包-寫情書的人.jpg',
        '/images/愛貼 99 聯名貼紙包-Emily Liu.jpg',
        '/images/愛貼 99 聯名貼紙包-OURS 森林好朋友.jpg',
        '/images/愛貼 99 聯名貼紙包-小虎 day.jpg',
        '/images/愛貼 99 聯名貼紙包-仰角 35 度.jpg',
        '/images/愛貼 99 聯名貼紙包-包大山.jpg',
        '/images/愛貼 99 聯名貼紙包-S.jpg',
      ],
      ['SKU-004-0001', 'SKU-004-0002', 'SKU-004-0003', 'SKU-004-0004', 'SKU-004-0005', 'SKU-004-0006', 'SKU-004-0007', 'SKU-004-0008', 'SKU-004-0009'],
    ),
  },
  {
    id: 'memo-set',
    name: 'MEMO 紙套組',
    pricing: { type: 'fixed', price: 200 },
    variants: v('memo', ['全一款'], ['/images/MEMO 紙套組.jpg'], ['SKU-005-0001']),
  },
  {
    id: 'die-cut-roll',
    name: '造型割型貼紙捲',
    pricing: { type: 'fixed', price: 360 },
    variants: v('roll', ['全一款'], ['/images/造型割型貼紙捲.jpg'], ['SKU-006-0001']),
  },
  {
    id: 'magnet-badge',
    name: '磁鐵徽章',
    pricing: { type: 'fixed', price: 260 },
    variants: v(
      'magnet',
      ['款式 A', '款式 B'],
      ['/images/磁鐵徽章-款式 A.jpg', '/images/磁鐵徽章-款式 B.jpg'],
      ['SKU-007-0001', 'SKU-007-0002'],
    ),
  },
  {
    id: 'sticker-stand',
    name: '可撕式貼紙架',
    pricing: { type: 'fixed', price: 260 },
    variants: v('stand', ['全一款'], ['/images/可撕式貼紙架.jpg'], ['SKU-008-0001']),
  },
  {
    id: 'direction-sticker',
    name: '奇的方向貼紙',
    pricing: { type: 'fixed', price: 100 },
    variants: v('direction', ['全一款'], ['/images/奇的方向貼紙.jpg'], ['SKU-009-0001']),
  },
  {
    id: 'hand-towel',
    name: '擦手巾',
    pricing: { type: 'fixed', price: 390 },
    variants: v('towel', ['全一款'], ['/images/擦手巾.jpg'], ['SKU-010-0001']),
  },
  {
    id: 'carbon-copy',
    name: '複寫本',
    pricing: { type: 'fixed', price: 200 },
    variants: v('carbon', ['全一款'], ['/images/複寫本.jpg'], ['SKU-011-0001']),
  },
  {
    id: 'fortune-slip',
    name: '花朵運勢籤（貼紙） — 抽選',
    pricing: { type: 'bulk', normalPrice: 40, discountPrice: 30, minQty: 4 },
    variants: v(
      'fortune',
      ['成果の花', '恋の花', '旅行の花', '元気の花', '幸運の花', '金運の花'],
      [
        '/images/花朵運勢籤-款式 A.jpg',
        '/images/花朵運勢籤-款式 B.jpg',
        '/images/花朵運勢籤-款式 C.jpg',
        '/images/花朵運勢籤-款式 D.jpg',
        '/images/花朵運勢籤-款式 E.jpg',
        '/images/花朵運勢籤-款式 F.jpg',
      ],
      ['SKU-012-0001', 'SKU-012-0002', 'SKU-012-0003', 'SKU-012-0004', 'SKU-012-0005', 'SKU-012-0006'],
    ),
  },
]
