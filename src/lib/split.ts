import { CATEGORIES, findCategory, findOption } from '@/data/products'
import type { CartItem } from '@/data/products'
import { buildLineItems, getEarnedGifts } from './pricing'
import type { Gift } from './pricing'

// Flag-driven gifts (排隊禮) do not depend on how the cart is partitioned, so
// they are left out of scoring — counting them would just reward more orders.
const NO_FLAGS = { knowsTicket: false, knowsQueueGift: false }

export type SplitOrder = {
  items: CartItem[]
  subtotal: number
  gifts: Gift[]
  giftCount: number
}

export type SplitPlan = {
  orders: SplitOrder[]
  giftCount: number
  totalCost: number
  // Extra orders each category is scattered across; 0 = every category kept whole.
  spread: number
}

/* ------------------------------------------------------------------ *
 * Order evaluation, memoised
 *
 * Splitting must never re-implement pricing: each candidate order is run
 * through the very same buildLineItems / getEarnedGifts the cart uses, so
 * companion pricing, the mat+bag bundle and the stamp bonus tier all stay
 * correct by construction. The cache turns the repeated re-scoring done by
 * local search into table lookups.
 * ------------------------------------------------------------------ */

type OrderValue = { subtotal: number; gifts: Gift[]; giftCount: number }

const orderCache = new Map<string, OrderValue>()

function orderKey(items: CartItem[]): string {
  return items
    .map((i) => `${i.variantId}:${i.qty}`)
    .sort()
    .join(',')
}

function evalOrder(items: CartItem[], key = orderKey(items)): OrderValue {
  const hit = orderCache.get(key)
  if (hit) return hit

  const subtotal = buildLineItems(items).reduce((s, l) => s + l.subtotal, 0)
  const gifts = getEarnedGifts(subtotal, NO_FLAGS, items)
  // A ×2 gift really is two things in hand, so quantity counts.
  const giftCount = gifts.reduce((s, g) => s + (g.qty ?? 1), 0)

  const value = { subtotal, gifts, giftCount }
  orderCache.set(key, value)
  return value
}

/* ------------------------------------------------------------------ *
 * Atoms
 * ------------------------------------------------------------------ */

type Atom = { categoryId: string; sku: string }

// Options that need a plain item from the same category in the same order.
const GATED_SKUS = new Set(
  CATEGORIES.flatMap((c) => (c.options ?? []).filter((o) => o.requiresBase).map((o) => o.sku)),
)

function toAtoms(cart: CartItem[]): Atom[] {
  return cart.flatMap((i) =>
    Array.from({ length: i.qty }, () => ({ categoryId: i.categoryId, sku: i.variantId })),
  )
}

function atomPrice(atom: Atom): number {
  const cat = findCategory(atom.categoryId)
  if (!cat) return 0
  const option = findOption(cat, atom.sku)
  if (option) return option.price
  if (!cat.pricing) return 0
  return cat.pricing.type === 'fixed' ? cat.pricing.price : cat.pricing.soloPrice
}

/* ------------------------------------------------------------------ *
 * Assignments
 * ------------------------------------------------------------------ */

function assignmentToOrders(atoms: Atom[], assign: number[], k: number): CartItem[][] {
  const buckets: Map<string, CartItem>[] = Array.from({ length: k }, () => new Map())
  atoms.forEach((atom, i) => {
    const bucket = buckets[assign[i]]
    const existing = bucket.get(atom.sku)
    if (existing) existing.qty += 1
    else bucket.set(atom.sku, { categoryId: atom.categoryId, variantId: atom.sku, qty: 1 })
  })
  return buckets.map((b) => [...b.values()])
}

// Move any gated option into an order that actually carries its base item.
function repair(atoms: Atom[], assign: number[], k: number): void {
  const hasBase = (order: number, category: string) =>
    atoms.some(
      (a, j) => assign[j] === order && a.categoryId === category && !GATED_SKUS.has(a.sku),
    )

  for (let i = 0; i < atoms.length; i++) {
    if (!GATED_SKUS.has(atoms[i].sku)) continue
    const category = atoms[i].categoryId
    if (hasBase(assign[i], category)) continue
    for (let order = 0; order < k; order++) {
      if (hasBase(order, category)) {
        assign[i] = order
        break
      }
    }
  }
}

// Order labels are arbitrary, so a partition is keyed by its sorted set of
// order signatures — local search revisits the same partition constantly.
const planCache = new Map<string, SplitPlan>()
const PLAN_CACHE_LIMIT = 200_000

function evaluate(atoms: Atom[], assign: number[], k: number): SplitPlan {
  const grouped = assignmentToOrders(atoms, assign, k).filter((g) => g.length > 0)
  const keys = grouped.map(orderKey)
  const signature = [...keys].sort().join('|')

  const cached = planCache.get(signature)
  if (cached) return cached

  const orders = grouped.map((items, idx) => {
    const { subtotal, gifts, giftCount } = evalOrder(items, keys[idx])
    return { items, subtotal, gifts, giftCount }
  })

  const categorySpread = new Map<string, Set<number>>()
  orders.forEach((order, idx) => {
    for (const item of order.items) {
      const seen = categorySpread.get(item.categoryId) ?? new Set<number>()
      seen.add(idx)
      categorySpread.set(item.categoryId, seen)
    }
  })
  let spread = 0
  for (const seen of categorySpread.values()) spread += seen.size - 1

  const plan: SplitPlan = {
    orders,
    giftCount: orders.reduce((s, o) => s + o.giftCount, 0),
    totalCost: orders.reduce((s, o) => s + o.subtotal, 0),
    spread,
  }

  if (planCache.size >= PLAN_CACHE_LIMIT) planCache.clear()
  planCache.set(signature, plan)
  return plan
}

