export type PricingRule =
  | { type: 'fixed'; price: number }
  // 搭配任意其他類別的品項時降價（購物袋）
  | { type: 'companion'; soloPrice: number; companionPrice: number }

export type Variant = {
  sku: string
  name: string
  image?: string
  maxQty?: number
}

// A purchasable row rendered below the variant grid — carries both the
// 加價購 rows and the 盲抽 (blind-draw) buy options.
export type Option = {
  sku: string
  name: string
  price: number
  maxQty?: number
  // Requires at least one non-option item from the same category in the cart.
  requiresBase?: boolean
  note?: string
}

export type Category = {
  id: string
  name: string
  description?: string
  // Undefined for 盲抽 categories — their prices live entirely on `options`.
  pricing?: PricingRule
  // false = 盲抽; variant cards become a display-only lineup.
  selectable?: boolean
  // One shared photo standing in for the whole lineup.
  lineupImage?: string
  variants: Variant[]
  options?: Option[]
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
    id: 'blind-stamp',
    name: '扭蛋印章：LOVE MISSION 999',
    description: '買 1~3 顆贈特典貼紙 ×1，超過 3 顆贈特典貼紙 ×2',
    selectable: false,
    variants: v(
      'stamp',
      ['LOVE MAIL', 'LOVE YOU', 'LOVE RAIN', 'LOVE BLOOM', 'LOVE BABE', '隱藏款'],
      [
        '/images/印章A.png',
        '/images/印章B.png',
        '/images/印章C.png',
        '/images/印章D.png',
        '/images/印章E.png',
        '/images/印章F.png',
      ],
      ['SKU-001-0001', 'SKU-001-0002', 'SKU-001-0003', 'SKU-001-0004', 'SKU-001-0005', 'SKU-001-0006'],
    ),
    options: [
      { sku: 'SKU-001-0007', name: '盲抽一顆', price: 150 },
      { sku: 'SKU-001-0008', name: '包套（六顆一組）', price: 900, maxQty: 1, note: '每人限購 1 套' },
    ],
  },
  {
    id: 'riso-postcard',
    name: 'RISO 明信片',
    pricing: { type: 'fixed', price: 60 },
    variants: v(
      'riso',
      ['等公車', '遊樂場', '吃蛋糕', '貓的世界旅行（公益款）'],
      [
        '/images/等公車.png',
        '/images/遊樂場.png',
        '/images/吃蛋糕.png',
        '/images/貓的世界旅行.png',
      ],
      ['SKU-002-0001', 'SKU-002-0002', 'SKU-002-0003', 'SKU-002-0004'],
    ),
  },
  {
    id: 'blind-magnet',
    name: '厚紙磁鐵',
    selectable: false,
    variants: v(
      'magnet',
      ['MOUNTAIN TROUBLE', 'SILENT BEACON', 'THE MISSING BOOK', 'MISSING TASTE', 'STARSTONE'],
      [
        '/images/MOUNTAIN TROUBLE.png',
        '/images/SILENT BEACON.png',
        '/images/THE MISSING BOOK.png',
        '/images/MISSING TASTE.png',
        '/images/STARSTONE.png',
      ],
      ['SKU-003-0001', 'SKU-003-0002', 'SKU-003-0003', 'SKU-003-0004', 'SKU-003-0005'],
    ),
    options: [{ sku: 'SKU-003-0006', name: '盲抽一款', price: 130 }],
  },
  {
    id: 'flight-book',
    name: '宇宙飛行本 A6 尺寸',
    pricing: { type: 'fixed', price: 220 },
    variants: v(
      'flightbook',
      ['藍色款', '黑色款'],
      ['/images/宇宙飛行本-藍.png', '/images/宇宙飛行本-黑.png'],
      ['SKU-004-0001', 'SKU-004-0002'],
    ),
  },
  {
    id: 'white-ink-sticker',
    name: '白墨貼紙 with 銀箔背卡',
    pricing: { type: 'fixed', price: 90 },
    variants: v('whiteink', ['全一款'], ['/images/白墨貼紙.png'], ['SKU-005-0001']),
  },
  {
    id: 'press-folder',
    name: '報夾組 The Missing Times',
    description: 'A6 板夾 + 40 頁便條本',
    pricing: { type: 'fixed', price: 420 },
    variants: v('folder', ['全一款'], ['/images/報夾組.png'], ['SKU-006-0001']),
    options: [
      { sku: 'SKU-006-0002', name: '加購便條本', price: 100, requiresBase: true },
    ],
  },
  {
    id: 'blind-reflector',
    name: '反光片吊飾',
    selectable: false,
    lineupImage: '/images/反光片吊飾.png',
    variants: v(
      'reflector',
      // Ordered left-to-right as they appear in the lineup photo.
      ['MISS', 'FIND', 'SPARK', 'HEAL', 'KEEP'],
      undefined,
      ['SKU-007-0001', 'SKU-007-0002', 'SKU-007-0003', 'SKU-007-0004', 'SKU-007-0005'],
    ),
    options: [{ sku: 'SKU-007-0006', name: '盲抽一片', price: 100 }],
  },
  {
    id: 'frame-sticker',
    name: '框框框貼紙',
    pricing: { type: 'fixed', price: 90 },
    variants: v('frame', ['全一款'], ['/images/框框框貼紙.png'], ['SKU-008-0001']),
  },
  {
    id: 'mission-mat',
    name: '任務號地墊',
    pricing: { type: 'fixed', price: 560 },
    variants: [
      { sku: 'SKU-009-0001', name: '全一款', image: '/images/任務號地墊.jpg', maxQty: 2 },
    ],
  },
  {
    id: 'secret-file',
    name: '機密檔案',
    description: 'A7 檔案本 + 便條紙 30 張 + 星球紙 8 張 + 迴紋針 2 枚',
    pricing: { type: 'fixed', price: 380 },
    variants: v('secretfile', ['全一款'], ['/images/機密檔案.png'], ['SKU-010-0001']),
  },
  {
    id: 'tote-bag',
    name: '購物袋',
    description: '搭配任意品項享加價購 NT$ 390；與任務號地墊同買享套組價 NT$ 900',
    pricing: { type: 'companion', soloPrice: 450, companionPrice: 390 },
    variants: v('tote', ['全一款'], ['/images/購物袋.jpg'], ['SKU-011-0001']),
  },
  {
    id: 'pet-tape',
    name: '燙銀割型 PET 膠帶',
    pricing: { type: 'fixed', price: 410 },
    variants: v('pettape', ['全一款'], ['/images/燙銀割型 PET 膠帶.jpg'], ['SKU-012-0001']),
  },
  {
    id: 'luna-candle',
    name: 'LUNA 夜光蠟燭組',
    selectable: false,
    variants: v(
      'luna',
      ['一般款', '特別款'],
      ['/images/LUNA 夜光蠟燭-一般款.png', '/images/LUNA 夜光蠟燭-特別款.jpg'],
      ['SKU-013-0001', 'SKU-013-0002'],
    ),
    options: [
      { sku: 'SKU-013-0003', name: '盲抽一組', price: 760, maxQty: 3, note: '每人限購 3 組' },
    ],
  },
]

// Lookup helpers shared by pricing and the UI.
export function findCategory(categoryId: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === categoryId)
}

export function findOption(cat: Category | undefined, sku: string): Option | undefined {
  return cat?.options?.find((o) => o.sku === sku)
}

// Per-person purchase cap for a cart line, or undefined when uncapped.
export function maxQtyFor(categoryId: string, sku: string): number | undefined {
  const cat = findCategory(categoryId)
  if (!cat) return undefined
  return findOption(cat, sku)?.maxQty ?? cat.variants.find((v) => v.sku === sku)?.maxQty
}
