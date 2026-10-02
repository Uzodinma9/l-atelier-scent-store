import { supabase, supabaseConfigurationError } from '../lib/supabase'
import type { Product, ProductCategory } from '../types'

type ProductRow = {
  id: string | number
  name: string | null
  brand: string | null
  description: string | null
  price: number | string | null
  image_url: string | null
  category: string | null
  stock: number | null
  featured: boolean | null
  created_at: string | null
}

function mapCategory(category: string, brand: string): ProductCategory {
  const normalizedCategory = category.toLocaleLowerCase()
  const normalizedBrand = brand.toLocaleLowerCase()

  if (normalizedBrand.includes("l'atelier") || normalizedCategory.includes('signature') || normalizedCategory.includes('atelier')) return 'Signature'
  if (normalizedCategory.includes('niche') || normalizedBrand.includes('tom ford')) return 'Niche'
  if (normalizedCategory.includes('arab') || ['lattafa', 'afnan', 'armaf'].some((house) => normalizedBrand.includes(house))) return 'Arabic'
  return 'Designer'
}

function toneForProduct(id: string): Product['tone'] {
  const tones: Product['tone'][] = ['amber', 'blue', 'green', 'rose']
  const hash = Array.from(id).reduce((value, character) => value + character.charCodeAt(0), 0)
  return tones[hash % tones.length]
}

function mapProduct(row: ProductRow): Product | null {
  const name = row.name?.trim()
  const brand = row.brand?.trim()
  const price = Number(row.price)
  if (!name || !brand || !Number.isFinite(price) || price < 0) return null

  const category = mapCategory(row.category?.trim() ?? '', brand)
  return {
    id: String(row.id),
    name,
    brand,
    description: row.description?.trim() ?? '',
    family: category === 'Signature' ? 'Signature fragrance' : 'Fragrance',
    category,
    price,
    currency: 'NGN',
    size: 'Size not listed',
    fragranceNotes: [],
    image: row.image_url?.trim() ?? '',
    imageAlt: `${brand} ${name} perfume bottle`,
    featured: Boolean(row.featured),
    tone: toneForProduct(String(row.id)),
    badge: row.featured ? 'Featured' : undefined,
  }
}

export async function loadProducts(): Promise<Product[]> {
  if (!supabase) {
    throw new Error(supabaseConfigurationError ?? 'Supabase is not configured.')
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, brand, description, price, image_url, category, stock, featured, created_at')
    .order('created_at', { ascending: true })

  if (error) throw new Error(`Could not load products: ${error.message}`)

  return ((data ?? []) as ProductRow[]).flatMap((row) => {
    const product = mapProduct(row)
    return product ? [product] : []
  })
}