// Lexicographic: gifts first, then money, then keeping categories together.
export function isBetter(a: SplitPlan, b: SplitPlan | null): boolean {
  if (!b) return true
  if (a.giftCount !== b.giftCount) return a.giftCount > b.giftCount
  if (a.totalCost !== b.totalCost) return a.totalCost < b.totalCost
  return a.spread < b.spread
}

/* ------------------------------------------------------------------ *
 * Search
 * ------------------------------------------------------------------ */

// Bin-covering greedy: NT$ 2,000 is the cheapest money-per-gift rung, so fill
// orders up to that mark before opening the next one.
const GREEDY_TARGET = 2000

function greedySeed(atoms: Atom[], k: number): number[] {
  const order = atoms
    .map((a, i) => ({ i, price: atomPrice(a) }))
    .sort((x, y) => y.price - x.price)
  const assign = new Array<number>(atoms.length).fill(0)
  const running = new Array<number>(k).fill(0)
  let current = 0
  for (const { i, price } of order) {
    if (running[current] >= GREEDY_TARGET && current < k - 1) current += 1
    assign[i] = current
    running[current] += price
  }
  return assign
}

function randomSeed(atoms: Atom[], k: number, rand: () => number): number[] {
  return atoms.map(() => Math.floor(rand() * k))
}

function hillClimb(atoms: Atom[], start: number[], k: number): { assign: number[]; plan: SplitPlan } {
  let assign = start.slice()
  repair(atoms, assign, k)
  let plan = evaluate(atoms, assign, k)

  let improving = true
  while (improving) {
    improving = false
    // Duplicate SKUs make most neighbours identical partitions; skipping the
    // repeats is exact, not an approximation. Reset after every accepted move,
    // because the signatures are relative to the current assignment.
    let tried = new Set<string>()

    // Relocate one atom.
    for (let i = 0; i < atoms.length && !improving; i++) {
      for (let target = 0; target < k; target++) {
        if (assign[i] === target) continue
        const shape = `m|${atoms[i].sku}|${assign[i]}|${target}`
        if (tried.has(shape)) continue
        tried.add(shape)

        const next = assign.slice()
        next[i] = target
        repair(atoms, next, k)
        const candidate = evaluate(atoms, next, k)
        if (isBetter(candidate, plan)) {
          assign = next
          plan = candidate
          improving = true
          break
        }
      }
    }
    if (improving) continue

    tried = new Set<string>()

    // Swap two atoms sitting in different orders. Swapping equal SKUs would
    // leave both orders unchanged.
    for (let i = 0; i < atoms.length && !improving; i++) {
      for (let j = i + 1; j < atoms.length; j++) {
        if (assign[i] === assign[j]) continue
        if (atoms[i].sku === atoms[j].sku) continue
        const shape = `s|${atoms[i].sku}|${assign[i]}|${atoms[j].sku}|${assign[j]}`
        if (tried.has(shape)) continue
        tried.add(shape)

        const next = assign.slice()
        next[i] = assign[j]
        next[j] = assign[i]
        repair(atoms, next, k)
        const candidate = evaluate(atoms, next, k)
        if (isBetter(candidate, plan)) {
          assign = next
          plan = candidate
          improving = true
          break
        }
      }
    }
  }

  return { assign, plan }
}

// Small deterministic PRNG so the same cart always yields the same plan.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type SplitResult = {
  // The whole cart as a single order — the thing a split has to beat.
  baseline: SplitPlan
  best: SplitPlan
  // Best plan found for each order count, indexed by orders.length.
  byOrderCount: SplitPlan[]
}

// One order per queue trip, so more than a handful stops being realistic —
// but note the cap cannot be derived from the cart total: the stamp bonus is
// earned by any order holding a stamp, however cheap, so orders under
// NT$ 1,200 can still carry gifts.
const DEFAULT_MAX_ORDERS = 6

// The search runs for seconds on a full cart. Handing the main thread back
// every so often is what lets the spinner actually animate — a synchronous
// loop would freeze the page and paint nothing.
function breathe(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

export async function findBestSplit(
  cart: CartItem[],
  maxOrdersOpt = DEFAULT_MAX_ORDERS,
  restarts = 40,
  onProgress?: (fraction: number) => void,
): Promise<SplitResult | null> {
  const atoms = toAtoms(cart)
  if (atoms.length === 0) return null

  const baseline = evaluate(atoms, new Array<number>(atoms.length).fill(0), 1)

  const maxOrders = Math.max(1, Math.min(maxOrdersOpt, atoms.length))

  const rand = mulberry32(atoms.length * 2654435761 + Math.round(baseline.totalCost))
  const byOrderCount: SplitPlan[] = []
  let best: SplitPlan | null = null

  const totalSeeds = maxOrders * (restarts + 1)
  let seedsDone = 0
  let lastBreath = Date.now()

  for (let k = 1; k <= maxOrders; k++) {
    let bestForK: SplitPlan | null = null

    const seeds: number[][] = [greedySeed(atoms, k)]
    for (let r = 0; r < restarts; r++) seeds.push(randomSeed(atoms, k, rand))

    for (const seed of seeds) {
      const { plan } = hillClimb(atoms, seed, k)
      if (isBetter(plan, bestForK)) bestForK = plan

      seedsDone += 1
      if (Date.now() - lastBreath > 50) {
        onProgress?.(seedsDone / totalSeeds)
        await breathe()
        lastBreath = Date.now()
      }
    }

    if (bestForK) {
      const slot = bestForK.orders.length
      if (isBetter(bestForK, byOrderCount[slot] ?? null)) byOrderCount[slot] = bestForK
      if (isBetter(bestForK, best)) best = bestForK
    }
  }

  onProgress?.(1)
  return { baseline, best: best ?? baseline, byOrderCount }
}
