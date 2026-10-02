export type ProductCategory = 'Designer' | 'Niche' | 'Arabic' | 'Signature'
export type ProductCurrency = 'NGN'

export type Product = {
  id: string
  name: string
  brand: string
  description: string
  family: string
  category: ProductCategory
  price: number
  currency: ProductCurrency
  size: string
  fragranceNotes: string[]
  image: string
  imageAlt: string
  featured: boolean
  tone: string
  badge?: string
}

export type CartItem = {
  product: Product
  quantity: number
}