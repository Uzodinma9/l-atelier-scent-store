import { createContext } from 'react'
import type { CartItem, Product } from '../types'

export type StoreContextValue = {
  products: Product[]
  productsLoading: boolean
  productsError: string | null
  refreshProducts: () => void
  cartItems: CartItem[]
  cartCount: number
  addToCart: (product: Product, quantity?: number) => void
  changeQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  wishlistIds: string[]
  toggleWishlist: (productId: string) => void
}

export const StoreContext = createContext<StoreContextValue | null>(null)